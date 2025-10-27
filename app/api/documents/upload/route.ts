import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

// Configure route to handle large files
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes timeout for large file uploads

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

    // Note: This endpoint is now deprecated in favor of direct upload to Supabase
    // Kept for backward compatibility only
    // For large files (>100MB), use /api/documents/get-upload-url instead

    console.log(`Processing file: ${file.name} (${file.size} bytes) for case: ${caseId}`)

    const arrayBuffer = await file.arrayBuffer()

    // Generate unique storage path
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const storagePath = `${caseId}/${timestamp}-${sanitizedFilename}`

    console.log("Uploading to Supabase Storage:", storagePath)

    // Upload to Supabase Storage (required for large files)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)

      // Check if the bucket exists
      if (uploadError.message?.includes("not found") || uploadError.message?.includes("bucket")) {
        return NextResponse.json(
          {
            error: "Storage bucket not configured",
            details:
              "The Supabase 'documents' storage bucket needs to be created. Please create it in your Supabase dashboard under Storage.",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        { error: "Failed to upload to storage", details: uploadError.message },
        { status: 500 },
      )
    }

    console.log("File uploaded to storage successfully, path:", uploadData.path)

    // Store metadata in database with storage reference
    // Note: If file_data is required (NOT NULL constraint), we need to handle it
    const documentData: any = {
      case_id: caseId, // This is TEXT in your current schema
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: uploadData.path,
      processing_status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // If file_data column has NOT NULL constraint, provide empty buffer
    // The actual file is in storage, this is just to satisfy the constraint
    documentData.file_data = Buffer.from([])

    const { data: document, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert(documentData)
      .select()
      .single()

    if (dbError) {
      console.error("Database insert failed:", dbError)
      // Clean up uploaded file
      try {
        await supabaseAdmin.storage.from("documents").remove([uploadData.path])
      } catch (cleanupError) {
        console.warn("Failed to cleanup uploaded file:", cleanupError)
      }
      return NextResponse.json(
        { error: "Failed to store document metadata", details: dbError.message },
        { status: 500 },
      )
    }

    console.log("Document stored successfully:", document.id)

    return NextResponse.json({
      success: true,
      documentId: document.id,
      message: "Document uploaded successfully",
      storagePath: uploadData.path,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
