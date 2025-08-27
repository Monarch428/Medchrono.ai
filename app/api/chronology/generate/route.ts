import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { caseId, documents } = await request.json()

    if (!caseId || !documents || documents.length === 0) {
      return NextResponse.json({ error: "Case ID and documents are required" }, { status: 400 })
    }

    // Get case information from database
    const { data: caseInfo, error: caseError } = await supabaseAdmin.from("cases").select("*").eq("id", caseId).single()

    if (caseError || !caseInfo) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Aggregate patient history from all documents
    const patientHistory = aggregatePatientHistory(documents)

    // Create comprehensive chronology template
    const { data: chronology, error: chronologyError } = await supabaseAdmin
      .from("chronology_templates")
      .insert({
        case_id: caseId,
        patient_name: caseInfo.client || "Patient Name",
        date_of_birth: caseInfo.dateOfBirth || "DD/MM/YYYY",
        case_details: `${caseInfo.type?.toUpperCase()} - ${caseInfo.incidentDate || "Date of Incident"}`,
        incident_date: caseInfo.incidentDate,
        past_medical_history: patientHistory.pastMedicalHistory.join(", ") || "To be extracted from medical records",
        past_surgical_history: patientHistory.pastSurgicalHistory.join(", ") || "To be extracted from medical records",
        family_history: patientHistory.familyHistory || "To be extracted from medical records",
        social_history: patientHistory.socialHistory || "To be extracted from medical records",
        allergies: patientHistory.allergies.join(", ") || "No known allergies",
      })
      .select()
      .single()

    if (chronologyError) {
      console.error("Error creating chronology:", chronologyError)
      return NextResponse.json({ error: "Failed to create chronology template" }, { status: 500 })
    }

    // Process each document and create detailed chronology entries
    const entries = []
    let pdfRefCounter = 1

    // Sort documents by date
    const sortedDocuments = documents.sort((a, b) => {
      const dateA = new Date(a.medical_data?.serviceDate || a.created_at)
      const dateB = new Date(b.medical_data?.serviceDate || b.created_at)
      return dateA.getTime() - dateB.getTime()
    })

    for (const doc of sortedDocuments) {
      const chronologyData = await extractDetailedChronologyFromDocument(doc, pdfRefCounter)

      if (chronologyData.entries && chronologyData.entries.length > 0) {
        for (const entry of chronologyData.entries) {
          const { data: entryData, error: entryError } = await supabaseAdmin
            .from("chronology_entries")
            .insert({
              chronology_id: chronology.id,
              entry_date: entry.date,
              provider_name: entry.provider,
              events: entry.events,
              pdf_reference: entry.pdfRef,
              document_id: doc.id,
              entry_type: entry.type,
            })
            .select()
            .single()

          if (!entryError) {
            entries.push(entryData)
          }
        }
      }

      pdfRefCounter += 10 // Increment PDF reference pages
    }

    // Add missing records entries
    const missingRecordsData = identifyMissingRecords(documents, caseInfo)
    for (const missing of missingRecordsData) {
      await supabaseAdmin.from("missing_records").insert({
        chronology_id: chronology.id,
        provider_name: missing.provider,
        date_range: missing.dateRange,
        records_required: missing.recordsRequired,
        significance: missing.significance,
      })
    }

    return NextResponse.json({
      success: true,
      chronology: {
        ...chronology,
        entries: entries.sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()),
      },
    })
  } catch (error) {
    console.error("Error generating chronology:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function aggregatePatientHistory(documents: any[]) {
  const history = {
    pastMedicalHistory: new Set(),
    pastSurgicalHistory: new Set(),
    allergies: new Set(),
    familyHistory: "",
    socialHistory: "",
  }

  for (const doc of documents) {
    if (doc.medical_data?.patientHistory) {
      const patientHx = doc.medical_data.patientHistory

      if (patientHx.pastMedicalHistory) {
        patientHx.pastMedicalHistory.forEach((condition: string) => history.pastMedicalHistory.add(condition))
      }

      if (patientHx.pastSurgicalHistory) {
        patientHx.pastSurgicalHistory.forEach((surgery: string) => history.pastSurgicalHistory.add(surgery))
      }

      if (patientHx.allergies) {
        patientHx.allergies.forEach((allergy: string) => history.allergies.add(allergy))
      }

      if (patientHx.socialHistory && !history.socialHistory) {
        history.socialHistory = patientHx.socialHistory
      }
    }
  }

  return {
    pastMedicalHistory: Array.from(history.pastMedicalHistory),
    pastSurgicalHistory: Array.from(history.pastSurgicalHistory),
    allergies: Array.from(history.allergies),
    familyHistory: history.familyHistory,
    socialHistory: history.socialHistory,
  }
}

async function extractDetailedChronologyFromDocument(document: any, pdfRefStart: number) {
  const entries = []
  const medicalData = document.medical_data || {}
  const keyFindings = document.key_findings || []
  const timelineEvents = document.timeline_events || []

  // Create detailed chronology entry based on document type
  let events = ""
  const serviceDate = medicalData.serviceDate || document.created_at?.split("T")[0]
  const provider = medicalData.provider || "Healthcare Provider"

  switch (medicalData.documentType) {
    case "police_report":
      events = formatPoliceReportEntry(keyFindings, medicalData, document.content)
      break
    case "ems":
      events = formatEMSEntry(keyFindings, medicalData, document.content)
      break
    case "er_visit":
      events = formatEREntry(keyFindings, medicalData, document.content)
      break
    case "pt":
      events = formatPTEntry(keyFindings, medicalData, document.content)
      break
    case "imaging":
      events = formatImagingEntry(keyFindings, medicalData, document.content)
      break
    default:
      events = formatGenericMedicalEntry(keyFindings, medicalData, document.content)
  }

  entries.push({
    date: serviceDate,
    provider: provider,
    events: events,
    pdfRef: `${pdfRefStart}-${pdfRefStart + 9}`,
    type: medicalData.documentType || "medical_record",
  })

  return { entries }
}

function formatPoliceReportEntry(findings: any[], medicalData: any, content: string) {
  return `Police Report:
Indiana Officer's Standard Crash Report:
Date of Crash: ${medicalData.serviceDate || "Date to be determined"}
${findings.map((f) => `• ${f.finding}`).join("\n")}

${content.substring(0, 500)}...`
}

function formatEMSEntry(findings: any[], medicalData: any, content: string) {
  const vitals = medicalData.vitalSigns || {}

  return `Emergency Medical Services (EMS)/Ambulance report:
Date of service: ${medicalData.serviceDate || "Date to be determined"}
Chief complaint: ${findings.find((f) => f.type === "symptom")?.finding || "Pain"}

Vitals:
${vitals.bloodPressure ? `BP ${vitals.bloodPressure}` : ""}
${vitals.heartRate ? `Heart rate: ${vitals.heartRate}` : ""}
${vitals.temperature ? `Temp ${vitals.temperature}` : ""}

Key findings:
${findings.map((f) => `• ${f.finding}`).join("\n")}

${content.substring(0, 500)}...`
}

function formatEREntry(findings: any[], medicalData: any, content: string) {
  const vitals = medicalData.vitalSigns || {}

  return `Emergency Room (ER) visit:
Date of service: ${medicalData.serviceDate || "Date to be determined"}
Provider: ${medicalData.provider || "Emergency Department"}

Vitals:
${vitals.bloodPressure ? `BP ${vitals.bloodPressure}` : ""}
${vitals.heartRate ? `Pulse ${vitals.heartRate}` : ""}
${vitals.temperature ? `Temp ${vitals.temperature}` : ""}

Assessment and findings:
${findings.map((f) => `• ${f.finding}`).join("\n")}

${content.substring(0, 500)}...`
}

function formatPTEntry(findings: any[], medicalData: any, content: string) {
  return `Physical therapy evaluation/treatment:
Date of service: ${medicalData.serviceDate || "Date to be determined"}
Provider: ${medicalData.provider || "Physical Therapy"}

Treatment focus:
${findings.map((f) => `• ${f.finding}`).join("\n")}

${content.substring(0, 500)}...`
}

function formatImagingEntry(findings: any[], medicalData: any, content: string) {
  return `Diagnostic imaging study:
Date of service: ${medicalData.serviceDate || "Date to be determined"}
Provider: ${medicalData.provider || "Radiology"}

Findings:
${findings.map((f) => `• ${f.finding}`).join("\n")}

${content.substring(0, 500)}...`
}

function formatGenericMedicalEntry(findings: any[], medicalData: any, content: string) {
  return `Medical visit:
Date of service: ${medicalData.serviceDate || "Date to be determined"}
Provider: ${medicalData.provider || "Healthcare Provider"}

Key findings:
${findings.map((f) => `• ${f.finding}`).join("\n")}

${content.substring(0, 500)}...`
}

function identifyMissingRecords(documents: any[], caseInfo: any) {
  const missingRecords = []
  const documentTypes = new Set(documents.map((doc) => doc.medical_data?.documentType))

  // Standard missing records for personal injury cases
  if (!documentTypes.has("police_report")) {
    missingRecords.push({
      provider: "Police Department",
      dateRange: caseInfo.incidentDate || "Date of incident",
      recordsRequired: "Police accident report",
      significance: "To establish liability and accident details",
    })
  }

  if (!documentTypes.has("ems")) {
    missingRecords.push({
      provider: "Emergency Medical Services",
      dateRange: caseInfo.incidentDate || "Date of incident",
      recordsRequired: "EMS/Ambulance records",
      significance: "To document immediate post-accident medical condition",
    })
  }

  // Always add pre-accident records as potentially missing
  missingRecords.push({
    provider: "N/A",
    dateRange: `Prior to ${caseInfo.incidentDate || "the incident"}`,
    recordsRequired: "Medical records prior to the incident",
    significance: "To establish baseline health condition before the incident",
  })

  return missingRecords
}
