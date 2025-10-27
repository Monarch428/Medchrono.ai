import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

// Configure route to handle large files
export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes timeout

export async function POST(request: NextRequest) {
  try {
    const { documentIds } = await request.json()

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "Document IDs array is required" },
        { status: 400 }
      )
    }

    console.log(`Processing ${documentIds.length} documents in batch`)

    // Prepare FormData with multiple files
    const formData = new FormData()
    const filePromises = []

    // Download and prepare all documents
    for (const documentId of documentIds) {
      try {
        // Get document from database
        console.log("Fetching document:", documentId)
        const { data: document, error: fetchError } = await supabaseAdmin
          .from("documents")
          .select("*")
          .eq("id", documentId)
          .single()

        if (fetchError || !document) {
          console.error(`Document ${documentId} fetch error:`, fetchError)
          continue // Skip this document but continue with others
        }

        // Get file data from storage
        let fileData: Blob
        if (document.storage_path) {
          console.log("Downloading from storage:", document.storage_path)
          const { data: storageData, error: downloadError } = await supabaseAdmin.storage
            .from("documents")
            .download(document.storage_path)

          if (downloadError) {
            console.error(`Storage download error for ${documentId}:`, downloadError)
            continue // Skip this document but continue with others
          }
          fileData = storageData
        } else if (document.file_data) {
          fileData = new Blob([document.file_data])
        } else {
          console.error(`Document ${documentId} has no file_data or storage_path`)
          continue // Skip this document
        }

        // Add file to FormData
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const blob = new Blob([buffer], { type: document.file_type || "application/octet-stream" })
        formData.append("files", blob, document.filename)

        console.log("Prepared file for upload:", document.filename)
      } catch (docError) {
        console.error(`Error processing document ${documentId}:`, docError)
        // Continue with other documents
      }
    }

    // Call Python backend /process-documents-batch endpoint
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"
    console.log("Calling Python backend:", `${pythonBackendUrl}/process-documents-batch`)

    const response = await fetch(`${pythonBackendUrl}/process-documents-batch`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Python backend error: ${response.status} - ${errorText}`)
    }

    const chronologyData = await response.json()
    console.log("Python backend returned chronology data for batch")

    // Transform Python backend response
    // New endpoint returns: { success: true, data: { documents: [...] } }
    const documents = chronologyData?.data?.documents || []

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "No chronology data generated", details: "Python backend returned empty results" },
        { status: 500 }
      )
    }

    // Return all document analyses
    const analyses = documents.map((analysis: any) => ({
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
      fileName: analysis.file_name || "",
    }))

    return NextResponse.json({
      success: true,
      processedCount: documents.length,
      analyses,
    })
  } catch (error) {
    console.error("Batch chronology generation error:", error)

    return NextResponse.json(
      {
        error: "Batch chronology generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
