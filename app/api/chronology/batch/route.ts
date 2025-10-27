import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import fs from "fs/promises"
import path from "path"

// Configure route to handle large files
export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes timeout

export async function POST(request: NextRequest) {
  const tempFiles: string[] = []

  try {
    const { documentIds } = await request.json()

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "Document IDs array is required" },
        { status: 400 }
      )
    }

    console.log(`Processing ${documentIds.length} documents in batch`)

    // Create documents directory
    const documentsDir = path.join(process.cwd(), "ai-backend", "app", "documents")
    await fs.mkdir(documentsDir, { recursive: true })

    // Download and save all documents to the folder
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

        // Save file temporarily
        const sanitizedFilename = document.filename.replace(/[^a-zA-Z0-9.-]/g, "_")
        const tempFilePath = path.join(documentsDir, sanitizedFilename)

        const arrayBuffer = await fileData.arrayBuffer()
        await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer))

        tempFiles.push(tempFilePath)
        console.log("Saved temporary file:", tempFilePath)
      } catch (docError) {
        console.error(`Error processing document ${documentId}:`, docError)
        // Continue with other documents
      }
    }

    if (tempFiles.length === 0) {
      return NextResponse.json(
        { error: "No documents could be downloaded and saved" },
        { status: 500 }
      )
    }

    console.log(`Successfully saved ${tempFiles.length} files, calling Python backend...`)

    // Call Python backend /summarize endpoint
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"
    console.log("Calling Python backend:", `${pythonBackendUrl}/summarize`)

    const response = await fetch(`${pythonBackendUrl}/summarize`, {
      method: "GET",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Python backend error: ${response.status} - ${errorText}`)
    }

    const chronologyData = await response.json()
    console.log("Python backend returned chronology data for", chronologyData?.data?.documents?.length, "documents")

    // Clean up all temporary files
    for (const tempFilePath of tempFiles) {
      try {
        await fs.unlink(tempFilePath)
        console.log("Cleaned up temporary file:", tempFilePath)
      } catch (cleanupError) {
        console.warn("Failed to cleanup temp file:", cleanupError)
      }
    }

    // Transform Python backend response
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

    // Clean up temporary files on error
    for (const tempFilePath of tempFiles) {
      try {
        await fs.unlink(tempFilePath)
      } catch (cleanupError) {
        console.warn("Failed to cleanup temp file on error:", cleanupError)
      }
    }

    return NextResponse.json(
      {
        error: "Batch chronology generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
