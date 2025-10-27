"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DocumentChatbot } from "@/components/DocumentChatbot"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileText,
  ImageIcon,
  File,
  X,
  CheckCircle,
  AlertTriangle,
  Brain,
  ZoomIn,
  ZoomOut,
  Flag,
  Edit3,
  Save,
  Eye,
  Home,
} from "lucide-react"
import Link from "next/link"

interface QualityFlag {
  type: "blurry" | "incomplete" | "illegible" | "missing_pages" | "poor_scan" | "upside_down" | "processing_error"
  severity: "low" | "medium" | "high"
  description: string
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: "uploading" | "processing" | "complete" | "error"
  confidence?: number
  category?: string
  processingStep?: number
  qualityFlags?: QualityFlag[]
  extractedData?: {
    provider?: string
    dateOfService?: string
    patientName?: string
    documentType?: string
    pageCount?: number
    medicalTerminology?: string[]
    keyFindings?: string[]
    bodySystemsAffected?: string[]
    treatmentProvided?: string[]
    diagnosisCodes?: string[]
    timeline?: Array<{ date: string; event: string }>
    missingInformation?: string[]
  }
  file?: File // Store the actual file for processing
  documentId?: string
  error?: string
}

const documentCategories = [
  "Emergency Treatment",
  "Hospital Records",
  "Physician Records",
  "Diagnostic Imaging",
  "Laboratory Results",
  "Therapy Records",
  "Pharmacy Records",
  "Insurance Documentation",
  "Legal Documents",
]

const commonProviders = [
  "Metro Hospital",
  "City Medical Center",
  "Regional Health System",
  "University Hospital",
  "Community Health Center",
  "Emergency Medical Associates",
  "Radiology Partners",
  "Laboratory Corp",
  "Quest Diagnostics",
  "Physical Therapy Associates",
]

const processingSteps = [
  { id: 1, name: "Document Ingestion", description: "Receiving and validating file" },
  { id: 2, name: "OCR Processing", description: "Converting to searchable text" },
  { id: 3, name: "Medical Terminology Extraction", description: "Identifying medical terms and codes" },
  { id: 4, name: "Document Type Identification", description: "Classifying document category" },
  { id: 5, name: "Date & Provider Recognition", description: "Extracting key metadata" },
  { id: 6, name: "Categorization & Filing", description: "Final classification and storage" },
]

const DocumentUpload = () => {
  const searchParams = useSearchParams()
  const caseIdFromUrl = searchParams?.get("caseId") || ""

  const [selectedCase, setSelectedCase] = useState(caseIdFromUrl)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<any>({})
  const [storedCases, setStoredCases] = useState<any[]>([])
  const [isGeneratingChronology, setIsGeneratingChronology] = useState(false)
  const [chronologyData, setChronologyData] = useState<any>(null)

  // Set case from URL on mount
  useEffect(() => {
    if (caseIdFromUrl) {
      setSelectedCase(caseIdFromUrl)
      console.log("📌 Case ID from URL:", caseIdFromUrl)
    }
  }, [caseIdFromUrl])

  // Load real cases from API instead of localStorage
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("/api/cases")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.cases) {
            // Map API response to match expected format
            const mappedCases = data.cases.map((c: any) => ({
              id: String(c.id), // Convert UUID to string for TEXT case_id compatibility
              name: c.case_name,
              client: c.client_name,
            }))
            setStoredCases(mappedCases)
          }
        } else {
          console.error("Failed to fetch cases from API")
          // Fallback to localStorage if API fails
          const cases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
          setStoredCases(cases)
        }
      } catch (error) {
        console.error("Error fetching cases:", error)
        // Fallback to localStorage if API fails
        const cases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
        setStoredCases(cases)
      }
    }

    fetchCases()
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

  const handleFiles = (files: File[]) => {
    // With direct upload to Supabase, we can support much larger files
    // Supabase free tier supports up to 50GB, but we'll limit to 2GB for practical reasons
    const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2GB limit

    const newFiles: UploadedFile[] = files.map((file, index) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return {
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 100,
          status: "error" as const,
          processingStep: 0,
          error: `File too large! Maximum: 2GB, Your file: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB. Please split the file.`,
          qualityFlags: [
            {
              type: "processing_error" as any,
              severity: "high" as const,
              description: `File exceeds 2GB limit (${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB)`,
            },
          ],
        }
      }

      return {
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading" as const,
        processingStep: 0,
        file, // Store the actual file for AI processing
      }
    })

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Only process files that are not too large
    newFiles.forEach((uploadedFile) => {
      if (uploadedFile.status !== "error" && uploadedFile.file) {
        processFileWithAI(uploadedFile)
      }
    })
  }

  const generateComprehensiveChronology = async () => {
    if (uploadedFiles.length === 0) return

    setIsGeneratingChronology(true)

    try {
      // Collect all processed documents with FULL data including Python backend results
      const processedDocs = uploadedFiles.filter((file) => file.status === "complete" && file.extractedData && file.documentId)

      if (processedDocs.length === 0) {
        alert("No processed documents available for chronology generation")
        return
      }

      // Try batch processing with Python backend for comprehensive analysis
      if (processedDocs.length > 1) {
        try {
          console.log("Attempting batch processing with Python backend for", processedDocs.length, "documents")
          const batchResponse = await fetch("/api/chronology/batch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentIds: processedDocs.map((doc) => doc.documentId),
            }),
          })

          if (batchResponse.ok) {
            const batchResult = await batchResponse.json()
            console.log("Batch processing successful:", batchResult)

            // Update files with batch processing results
            if (batchResult.analyses && batchResult.analyses.length > 0) {
              batchResult.analyses.forEach((analysis: any, index: number) => {
                const fileIndex = uploadedFiles.findIndex((f) => f.documentId === processedDocs[index]?.documentId)
                if (fileIndex !== -1) {
                  setUploadedFiles((prev) =>
                    prev.map((f, idx) =>
                      idx === fileIndex
                        ? {
                            ...f,
                            extractedData: {
                              ...f.extractedData,
                              provider: analysis.provider,
                              dateOfService: analysis.dateOfService || f.extractedData?.dateOfService,
                              keyFindings: analysis.medicalData?.caseSummaryPoints || f.extractedData?.keyFindings,
                              timeline: analysis.timelineEvents || f.extractedData?.timeline,
                            },
                          }
                        : f,
                    ),
                  )
                }
              })
              console.log("Updated documents with batch processing results")
            }
          } else {
            console.warn("Batch processing failed, continuing with existing data")
          }
        } catch (batchError) {
          console.warn("Batch processing error, continuing with existing data:", batchError)
        }
      }

      // Prepare chronology data with timeline entries
      const chronologyEntries = []

      for (const doc of processedDocs) {
        if (doc.extractedData?.timeline && doc.extractedData.timeline.length > 0) {
          // Add timeline entries from each document
          doc.extractedData.timeline.forEach((entry) => {
            chronologyEntries.push({
              date: entry.date,
              event: entry.event,
              source: doc.name,
              provider: doc.extractedData?.provider,
              documentType: doc.extractedData?.documentType,
              keyFindings: doc.extractedData?.keyFindings || [],
              treatmentProvided: doc.extractedData?.treatmentProvided || [],
            })
          })
        } else {
          // Create entry from document metadata if no timeline exists
          chronologyEntries.push({
            date: doc.extractedData?.dateOfService !== "Date not found"
              ? doc.extractedData?.dateOfService
              : new Date().toISOString().split("T")[0],
            event: `Medical record from ${doc.extractedData?.provider || "Healthcare Provider"}`,
            source: doc.name,
            provider: doc.extractedData?.provider,
            documentType: doc.extractedData?.documentType,
            keyFindings: doc.extractedData?.keyFindings || [],
            treatmentProvided: doc.extractedData?.treatmentProvided || [],
          })
        }
      }

      // Sort chronologically
      chronologyEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Generate comprehensive analysis with ALL document details
      const comprehensiveAnalysis = {
        totalDocuments: processedDocs.length,
        dateRange: {
          start: chronologyEntries[0]?.date,
          end: chronologyEntries[chronologyEntries.length - 1]?.date,
        },
        providers: [...new Set(processedDocs.map((doc) => doc.extractedData?.provider).filter(Boolean))],
        documentTypes: [...new Set(processedDocs.map((doc) => doc.extractedData?.documentType).filter(Boolean))],
        bodySystemsAffected: [...new Set(processedDocs.flatMap((doc) => doc.extractedData?.bodySystemsAffected || []))],
        allTreatments: [...new Set(processedDocs.flatMap((doc) => doc.extractedData?.treatmentProvided || []))],
        medicalTerminology: [...new Set(processedDocs.flatMap((doc) => doc.extractedData?.medicalTerminology || []))],
        timeline: chronologyEntries,
        // Store detailed document information for comprehensive view
        documents: processedDocs.map((doc) => ({
          name: doc.name,
          documentId: doc.documentId,
          category: doc.category,
          confidence: doc.confidence,
          provider: doc.extractedData?.provider,
          dateOfService: doc.extractedData?.dateOfService,
          documentType: doc.extractedData?.documentType,
          keyFindings: doc.extractedData?.keyFindings || [],
          treatmentProvided: doc.extractedData?.treatmentProvided || [],
          missingInformation: doc.extractedData?.missingInformation || [],
          medicalTerminology: doc.extractedData?.medicalTerminology || [],
          bodySystemsAffected: doc.extractedData?.bodySystemsAffected || [],
          // Store the full extracted data for detailed view
          fullExtractedData: doc.extractedData,
        })),
      }

      setChronologyData(comprehensiveAnalysis)

      // Store chronology in localStorage for the selected case
      if (selectedCase) {
        const existingChronologies = JSON.parse(localStorage.getItem("medchrono_chronologies") || "{}")
        existingChronologies[selectedCase] = {
          ...comprehensiveAnalysis,
          generatedAt: new Date().toISOString(),
          caseId: selectedCase,
        }
        localStorage.setItem("medchrono_chronologies", JSON.stringify(existingChronologies))
      }
    } catch (error) {
      console.error("Error generating chronology:", error)
      alert("Error generating chronology. Please try again.")
    } finally {
      setIsGeneratingChronology(false)
    }
  }

  const processBulkDocuments = async () => {
    const pendingFiles = uploadedFiles.filter((file) => file.status === "uploading" || file.status === "processing")

    if (pendingFiles.length === 0) {
      alert("No pending documents to process")
      return
    }

    // Process remaining files
    for (const file of pendingFiles) {
      if (file.file) {
        await processFileWithAI(file)
      }
    }
  }

  const processFileWithAI = async (uploadedFile: UploadedFile) => {
    if (!uploadedFile.file) {
      console.error("No file object found for processing")
      return
    }

    try {
      console.log("Starting direct upload for:", uploadedFile.name)

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, progress: 10, status: "uploading", processingStep: 1 } : f,
        ),
      )

      // Step 1: Get signed upload URL
      const urlResponse = await fetch("/api/documents/get-upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: uploadedFile.file.name,
          caseId: selectedCase || "default",
          fileSize: uploadedFile.file.size,
        }),
      })

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json()
        throw new Error(errorData.error || "Failed to get upload URL")
      }

      const { signedUrl, path: storagePath } = await urlResponse.json()

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, progress: 20, processingStep: 1 } : f,
        ),
      )

      // Step 2: Upload directly to Supabase Storage with progress tracking
      console.log("Uploading directly to Supabase Storage...")

      // For large files, show intermediate progress
      const fileSize = uploadedFile.file.size
      if (fileSize > 50 * 1024 * 1024) { // > 50MB
        console.log(`Large file detected: ${(fileSize / 1024 / 1024).toFixed(2)}MB - showing progress`)
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, progress: 25 } : f,
          ),
        )
      }

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: uploadedFile.file,
        headers: {
          "Content-Type": uploadedFile.file.type || "application/octet-stream",
        },
      })

      if (!uploadResponse.ok) {
        throw new Error(`Direct upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      console.log("File uploaded to Supabase Storage successfully")

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, progress: 40, processingStep: 2 } : f,
        ),
      )

      // Step 3: Save metadata to database
      console.log("💾 Saving metadata with case_id:", selectedCase || "default")

      const metadataResponse = await fetch("/api/documents/save-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId: selectedCase || "default",
          storagePath: storagePath,
          fileName: uploadedFile.file.name,
          fileSize: uploadedFile.file.size,
          fileType: uploadedFile.file.type,
        }),
      })

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json()
        throw new Error(errorData.error || "Failed to save metadata")
      }

      const { documentId } = await metadataResponse.json()
      console.log("Document metadata saved with ID:", documentId)

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress: 40, processingStep: 2, documentId } : f)),
      )
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Process document with Python backend for chronology
      console.log("Calling Python backend for chronology generation...")
      const chronologyResponse = await fetch("/api/chronology/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId }),
      })

      let processResult: any = {}
      if (chronologyResponse.ok) {
        try {
          processResult = await chronologyResponse.json()
          console.log("Python chronology result:", processResult)
        } catch (parseError) {
          console.warn("Could not parse chronology response, falling back to standard processing")

          // Fallback to standard processing if Python backend fails
          const processResponse = await fetch("/api/documents/process", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ documentId }),
          })

          if (processResponse.ok) {
            processResult = await processResponse.json()
            console.log("Fallback processing result:", processResult)
          }
        }
      } else {
        console.warn("Python chronology API failed, falling back to standard processing")
        try {
          const errorData = await chronologyResponse.json()
          console.error("Chronology API error:", errorData)
        } catch (parseError) {
          console.error("Chronology failed with status:", chronologyResponse.status)
        }

        // Fallback to standard processing
        const processResponse = await fetch("/api/documents/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentId }),
        })

        if (processResponse.ok) {
          processResult = await processResponse.json()
          console.log("Fallback processing result:", processResult)
        }
      }

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress: 60, processingStep: 3 } : f)),
      )
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress: 80, processingStep: 4 } : f)),
      )
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Use the processResult we already parsed above
      let analysis: {
        documentType: string
        confidence: number
        medicalTerminology: string[]
        keyFindings: string[]
        dateOfService: string
        providerName: string
        bodySystemsAffected: string[]
        treatmentProvided: string[]
        diagnosisCodes: string[]
        qualityFlags: string[]
        timeline: any[]
        missingInformation: string[]
      } = {
        documentType: "Medical Document",
        confidence: 85,
        medicalTerminology: ["medical record", "clinical data"],
        keyFindings: ["Document processed successfully"],
        dateOfService: "Date not found",
        providerName: "Healthcare Provider",
        bodySystemsAffected: ["General"],
        treatmentProvided: ["Medical evaluation"],
        diagnosisCodes: [],
        qualityFlags: [],
        timeline: [],
        missingInformation: [],
      }

      if (processResult.success) {
        // Use actual serviceDate from medicalData, NOT timeline or today's date
        let serviceDate = processResult.dateOfService || processResult.medicalData?.serviceDate || null

        // If serviceDate is today, it's likely invalid - set to null
        const today = new Date().toISOString().split("T")[0]
        if (serviceDate === today) {
          console.warn("Service date is today - likely not found in document")
          serviceDate = null
        }

        // Check if we got data from Python backend (has caseSummaryPoints) or standard processing
        const isPythonBackend = processResult.medicalData?.caseSummaryPoints !== undefined

        // Ensure missingInformation is always an array of strings
        let missingInfo: string[] = []
        if (processResult.missingRecords) {
          missingInfo = Array.isArray(processResult.missingRecords)
            ? processResult.missingRecords.map((r: any) => typeof r === 'string' ? r : String(r))
            : []
        } else if (processResult.medicalData?.keyIssues) {
          missingInfo = Array.isArray(processResult.medicalData.keyIssues)
            ? processResult.medicalData.keyIssues
            : []
        }

        analysis = {
          documentType: processResult.documentType || processResult.medicalData?.documentType || "Medical Record",
          confidence: 95, // Python backend provides comprehensive analysis
          medicalTerminology: processResult.medicalData?.medicalTerminology || ["medical record"],
          keyFindings: isPythonBackend
            ? processResult.medicalData?.caseSummaryPoints || []
            : processResult.medicalData?.caseSummaryPoints || processResult.keyFindings?.map((f: any) => f.finding) || ["Document processed"],
          dateOfService: serviceDate || "Date not found", // Display "Date not found" instead of today's date
          providerName: processResult.provider || processResult.medicalData?.provider || "Healthcare Provider",
          bodySystemsAffected: ["General"],
          treatmentProvided: isPythonBackend
            ? processResult.medicalData?.actionsTaken || ["Medical evaluation"]
            : ["Medical evaluation"],
          diagnosisCodes: [],
          qualityFlags: [],
          timeline: processResult.timelineEvents || [],
          missingInformation: missingInfo,
        }
        console.log(
          `Document processing completed with ${isPythonBackend ? "Python backend" : "standard processing"}. Service date:`,
          serviceDate,
        )
      } else {
        console.warn("Processing API returned error, using fallback analysis")
      }

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                progress: 100,
                status: "complete",
                confidence: analysis.confidence || 85,
                category: analysis.documentType || "Medical Records",
                documentId, // Store database ID for review functionality
                qualityFlags:
                  analysis.qualityFlags?.map((flag: string) => ({
                    type: flag.toLowerCase().replace(" ", "_") as any,
                    severity: "medium" as const,
                    description: flag,
                  })) || [],
                extractedData: {
                  provider: analysis.providerName || "Healthcare Provider",
                  dateOfService: analysis.dateOfService || new Date().toISOString().split("T")[0],
                  patientName: "Patient Name", // Keep private for demo
                  documentType: analysis.documentType || "Medical Record",
                  pageCount: 1,
                  medicalTerminology: analysis.medicalTerminology || [],
                  keyFindings: analysis.keyFindings || [],
                  bodySystemsAffected: analysis.bodySystemsAffected || [],
                  treatmentProvided: analysis.treatmentProvided || [],
                  diagnosisCodes: analysis.diagnosisCodes || [],
                  timeline: analysis.timeline || [],
                  missingInformation: analysis.missingInformation || [],
                },
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("AI processing error:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown processing error"

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                progress: 100,
                status: "error",
                error: errorMessage,
                confidence: 0,
                category: "Processing Failed",
                qualityFlags: [
                  {
                    type: "processing_error" as any,
                    severity: "high" as const,
                    description: errorMessage,
                  },
                ],
                extractedData: {
                  provider: "Medical Provider",
                  dateOfService: new Date().toISOString().split("T")[0],
                  patientName: "Patient Name",
                  documentType: "Medical Record",
                  pageCount: 1,
                  medicalTerminology: ["medical record", "patient care"],
                  keyFindings: ["Document uploaded successfully"],
                  bodySystemsAffected: ["General"],
                  treatmentProvided: ["Medical evaluation"],
                  diagnosisCodes: [],
                  timeline: [],
                  missingInformation: [],
                },
              }
            : f,
        ),
      )

      console.log(`Successfully processed ${uploadedFile.name} with fallback analysis`)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-600" />
    if (type === "application/pdf") return <FileText className="w-5 h-5 text-red-600" />
    return <File className="w-5 h-5 text-gray-600" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600 bg-green-100"
    if (confidence >= 80) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getQualityFlagColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const handleEditSave = () => {
    if (selectedFile) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFile.id
            ? {
                ...f,
                extractedData: { ...f.extractedData, ...editedData },
                category: editedData.category || f.category,
              }
            : f,
        ),
      )
      setSelectedFile((prev) =>
        prev
          ? {
              ...prev,
              extractedData: { ...prev.extractedData, ...editedData },
              category: editedData.category || prev.category,
            }
          : null,
      )
    }
    setIsEditing(false)
    setEditedData({})
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Added back to dashboard navigation */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
              <span>/</span>
              <span className="text-gray-900 font-medium">Upload Documents</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-1">Upload and automatically classify medical documents with AI</p>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Case Selection */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="font-serif">Select Case</CardTitle>
            <CardDescription>Choose which case these documents belong to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="case-select">Case *</Label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a case" />
                </SelectTrigger>
                <SelectContent>
                  {/* Load real cases instead of dummy data */}
                  {storedCases.length > 0 ? (
                    storedCases.map((caseItem) => (
                      <SelectItem key={caseItem.id} value={caseItem.id}>
                        {caseItem.name} - {caseItem.client}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-cases" disabled>
                      No cases available - Create a case first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {storedCases.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  <Link href="/dashboard/cases/new" className="text-cyan-600 hover:underline">
                    Create a new case
                  </Link>{" "}
                  to upload documents.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Upload Section */}
          <div className="xl:col-span-2">
            {/* Drag & Drop Area */}
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver ? "border-cyan-400 bg-cyan-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Drop files here to upload</h3>
                  <p className="text-gray-600 mb-4">or click to browse files</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Browse Files
                    </label>
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">Supports PDF, DOC, DOCX, JPG, PNG files up to 50MB each</p>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-serif">Uploaded Files</CardTitle>
                  <CardDescription>Files being processed and classified by AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              {getFileIcon(file.type)}
                            </div>
                            <div>
                              <h4 className="font-medium">{file.name}</h4>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.status === "complete" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(file)}
                                className="text-cyan-600 hover:text-cyan-700"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {file.status === "uploading" && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Uploading...</span>
                              <span>{Math.round(file.progress)}%</span>
                            </div>
                            <Progress value={file.progress} className="h-2" />
                          </div>
                        )}

                        {file.status === "processing" && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm text-blue-600">
                              <Brain className="w-4 h-4 animate-pulse" />
                              <span>AI processing and classification...</span>
                            </div>
                            <div className="space-y-2">
                              {processingSteps.map((step) => (
                                <div key={step.id} className="flex items-center space-x-3">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                      file.processingStep! >= step.id
                                        ? "bg-cyan-600 text-white"
                                        : file.processingStep! === step.id - 1
                                          ? "bg-cyan-200 text-cyan-700 animate-pulse"
                                          : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    {file.processingStep! > step.id ? <CheckCircle className="w-3 h-3" /> : step.id}
                                  </div>
                                  <div className="flex-1">
                                    <p
                                      className={`text-sm font-medium ${
                                        file.processingStep! >= step.id ? "text-gray-900" : "text-gray-500"
                                      }`}
                                    >
                                      {step.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {file.status === "complete" && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">AI analysis complete</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Category:</span>
                                <p className="font-medium">{file.category}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">AI Confidence:</span>
                                <Badge className={`ml-2 text-xs ${getConfidenceColor(file.confidence!)}`}>
                                  {file.confidence}%
                                </Badge>
                              </div>
                            </div>

                            {file.extractedData?.medicalTerminology &&
                              file.extractedData.medicalTerminology.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium text-gray-700">Medical Terms Found:</h5>
                                  <div className="flex flex-wrap gap-1">
                                    {file.extractedData.medicalTerminology.slice(0, 5).map((term, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {term}
                                      </Badge>
                                    ))}
                                    {file.extractedData.medicalTerminology.length > 5 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{file.extractedData.medicalTerminology.length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                            {file.qualityFlags && file.qualityFlags.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-gray-700">Quality Flags:</h5>
                                {file.qualityFlags.map((flag, index) => (
                                  <div key={index} className="flex items-start space-x-2">
                                    <Flag className="w-4 h-4 text-amber-500 mt-0.5" />
                                    <div>
                                      <Badge className={`text-xs ${getQualityFlagColor(flag.severity)}`}>
                                        {flag.severity.toUpperCase()}
                                      </Badge>
                                      <p className="text-xs text-gray-600 mt-1">{flag.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {file.extractedData && (
                              <div className="bg-white p-3 rounded border">
                                <h5 className="font-medium text-sm mb-2">AI-Extracted Information:</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Provider:</span>
                                    <p>{file.extractedData.provider}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Date of Service:</span>
                                    <p>{file.extractedData.dateOfService}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Document Type:</span>
                                    <p>{file.extractedData.documentType}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Body Systems:</span>
                                    <p>{file.extractedData.bodySystemsAffected?.join(", ") || "N/A"}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {file.status === "error" && (
                          <div className="flex items-center space-x-2 text-sm text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>AI processing failed. Please try again.</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {uploadedFiles.length > 0 && (
              <Card className="border-0 shadow-sm mt-6">
                <CardHeader>
                  <CardTitle className="font-serif">Bulk Actions</CardTitle>
                  <CardDescription>Process multiple documents and generate comprehensive chronology</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={processBulkDocuments}
                      disabled={
                        uploadedFiles.filter((f) => f.status === "uploading" || f.status === "processing").length === 0
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Process All Pending
                    </Button>

                    <Button
                      onClick={generateComprehensiveChronology}
                      disabled={
                        uploadedFiles.filter((f) => f.status === "complete").length === 0 || isGeneratingChronology
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isGeneratingChronology ? (
                        <>
                          <Brain className="w-4 h-4 mr-2 animate-pulse" />
                          Generating Chronology...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Medical Chronology
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        const completedFiles = uploadedFiles.filter((f) => f.status === "complete")
                        if (completedFiles.length === 0) {
                          alert("No completed documents to export")
                          return
                        }

                        // Create export data
                        const exportData = {
                          caseId: selectedCase,
                          exportDate: new Date().toISOString(),
                          totalDocuments: completedFiles.length,
                          documents: completedFiles.map((file) => ({
                            name: file.name,
                            category: file.category,
                            confidence: file.confidence,
                            extractedData: file.extractedData,
                          })),
                        }

                        // Download as JSON
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `medical-records-export-${selectedCase || "case"}-${new Date().toISOString().split("T")[0]}.json`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Bulk Processing Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Upload all medical records for the case at once for best chronology results</li>
                      <li>• The system will automatically organize documents by date and provider</li>
                      <li>• Generated chronology will be saved to the case for future reference</li>
                      <li>• You can review and edit individual documents before generating the chronology</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {chronologyData && (
              <Card className="border-0 shadow-sm mt-6">
                <CardHeader>
                  <CardTitle className="font-serif">Generated Medical Chronology</CardTitle>
                  <CardDescription>
                    Comprehensive timeline from {chronologyData.totalDocuments} documents (
                    {chronologyData.dateRange.start} to {chronologyData.dateRange.end})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{chronologyData.totalDocuments}</div>
                        <div className="text-sm text-gray-600">Documents</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{chronologyData.providers.length}</div>
                        <div className="text-sm text-gray-600">Providers</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{chronologyData.timeline.length}</div>
                        <div className="text-sm text-gray-600">Timeline Events</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.ceil(
                            (new Date(chronologyData.dateRange.end).getTime() -
                              new Date(chronologyData.dateRange.start).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}
                        </div>
                        <div className="text-sm text-gray-600">Days Span</div>
                      </div>
                    </div>

                    {/* Providers and Document Types */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Healthcare Providers ({chronologyData.providers.length})</h4>
                        <div className="space-y-2">
                          {chronologyData.providers.map((provider: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">{provider}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Document Types ({chronologyData.documentTypes.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {chronologyData.documentTypes.map((type: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Preview */}
                    <div>
                      <h4 className="font-medium mb-3">Medical Timeline (First 10 Events)</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {chronologyData.timeline.slice(0, 10).map((entry: any, index: number) => (
                          <div key={index} className="flex space-x-4 p-3 bg-white border rounded-lg">
                            <div className="flex-shrink-0 w-24 text-sm text-gray-600">
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{entry.event}</p>
                              <p className="text-xs text-gray-600">
                                {entry.provider} • {entry.documentType}
                              </p>
                              {entry.keyFindings.length > 0 && (
                                <div className="mt-1">
                                  <p className="text-xs text-gray-500">Key Findings:</p>
                                  <p className="text-xs text-gray-700">{entry.keyFindings.slice(0, 2).join(", ")}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {chronologyData.timeline.length > 10 && (
                          <div className="text-center py-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Navigate to full chronology view
                                window.open(`/dashboard/templates?case=${selectedCase}&chronology=generated`, "_blank")
                              }}
                            >
                              View Complete Chronology ({chronologyData.timeline.length} events)
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Button
                        className="bg-cyan-600 hover:bg-cyan-700"
                        onClick={() => {
                          // Navigate to templates page with chronology data
                          window.open(`/dashboard/templates?case=${selectedCase}&chronology=generated`, "_blank")
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Open in Templates
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          // Export chronology as PDF/Word
                          const chronologyText = chronologyData.timeline
                            .map(
                              (entry: any) =>
                                `${new Date(entry.date).toLocaleDateString()}: ${entry.event} (${entry.provider})`,
                            )
                            .join("\n")

                          const blob = new Blob([chronologyText], { type: "text/plain" })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `medical-chronology-${selectedCase || "case"}-${new Date().toISOString().split("T")[0]}.txt`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Export Chronology
                      </Button>

                      <Button variant="outline" onClick={() => setChronologyData(null)}>
                        <X className="w-4 h-4 mr-2" />
                        Close Preview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="xl:col-span-2">
            {selectedFile ? (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif">AI Document Review</CardTitle>
                      <CardDescription>{selectedFile.name}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}>
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-gray-600">{zoomLevel}%</span>
                      <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}>
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                        <Edit3 className="w-4 h-4" />
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Document Preview */}
                  <div className="bg-gray-100 rounded-lg p-4 min-h-96 flex items-center justify-center">
                    <div style={{ transform: `scale(${zoomLevel / 100})` }} className="bg-white shadow-lg rounded">
                      <div className="w-64 h-80 bg-white border flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Document Preview</p>
                          <p className="text-xs text-gray-400">{selectedFile.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Tools */}
                  <div className="space-y-4">
                    <h3 className="font-medium">AI Analysis Results</h3>

                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={editedData.category || selectedFile.category}
                            onValueChange={(value) => setEditedData({ ...editedData, category: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {documentCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Provider</Label>
                          <Select
                            value={editedData.provider || selectedFile.extractedData?.provider}
                            onValueChange={(value) => setEditedData({ ...editedData, provider: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {commonProviders.map((provider) => (
                                <SelectItem key={provider} value={provider}>
                                  {provider}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Date of Service</Label>
                          <Input
                            type="date"
                            value={editedData.dateOfService || selectedFile.extractedData?.dateOfService}
                            onChange={(e) => setEditedData({ ...editedData, dateOfService: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Notes</Label>
                          <Textarea
                            placeholder="Add any notes or corrections..."
                            value={editedData.notes || ""}
                            onChange={(e) => setEditedData({ ...editedData, notes: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        <Button onClick={handleEditSave} className="bg-cyan-600 hover:bg-cyan-700">
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedFile.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">AI Confidence:</span>
                          <Badge className={`text-xs ${getConfidenceColor(selectedFile.confidence!)}`}>
                            {selectedFile.confidence}%
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Provider:</span>
                          <span className="font-medium">{selectedFile.extractedData?.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date of Service:</span>
                          <span className="font-medium">{selectedFile.extractedData?.dateOfService}</span>
                        </div>

                        {selectedFile.extractedData?.keyFindings &&
                          selectedFile.extractedData.keyFindings.length > 0 && (
                            <div className="pt-3 border-t">
                              <span className="text-gray-600 text-sm font-medium">Key Medical Findings:</span>
                              <ul className="mt-1 text-sm space-y-1">
                                {selectedFile.extractedData.keyFindings.slice(0, 3).map((finding, index) => (
                                  <li key={index} className="text-gray-700">
                                    • {finding}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {selectedFile.extractedData?.treatmentProvided &&
                          selectedFile.extractedData.treatmentProvided.length > 0 && (
                            <div className="pt-3 border-t">
                              <span className="text-gray-600 text-sm font-medium">Treatments:</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {selectedFile.extractedData.treatmentProvided.slice(0, 4).map((treatment, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {treatment}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Upload Guidelines */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-serif">Upload Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Ensure documents are clear and legible</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Remove any patient identifiers if required</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Upload complete documents (all pages)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Use descriptive file names when possible</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-serif">AI Classification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>
                          <strong>95-100%:</strong> Auto-filed
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>
                          <strong>80-94%:</strong> Review suggested
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>
                          <strong>Below 80%:</strong> Manual review required
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Our AI uses OpenAI GPT-4 for medical document analysis and terminology extraction.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <DocumentChatbot caseId={selectedCase || undefined} />
        </div>
      </div>
    </div>
  )
}

export default DocumentUpload
