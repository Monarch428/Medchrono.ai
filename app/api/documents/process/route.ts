import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configure route to handle large file processing
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes timeout for AI processing

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        { error: "Server configuration error", details: "Missing Supabase credentials" },
        { status: 500 },
      )
    }

    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Get document from database
    console.log("Fetching document with ID:", documentId)
    const { data: document, error: fetchError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single()

    if (fetchError) {
      console.error("Document fetch error:", fetchError)
      return NextResponse.json(
        { error: "Document not found", details: fetchError.message },
        { status: 404 },
      )
    }

    if (!document) {
      console.error("No document returned for ID:", documentId)
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    console.log("Document found:", document.filename)

    // Update status to processing
    await supabaseAdmin.from("documents").update({ processing_status: "processing" }).eq("id", documentId)

    // Get file data - check if it's stored in database or storage
    let fileData: Blob

    if (document.file_data) {
      // File is stored directly in database
      console.log("Reading file data from database")
      fileData = new Blob([document.file_data])
    } else if (document.storage_path) {
      // File is stored in Supabase Storage
      console.log("Downloading file from storage path:", document.storage_path)
      const { data: storageData, error: downloadError } = await supabaseAdmin.storage
        .from("documents")
        .download(document.storage_path)

      if (downloadError) {
        console.error("File download error:", downloadError)
        return NextResponse.json({
          error: "Failed to retrieve file for processing",
          details: downloadError.message
        }, { status: 500 })
      }

      fileData = storageData
      console.log("File downloaded successfully from storage")
    } else {
      console.error("Document has no file_data or storage_path:", document)
      return NextResponse.json(
        {
          error: "Document file not found",
          details: "The document record is missing both file_data and storage_path. Please re-upload the document."
        },
        { status: 500 },
      )
    }

    let extractedText = ""
    let keyFindings: any[] = []
    let timelineEvents: any[] = []
    let medicalData: any = {}
    let missingRecords: any[] = []

    if (document.file_type.includes("image")) {
      // Process image with OpenAI Vision
      const arrayBuffer = await fileData.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this medical document. Focus on medical findings, diagnoses, treatments, medications, dates, and provider information. Return the complete text content.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${document.file_type};base64,${base64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
      })

      extractedText = response.choices[0]?.message?.content || ""
    } else if (document.file_type === "application/pdf") {
      // Extract text from PDF using multiple methods
      console.log("Extracting text from PDF...")

      // Try pdf-parse first (more reliable for complex PDFs)
      try {
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Try pdf-parse library first (better for complex PDFs)
        try {
          console.log("Attempting pdf-parse extraction...")
          const pdfParse = require("pdf-parse")
          const pdfData = await pdfParse(buffer)
          extractedText = pdfData.text.trim()
          console.log(`PDF-parse extracted ${extractedText.length} characters from PDF`)

          // Log a sample for debugging
          if (extractedText.length > 0) {
            console.log("Extracted text sample:", extractedText.substring(0, 500))
          }
        } catch (parseError: any) {
          console.warn("pdf-parse failed:", parseError?.message || String(parseError))
          console.log("Attempting pdf2json fallback...")

          // Fallback to pdf2json
          const PDFParser = (await import("pdf2json")).default
          const pdfParser = new PDFParser()

          const pdfText = await new Promise<string>((resolve, reject) => {
            let extractedContent = ""
            const timeout = setTimeout(() => {
              reject(new Error("PDF parsing timeout after 30 seconds"))
            }, 30000)

            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
              clearTimeout(timeout)
              try {
                if (pdfData.Pages) {
                  for (const page of pdfData.Pages) {
                    if (page.Texts) {
                      for (const text of page.Texts) {
                        if (text.R && text.R[0] && text.R[0].T) {
                          extractedContent += decodeURIComponent(text.R[0].T) + " "
                        }
                      }
                    }
                    extractedContent += "\n"
                  }
                }
                resolve(extractedContent)
              } catch (err) {
                reject(err)
              }
            })

            pdfParser.on("pdfParser_dataError", (error: any) => {
              clearTimeout(timeout)
              reject(error)
            })

            pdfParser.parseBuffer(buffer)
          })

          extractedText = pdfText.trim()
          console.log(`PDF2json extracted ${extractedText.length} characters`)
        }

        // If still no meaningful text, try OCR with OpenAI Vision
        if (!extractedText || extractedText.trim().length < 100) {
          console.warn("Minimal text extracted, using OpenAI Vision for OCR")
          const base64 = buffer.toString("base64")

          const visionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract ALL text from this PDF page. Focus on medical information, dates, names, diagnoses, treatments, and any other readable text. Return the complete text content.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:application/pdf;base64,${base64}`,
                      detail: "high",
                    },
                  },
                ],
              },
            ],
            max_tokens: 4000,
          })

          extractedText = visionResponse.choices[0]?.message?.content || extractedText
          console.log(`OpenAI Vision OCR extracted ${extractedText.length} characters`)
        }

        if (!extractedText || extractedText.trim().length < 50) {
          console.warn("Still minimal content after all extraction attempts")
          extractedText = `PDF Document: ${document.filename}

Unable to extract sufficient text from this PDF using automated methods.
This may be a scanned image, corrupted file, or use unsupported PDF features.

File size: ${Math.round(document.file_size / 1024)} KB

Recommendations:
- Verify the PDF opens correctly in a PDF viewer
- If scanned, use OCR software to create searchable PDF
- Try converting to high-quality images (JPG/PNG) for better AI analysis`
        }
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError)
        extractedText = `PDF Document: ${document.filename}

Error extracting text from PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}
File size: ${Math.round(document.file_size / 1024)} KB

The file may be corrupted, password-protected, or use unsupported PDF features.
Please verify the file integrity and try again.`
      }
    } else {
      // For text files
      const arrayBuffer = await fileData.arrayBuffer()
      extractedText = new TextDecoder().decode(arrayBuffer)
    }

    if (extractedText && process.env.OPENAI_API_KEY) {
      try {
        const analysisResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert medical chronology analyst specializing in personal injury cases. Extract detailed medical information from documents.

IMPORTANT: Extract actual dates from the document. Do NOT return placeholder text like "YYYY-MM-DD" - return the actual date found or null if no date exists.

Return a JSON object with this exact structure:
{
  "documentType": "police_report|ems|er_visit|office_visit|pt|imaging|lab_results|surgical_report|discharge_summary",
  "serviceDate": "actual date in YYYY-MM-DD format (e.g., \"2024-03-15\") or null if truly not found",
  "provider": "provider name and credentials",
  "keyFindings": [
    {
      "type": "diagnosis|symptom|treatment|medication|test_result|vital_sign",
      "finding": "specific medical finding",
      "significance": "high|medium|low",
      "bodyPart": "affected body part or null"
    }
  ],
  "timelineEvents": [
    {
      "date": "actual date in YYYY-MM-DD format (e.g., \"2024-03-15\")",
      "time": "actual time in HH:MM format (e.g., \"14:30\") or null if not found",
      "event": "detailed description of what happened",
      "type": "incident|treatment|diagnosis|test|follow_up|admission|discharge"
    }
  ],
  "patientHistory": {
    "pastMedicalHistory": ["list of conditions"],
    "pastSurgicalHistory": ["list of surgeries"],
    "medications": ["current medications"],
    "allergies": ["known allergies"],
    "socialHistory": "smoking, alcohol, occupation details"
  },
  "vitalSigns": {
    "bloodPressure": "systolic/diastolic or null",
    "heartRate": "bpm or null",
    "temperature": "degrees F or null",
    "respiratoryRate": "per minute or null",
    "oxygenSaturation": "percentage or null"
  },
  "missingRecords": [
    {
      "type": "type of missing record needed",
      "significance": "why this record is important for the personal injury case",
      "urgency": "high|medium|low"
    }
  ]
}`,
            },
            {
              role: "user",
              content: `Analyze this medical document for a personal injury chronology. Extract all relevant medical information:

Document: ${document.filename}
Content: ${extractedText.substring(0, 8000)}

CRITICAL INSTRUCTIONS:
1. Extract ACTUAL dates from the document - look for any date references (service dates, visit dates, incident dates, etc.)
2. Do NOT use placeholder text like "YYYY-MM-DD" or "HH:MM" - use real dates found in the document
3. If no date is found, use null instead of placeholders
4. Look for dates in various formats: MM/DD/YYYY, DD-MM-YYYY, written dates, etc.

Focus on extracting:
1. Specific diagnoses, symptoms, and medical conditions
2. Treatments, procedures, medications, and therapies
3. Timeline of events with ACTUAL precise dates and times from the document
4. Provider information and medical facility details
5. Patient history and pre-existing conditions
6. Test results, vital signs, and clinical findings
7. Any references to the injury incident or accident
8. Missing records that would be valuable for the case`,
            },
          ],
          max_tokens: 3000,
        })

        let analysisText = analysisResponse.choices[0]?.message?.content || ""

        // Remove markdown code blocks if present
        analysisText = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()

        try {
          const analysis = JSON.parse(analysisText)

          keyFindings = analysis.keyFindings || []
          timelineEvents = analysis.timelineEvents || []
          missingRecords = analysis.missingRecords || []

          medicalData = {
            documentType: analysis.documentType || "medical_record",
            serviceDate: analysis.serviceDate,
            provider: analysis.provider || "Healthcare Provider",
            patientHistory: analysis.patientHistory || {},
            vitalSigns: analysis.vitalSigns || {},
            analysisComplete: true,
            processingDate: new Date().toISOString(),
          }
        } catch (parseError) {
          console.error("Failed to parse AI analysis:", parseError)
          keyFindings = extractEnhancedFindings(extractedText)
          timelineEvents = extractEnhancedTimeline(extractedText, document.filename)
          medicalData = {
            documentType: determineDocumentType(document.filename, extractedText),
            provider: extractProvider(extractedText),
            analysisComplete: false,
            processingDate: new Date().toISOString(),
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError)
        // Fallback to enhanced basic processing
        keyFindings = extractEnhancedFindings(extractedText)
        timelineEvents = extractEnhancedTimeline(extractedText, document.filename)
        medicalData = {
          documentType: determineDocumentType(document.filename, extractedText),
          provider: extractProvider(extractedText),
          analysisComplete: false,
          processingDate: new Date().toISOString(),
        }
      }
    }

    // Update document with processing results
    // Only update fields that exist in the schema
    const updateData: any = {
      processing_status: "completed",
      updated_at: new Date().toISOString(),
    }

    // Add optional fields if they exist in schema
    if (extractedText) updateData.extracted_text = extractedText
    if (keyFindings.length > 0) updateData.key_findings = keyFindings
    if (timelineEvents.length > 0) updateData.timeline_events = timelineEvents
    if (Object.keys(medicalData).length > 0) updateData.medical_data = medicalData
    if (missingRecords.length > 0) updateData.missing_records = missingRecords

    console.log("Updating document with fields:", Object.keys(updateData))

    const { error: updateError } = await supabaseAdmin
      .from("documents")
      .update(updateData)
      .eq("id", documentId)

    if (updateError) {
      console.error("Update error:", updateError)
      console.error("Update error details:", JSON.stringify(updateError, null, 2))
      return NextResponse.json({
        error: "Failed to update document",
        details: updateError.message
      }, { status: 500 })
    }

    console.log("Document updated successfully")

    // Try to insert processing log (non-critical, don't fail if table doesn't exist)
    try {
      await supabaseAdmin.from("document_processing_logs").insert({
        document_id: documentId,
        step_name: "AI Analysis Complete",
        status: "completed",
        message: `Extracted ${keyFindings.length} findings, ${timelineEvents.length} timeline events from ${document.filename}`,
      })
    } catch (logError) {
      console.warn("Could not insert processing log (table may not exist):", logError)
    }

    return NextResponse.json({
      success: true,
      extractedText: extractedText.substring(0, 1000), // Limit response size
      keyFindings,
      timelineEvents,
      medicalData,
      missingRecords,
    })
  } catch (error) {
    console.error("Processing error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function extractEnhancedFindings(text: string) {
  const findings = []
  const medicalPatterns = [
    { pattern: /diagnosis|diagnosed with|impression:|assessment:/i, type: "diagnosis", significance: "high" },
    { pattern: /pain|ache|discomfort|soreness|tenderness/i, type: "symptom", significance: "high" },
    { pattern: /treatment|therapy|procedure|surgery|operation/i, type: "treatment", significance: "medium" },
    { pattern: /medication|prescribed|drug|dosage|mg|ml/i, type: "medication", significance: "medium" },
    { pattern: /test|exam|study|scan|x-ray|mri|ct|ultrasound/i, type: "test_result", significance: "medium" },
    { pattern: /blood pressure|heart rate|temperature|pulse|bp:/i, type: "vital_sign", significance: "low" },
    { pattern: /fracture|break|tear|sprain|strain|injury/i, type: "diagnosis", significance: "high" },
  ]

  for (const pattern of medicalPatterns) {
    const matches = text.match(new RegExp(pattern.pattern.source, "gi"))
    if (matches) {
      findings.push({
        type: pattern.type,
        finding: `${pattern.type.replace("_", " ")} documented: ${matches[0]}`,
        significance: pattern.significance,
        bodyPart: extractBodyPart(text, matches[0]),
      })
    }
  }

  return findings
}

function extractEnhancedTimeline(text: string, filename: string) {
  const events = []
  const datePatterns = [/\d{1,2}\/\d{1,2}\/\d{4}/g, /\d{4}-\d{2}-\d{2}/g, /\d{1,2}-\d{1,2}-\d{4}/g]

  let dates: string[] = []
  for (const pattern of datePatterns) {
    const matches = text.match(pattern)
    if (matches) dates = [...dates, ...matches]
  }

  if (dates.length > 0) {
    events.push({
      date: dates[0],
      time: extractTime(text),
      event: `Medical documentation: ${filename}`,
      type: determineEventType(filename, text),
    })
  }

  return events
}

function extractBodyPart(_text: string, context: string) {
  const bodyParts = [
    "head",
    "neck",
    "back",
    "spine",
    "shoulder",
    "arm",
    "hand",
    "chest",
    "abdomen",
    "hip",
    "leg",
    "knee",
    "ankle",
    "foot",
  ]
  const contextLower = context.toLowerCase()

  for (const part of bodyParts) {
    if (contextLower.includes(part)) return part
  }

  return null
}

function extractTime(text: string) {
  const timePattern = /\d{1,2}:\d{2}(?:\s?[AP]M)?/i
  const match = text.match(timePattern)
  return match ? match[0] : null
}

function determineEventType(filename: string, text: string) {
  const lowerFilename = filename.toLowerCase()
  const lowerText = text.toLowerCase()

  if (lowerFilename.includes("police") || lowerText.includes("accident")) return "incident"
  if (lowerFilename.includes("ambulance") || lowerText.includes("ems")) return "treatment"
  if (lowerFilename.includes("emergency") || lowerText.includes("er")) return "treatment"
  if (lowerFilename.includes("discharge")) return "discharge"
  if (lowerFilename.includes("admission")) return "admission"
  if (lowerText.includes("follow") || lowerText.includes("appointment")) return "follow_up"

  return "documentation"
}

function determineDocumentType(filename: string, text: string) {
  const lowerFilename = filename.toLowerCase()
  const lowerText = text.toLowerCase()

  if (lowerFilename.includes("police") || lowerText.includes("police report")) return "police_report"
  if (lowerFilename.includes("ambulance") || lowerText.includes("ems")) return "ems"
  if (lowerFilename.includes("emergency") || lowerText.includes("emergency room")) return "er_visit"
  if (lowerFilename.includes("pt") || lowerText.includes("physical therapy")) return "pt"
  if (lowerFilename.includes("imaging") || lowerText.includes("ct scan|mri|x-ray")) return "imaging"
  if (lowerFilename.includes("lab") || lowerText.includes("laboratory")) return "lab_results"
  if (lowerFilename.includes("surgical") || lowerText.includes("surgery")) return "surgical_report"
  if (lowerFilename.includes("discharge")) return "discharge_summary"

  return "office_visit"
}

function extractProvider(text: string) {
  const providerPatterns = [
    /Dr\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(M\.?D\.?|D\.?O\.?|PA-C|NP|RN)/,
    /Physician:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /Provider:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
  ]

  for (const pattern of providerPatterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }

  return "Healthcare Provider"
}
