import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { caseId, storagePath, fileName, fileSize, fileType } = await request.json()

    // Validate inputs
    if (!caseId || !storagePath || !fileName) {
      return NextResponse.json(
        { error: "caseId, storagePath, and fileName are required" },
        { status: 400 }
      )
    }

    console.log(`Saving metadata for: ${fileName} in case: ${caseId}`)

    // Save metadata to database
    const documentData = {
      case_id: caseId,
      filename: fileName,
      file_type: fileType || "application/octet-stream",
      file_size: fileSize || 0,
      storage_path: storagePath,
      processing_status: "pending",
      file_data: Buffer.from([]), // Empty buffer to satisfy NOT NULL constraint
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: document, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert(documentData)
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Failed to save document metadata",
          details: dbError.message,
        },
        { status: 500 }
      )
    }

    console.log("Document metadata saved with ID:", document.id)

    return NextResponse.json({
      success: true,
      documentId: document.id,
      document,
    })
  } catch (error) {
    console.error("Server error saving metadata:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
