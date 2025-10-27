import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import fs from "fs/promises"
import path from "path"

// Configure route to handle large files
export const runtime = "nodejs"
export const maxDuration = 300 // 5 minutes timeout

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null

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

    // Create temporary directory for Python backend to access
    const documentsDir = path.join(process.cwd(), "ai-backend", "app", "documents")
    await fs.mkdir(documentsDir, { recursive: true })

    // Save file temporarily
    const sanitizedFilename = document.filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    tempFilePath = path.join(documentsDir, sanitizedFilename)

    const arrayBuffer = await fileData.arrayBuffer()
    await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer))

    console.log("Saved temporary file:", tempFilePath)

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
    console.log("Python backend returned chronology data")

    // Clean up temporary file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
        console.log("Cleaned up temporary file")
      } catch (cleanupError) {
        console.warn("Failed to cleanup temp file:", cleanupError)
      }
    }

    // Transform Python backend response to match expected format
    // Python backend returns: { data: { documents: [...] } }
    const documents = chronologyData?.data?.documents || []

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "No chronology data generated", details: "Python backend returned empty results" },
        { status: 500 }
      )
    }

    // Get the first document's analysis (assuming single file)
    const analysis = documents[0]

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

    // Clean up temporary file on error
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
      } catch (cleanupError) {
        console.warn("Failed to cleanup temp file on error:", cleanupError)
      }
    }

    return NextResponse.json(
      {
        error: "Chronology generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
