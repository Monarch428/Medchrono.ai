import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const caseData = await request.json()

    // Validate required fields
    const requiredFields = [
      "caseName",
      "clientName",
      "incidentDate",
      "representingParty",
      "caseStatus",
      "assignedAttorney",
    ]

    for (const field of requiredFields) {
      if (!caseData[field] || caseData[field].trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate case name format (3-50 characters, alphanumeric with spaces and dashes)
    if (caseData.caseName.length < 3 || caseData.caseName.length > 50) {
      return NextResponse.json(
        { error: "Case name must be between 3 and 50 characters" },
        { status: 400 }
      )
    }

    // Validate incident date is not in the future
    const incidentDate = new Date(caseData.incidentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (incidentDate > today) {
      return NextResponse.json(
        { error: "Incident date cannot be in the future" },
        { status: 400 }
      )
    }

    // Validate primary injury if provided
    if (!caseData.primaryInjury) {
      return NextResponse.json(
        { error: "Primary injury category is required" },
        { status: 400 }
      )
    }

    // Insert case into database
    const { data: newCase, error: insertError } = await supabaseAdmin
      .from("cases")
      .insert({
        case_name: caseData.caseName,
        client_name: caseData.clientName,
        incident_date: caseData.incidentDate,
        representing_party: caseData.representingParty,
        case_status: caseData.caseStatus,
        assigned_attorney: caseData.assignedAttorney,
        priority_level: caseData.priorityLevel || "normal",
        case_description: caseData.caseDescription || null,
        primary_injury: caseData.primaryInjury,
        sub_category: caseData.subCategory || null,
        body_systems: caseData.bodySystems || [],
        progress: 0,
        last_activity: "Case created",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Database insert error:", insertError)
      return NextResponse.json(
        {
          error: "Failed to create case",
          details: insertError.message,
        },
        { status: 500 }
      )
    }

    console.log("Case created successfully:", newCase.id)

    // Return the case with string ID for compatibility with TEXT case_id in documents table
    return NextResponse.json({
      success: true,
      case: {
        ...newCase,
        id: String(newCase.id), // Convert UUID to string for documents table compatibility
      },
      message: "Case created successfully",
    })
  } catch (error) {
    console.error("Case creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create case",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("id")

    if (caseId) {
      // Get single case
      const { data: caseData, error } = await supabaseAdmin
        .from("cases")
        .select("*")
        .eq("id", caseId)
        .single()

      if (error) {
        return NextResponse.json(
          { error: "Case not found", details: error.message },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, case: caseData })
    } else {
      // Get all cases
      const { data: cases, error } = await supabaseAdmin
        .from("cases")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch cases", details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, cases })
    }
  } catch (error) {
    console.error("Case fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch cases",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Case ID is required" },
        { status: 400 }
      )
    }

    const { data: updatedCase, error: updateError } = await supabaseAdmin
      .from("cases")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update case", details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      case: updatedCase,
      message: "Case updated successfully",
    })
  } catch (error) {
    console.error("Case update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update case",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
