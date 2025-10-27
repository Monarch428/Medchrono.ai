import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { fileName, caseId, fileSize } = await request.json()

    // Validate inputs
    if (!fileName || !caseId) {
      return NextResponse.json(
        { error: "fileName and caseId are required" },
        { status: 400 }
      )
    }

    console.log(`Creating signed upload URL for: ${fileName} (${fileSize} bytes) in case: ${caseId}`)

    // Generate unique file path
    const timestamp = Date.now()
    const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
    const storagePath = `${caseId}/${timestamp}-${sanitizedFilename}`

    // Create signed upload URL (expires in 1 hour)
    const { data, error } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUploadUrl(storagePath)

    if (error) {
      console.error("Failed to create signed upload URL:", error)
      return NextResponse.json(
        { error: "Failed to create upload URL", details: error.message },
        { status: 500 }
      )
    }

    console.log("Signed upload URL created successfully:", storagePath)

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: storagePath,
      token: data.token,
    })
  } catch (error) {
    console.error("Server error creating upload URL:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
