import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting document upload...")

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get("file") as File
    const caseId = formData.get("caseId") as string

    // Validate inputs
    if (!file || !file.name) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    // Check file size (10MB limit for database storage)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB for database storage` },
        { status: 413 },
      )
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes) for case: ${caseId}`)

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const { data: document, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        case_id: caseId,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        file_data: fileBuffer,
        processing_status: "pending",
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert failed:", dbError)
      return NextResponse.json(
        { error: "Failed to store document in database", details: dbError.message },
        { status: 500 },
      )
    }

    console.log("Document stored successfully in database:", document.id)

    return NextResponse.json({
      success: true,
      documentId: document.id,
      message: "Document uploaded and stored in database successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
