import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

// Configure route to handle large files
export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes timeout

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Get document from database
    console.log("Fetching document for chronology:", documentId)
    const { data: document, error: fetchError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single()

    if (fetchError || !document) {
      console.error("Document fetch error:", fetchError)
      return NextResponse.json(
        { error: "Document not found", details: fetchError?.message },
        { status: 404 }
      )
    }

    // Get file data from storage
    let fileData: Blob
    if (document.storage_path) {
      console.log("Downloading from storage:", document.storage_path)
      const { data: storageData, error: downloadError } = await supabaseAdmin.storage
        .from("documents")
        .download(document.storage_path)

      if (downloadError) {
        console.error("Storage download error:", downloadError)
        return NextResponse.json(
          { error: "Failed to retrieve file", details: downloadError.message },
          { status: 500 }
        )
      }
      fileData = storageData
    } else if (document.file_data) {
      fileData = new Blob([document.file_data])
    } else {
      return NextResponse.json(
        { error: "Document file not found in storage or database" },
        { status: 404 }
      )
    }

    // Prepare file for upload to Python backend
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create FormData for file upload
    const formData = new FormData()
    const blob = new Blob([buffer], { type: document.file_type || "application/octet-stream" })
    formData.append("file", blob, document.filename)

    console.log("Uploading file to Python backend:", document.filename)

    // Call Python backend /process-document endpoint with file upload
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"
    console.log("Calling Python backend:", `${pythonBackendUrl}/process-document`)

    const response = await fetch(`${pythonBackendUrl}/process-document`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Python backend error: ${response.status} - ${errorText}`)
    }

    const chronologyData = await response.json()
    console.log("Python backend returned chronology data")

    // Transform Python backend response to match expected format
    // New endpoint returns: { success: true, data: {...} }
    if (!chronologyData.success || !chronologyData.data) {
      return NextResponse.json(
        { error: "No chronology data generated", details: "Python backend returned empty results" },
        { status: 500 }
      )
    }

    // Get the document's analysis
    const analysis = chronologyData.data

    // Map Python backend fields to our format
    const chronology = {
      success: true,
      documentType: analysis.report_type || "Medical Record",
      provider: analysis.report_author || analysis.issued_by || "Healthcare Provider",
      dateOfService: analysis.issued_date !== "Unknown" ? analysis.issued_date : null,
      keyFindings: (analysis.case_summary_points || []).map((point: string, index: number) => ({
        type: "finding",
        finding: point,
        significance: index < 3 ? "high" : "medium",
        bodyPart: null,
      })),
      timelineEvents: [
        {
          date: analysis.issued_date !== "Unknown" ? analysis.issued_date : null,
          time: null,
          event: analysis.case_overview || analysis.full_summary || "Document processed",
          type: "documentation",
        },
      ],
      medicalData: {
        documentType: analysis.report_type || "medical_record",
        serviceDate: analysis.issued_date !== "Unknown" ? analysis.issued_date : null,
        provider: analysis.report_author || analysis.issued_by || "Healthcare Provider",
        clientInfo: analysis.client_or_subject_info || {},
        keyIssues: analysis.key_issues_or_complaints || [],
        observations: analysis.observations_or_data || [],
        actionsTaken: analysis.actions_taken || [],
        caseOverview: analysis.case_overview || "",
        fullSummary: analysis.full_summary || "",
        caseSummaryPoints: analysis.case_summary_points || [],
        analysisComplete: true,
        processingDate: new Date().toISOString(),
      },
      extractedText: analysis.full_summary || "",
    }

    return NextResponse.json(chronology)
  } catch (error) {
    console.error("Chronology generation error:", error)

    return NextResponse.json(
      {
        error: "Chronology generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
