import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Get document from database
    const { data: document, error } = await supabaseAdmin.from("documents").select("*").eq("id", documentId).single()

    if (error || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Return document data for review
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        fileType: document.file_type,
        fileSize: document.file_size,
        content: document.content,
        keyFindings: document.key_findings,
        timelineEvents: document.timeline_events,
        medicalData: document.medical_data,
        processingStatus: document.processing_status,
        uploadDate: document.upload_date,
      },
    })
  } catch (error) {
    console.error("Review error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
