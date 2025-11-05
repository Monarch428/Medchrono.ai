import { NextResponse } from "next/server"

import { supabaseAdmin } from "@/lib/supabase/server"

type RegisterPayload = {
  userId: string
  firmName: string
  attorneyName: string
  barNumber: string
  phone: string
  caseVolume?: string
  firmSize?: string
  marketingOptIn?: boolean
  hipaaAgreed?: boolean
  dpaAgreed?: boolean
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload

    if (!payload.userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const timestamp = new Date().toISOString()

    const { error: profileError } = await supabaseAdmin.from("user_profiles").upsert({
      id: payload.userId,
      full_name: payload.attorneyName,
      bar_number: payload.barNumber,
      phone: payload.phone,
      marketing_opt_in: payload.marketingOptIn ?? false,
      hipaa_agreed: payload.hipaaAgreed ?? false,
      dpa_agreed: payload.dpaAgreed ?? false,
      updated_at: timestamp,
    })

    if (profileError) {
      console.error("Failed to persist user profile:", profileError)
      return NextResponse.json(
        { error: "Unable to save user profile", details: profileError.message },
        { status: 500 },
      )
    }

    const { error: firmError } = await supabaseAdmin.from("firm_profiles").upsert({
      user_id: payload.userId,
      firm_name: payload.firmName,
      firm_size: payload.firmSize ?? null,
      case_volume: payload.caseVolume ?? null,
      phone: payload.phone,
      updated_at: timestamp,
    })

    if (firmError) {
      console.error("Failed to persist firm profile:", firmError)
      return NextResponse.json(
        { error: "Unable to save firm profile", details: firmError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Registration persistence error:", error)
    return NextResponse.json(
      {
        error: "Registration persistence failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
