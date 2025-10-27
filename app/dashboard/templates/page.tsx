"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DocumentChatbot } from "@/components/DocumentChatbot"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Home,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  FileText,
  Clock,
  Stethoscope,
  DollarSign,
  Scale,
  Shield,
  Gavel,
  Play,
  Download,
  CheckCircle,
  AlertCircle,
  Printer,
} from "lucide-react"

const templateCategories = [
  {
    id: "standard",
    title: "Standard Medical Chronology",
    description: "Comprehensive timeline of all medical events",
    icon: FileText,
    color: "bg-blue-600",
    features: ["Complete medical timeline", "All providers included", "Comprehensive documentation"],
    estimatedTime: "45-60 minutes",
  },
  {
    id: "executive",
    title: "Executive Summary",
    description: "2-3 page overview for quick case assessment",
    icon: Clock,
    color: "bg-green-600",
    features: ["Concise overview", "Key findings highlighted", "Executive-level summary"],
    estimatedTime: "15-20 minutes",
  },
  {
    id: "treatment",
    title: "Treatment-Focused Chronology",
    description: "Emphasis on therapeutic interventions and outcomes",
    icon: Stethoscope,
    color: "bg-purple-600",
    features: ["Treatment focus", "Therapeutic outcomes", "Recovery progression"],
    estimatedTime: "30-40 minutes",
  },
  {
    id: "damages",
    title: "Damages-Specific Timeline",
    description: "Economic losses and financial impact analysis",
    icon: DollarSign,
    color: "bg-amber-600",
    features: ["Economic analysis", "Financial impact", "Cost calculations"],
    estimatedTime: "35-45 minutes",
  },
  {
    id: "expert",
    title: "Expert Witness Preparation",
    description: "Structured format for testimony support",
    icon: Scale,
    color: "bg-red-600",
    features: ["Expert testimony support", "Key evidence highlighted", "Court-ready format"],
    estimatedTime: "40-50 minutes",
  },
  {
    id: "insurance",
    title: "Insurance Demand Package",
    description: "Settlement-focused presentation",
    icon: Shield,
    color: "bg-cyan-600",
    features: ["Settlement focus", "Insurance presentation", "Demand package format"],
    estimatedTime: "25-35 minutes",
  },
  {
    id: "trial",
    title: "Trial Presentation Format",
    description: "Courtroom-ready chronology presentation",
    icon: Gavel,
    color: "bg-indigo-600",
    features: ["Courtroom ready", "Visual presentation", "Trial format"],
    estimatedTime: "50-60 minutes",
  },
]

const generationSteps = [
  { id: 1, title: "Medical record content extraction and parsing", status: "pending" },
  { id: 2, title: "Chronological event sequencing", status: "pending" },
  { id: 3, title: "Clinical significance scoring", status: "pending" },
  { id: 4, title: "Narrative flow optimization", status: "pending" },
  { id: 5, title: "Legal relevance highlighting", status: "pending" },
  { id: 6, title: "Quality assurance checking", status: "pending" },
  { id: 7, title: "Final formatting and presentation", status: "pending" },
]

export default function TemplatesPage() {
  const searchParams = useSearchParams()
  const caseIdFromUrl = searchParams?.get("case") || ""
  const chronologyFromUrl = searchParams?.get("chronology") || ""

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<string>(caseIdFromUrl)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showReviewInterface, setShowReviewInterface] = useState(false)
  const [storedCases, setStoredCases] = useState<any[]>([])
  const [chronologyData, setChronologyData] = useState<any>(null)
  const [showCustomization, setShowCustomization] = useState(false)

  // Load cases from API
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("/api/cases")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.cases) {
            const mappedCases = data.cases.map((c: any) => ({
              id: String(c.id),
              name: c.case_name,
              client: c.client_name,
            }))
            setStoredCases(mappedCases)
          }
        } else {
          console.error("Failed to fetch cases from API")
          const cases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
          setStoredCases(cases)
        }
      } catch (error) {
        console.error("Error fetching cases:", error)
        const cases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
        setStoredCases(cases)
      }
    }

    fetchCases()
  }, [])

  // Load chronology data from URL params or localStorage
  useEffect(() => {
    if (chronologyFromUrl === "generated" && caseIdFromUrl) {
      const storedChronologies = JSON.parse(localStorage.getItem("medchrono_chronologies") || "{}")
      const caseChronology = storedChronologies[caseIdFromUrl]

      if (caseChronology) {
        setChronologyData(caseChronology)
        setSelectedCase(caseIdFromUrl)
        setSelectedTemplate("standard")
        setShowReviewInterface(true)
      }
    }
  }, [chronologyFromUrl, caseIdFromUrl])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleGenerateChronology = async () => {
    if (!selectedTemplate || !selectedCase) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentStep(0)

    for (let i = 0; i < generationSteps.length; i++) {
      setCurrentStep(i)
      setGenerationProgress(((i + 1) / generationSteps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    const storedChronologies = JSON.parse(localStorage.getItem("medchrono_chronologies") || "{}")
    const caseChronology = storedChronologies[selectedCase]

    if (caseChronology) {
      setChronologyData(caseChronology)
    } else {
      setChronologyData({
        totalDocuments: 0,
        dateRange: { start: "N/A", end: "N/A" },
        providers: [],
        documentTypes: [],
        timeline: [],
        documents: [],
        generatedAt: new Date().toISOString(),
      })
    }

    setIsGenerating(false)
    setShowReviewInterface(true)
  }

  const handleBackToSelection = () => {
    setShowReviewInterface(false)
    setIsGenerating(false)
    setGenerationProgress(0)
    setCurrentStep(0)
  }

  const handleExportComprehensive = () => {
    if (!chronologyData) return

    const patientName = storedCases.find((c) => c.id === selectedCase)?.client || "PATIENT NAME"
    const caseName = storedCases.find((c) => c.id === selectedCase)?.name || "CASE"

    const content = `
═══════════════════════════════════════════════════════════════════
                    VERBATIM SUMMARY – ${patientName.toUpperCase()}
═══════════════════════════════════════════════════════════════════

Patient: ${patientName}
DOB: ${chronologyData.dateRange.start || "MM/DD/YYYY"}
Case: ${caseName}
Generated: ${new Date(chronologyData.generatedAt).toLocaleDateString()}

───────────────────────────────────────────────────────────────────
PATIENT INFORMATION
───────────────────────────────────────────────────────────────────
Name: ${patientName}
DOB: ${chronologyData.dateRange.start || "N/A"}
Gender: Not specified
Case: ${caseName}
Incident Date: ${chronologyData.dateRange.start || "N/A"}

───────────────────────────────────────────────────────────────────
PATIENT HISTORY
───────────────────────────────────────────────────────────────────

Past Medical History:
${chronologyData.documents?.flatMap((d: any) => d.fullExtractedData?.medicalHistory || []).join(", ") || "No specific past medical history documented"}

Past Surgical History:
${chronologyData.documents?.flatMap((d: any) => d.fullExtractedData?.surgicalHistory || []).join(", ") || "No surgical history documented"}

Family History:
Not documented in available records

Social History:
${chronologyData.documents?.flatMap((d: any) => d.fullExtractedData?.socialHistory || []).join(", ") || "Not documented in available records"}

Allergies:
${chronologyData.documents?.flatMap((d: any) => d.fullExtractedData?.allergies || []).join(", ") || "No allergies documented"}

${chronologyData.documents?.some((d: any) => d.missingInformation?.length > 0)
  ? `
───────────────────────────────────────────────────────────────────
MISSING RECORDS DETAILS
───────────────────────────────────────────────────────────────────

${chronologyData.documents
  ?.filter((d: any) => d.missingInformation?.length > 0)
  .map(
    (doc: any) => `Provider: ${doc.provider || "Unknown"}
Date: ${doc.dateOfService || "N/A"}
Records Required: ${doc.missingInformation.join(", ")}
Significance: Complete case documentation`,
  )
  .join("\n\n")}
`
  : ""
}

───────────────────────────────────────────────────────────────────
CHRONOLOGICAL SUMMARY
───────────────────────────────────────────────────────────────────

DATE           | PROVIDER                    | EVENTS                                          | PDF REF
───────────────────────────────────────────────────────────────────────────────────────────────────

${chronologyData.timeline
  .map((entry: any, index: number) => {
    const date = new Date(entry.date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
    const provider = (entry.provider || "Unknown").padEnd(28)
    const eventText = entry.event || "Medical event"
    const keyFindingsText =
      entry.keyFindings && entry.keyFindings.length > 0 ? `\n   Key Findings: ${entry.keyFindings.join("; ")}` : ""
    const treatmentText =
      entry.treatmentProvided && entry.treatmentProvided.length > 0
        ? `\n   Treatments: ${entry.treatmentProvided.join(", ")}`
        : ""

    return `${date.padEnd(15)}| ${provider}| ${eventText}${keyFindingsText}${treatmentText}
   Document Type: ${entry.documentType} | ${index + 1}`
  })
  .join("\n\n")}

───────────────────────────────────────────────────────────────────
DOCUMENT SUMMARY
───────────────────────────────────────────────────────────────────

Total Documents Analyzed: ${chronologyData.totalDocuments}
Date Range: ${chronologyData.dateRange.start} to ${chronologyData.dateRange.end}
Total Healthcare Providers: ${chronologyData.providers.length}
Total Timeline Events: ${chronologyData.timeline.length}

Healthcare Providers:
${chronologyData.providers.map((provider: string, index: number) => `${index + 1}. ${provider}`).join("\n")}

Document Types:
${chronologyData.documentTypes.map((type: string, index: number) => `${index + 1}. ${type}`).join("\n")}

───────────────────────────────────────────────────────────────────
End of Report
───────────────────────────────────────────────────────────────────
`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `verbatim-chronology-${patientName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedTemplateData = templateCategories.find((t) => t.id === selectedTemplate)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/dashboard" className="flex items-center hover:text-cyan-600 transition-colors">
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Chronology Templates</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Chronology Templates</h1>
            <p className="text-gray-600 mt-1">Generate professional medical chronologies with AI-powered templates</p>
          </div>
          {showReviewInterface && (
            <Button variant="outline" onClick={handleBackToSelection}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          )}
        </div>

        {!showReviewInterface ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Available Template Categories</CardTitle>
                <CardDescription>Choose the template that best fits your case requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templateCategories.map((template) => {
                    const Icon = template.icon
                    return (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate === template.id ? "ring-2 ring-cyan-600 bg-cyan-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{template.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                              <div className="mt-3 space-y-1">
                                {template.features.map((feature, index) => (
                                  <div key={index} className="flex items-center text-xs text-gray-500">
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {template.estimatedTime}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-serif">Customization Options</CardTitle>
                      <CardDescription>Optional: Configure your chronology settings (or use defaults)</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomization(!showCustomization)}
                      className="text-cyan-600"
                    >
                      {showCustomization ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide Options
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          Show Options
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="case-select">Select Case *</Label>
                    <Select value={selectedCase} onValueChange={setSelectedCase}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a case" />
                      </SelectTrigger>
                      <SelectContent>
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
                        to generate chronologies.
                      </p>
                    )}
                  </div>

                  {showCustomization && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Date Range Selection (Optional)</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="date"
                              placeholder="Start date"
                              value={dateRange.start}
                              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                            />
                            <Input
                              type="date"
                              placeholder="End date"
                              value={dateRange.end}
                              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Provider Filtering (Optional)</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {["All Providers", "Primary Care", "Specialists", "Emergency Care", "Therapy Services"].map(
                              (provider) => (
                                <div key={provider} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={provider}
                                    checked={selectedProviders.includes(provider)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedProviders((prev) => [...prev, provider])
                                      } else {
                                        setSelectedProviders((prev) => prev.filter((p) => p !== provider))
                                      }
                                    }}
                                  />
                                  <Label htmlFor={provider} className="text-sm">
                                    {provider}
                                  </Label>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Medical Specialty Focus (Optional)</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {["Orthopedics", "Neurology", "Cardiology", "Physical Therapy", "Pain Management"].map(
                              (specialty) => (
                                <div key={specialty} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={specialty}
                                    checked={selectedSpecialties.includes(specialty)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedSpecialties((prev) => [...prev, specialty])
                                      } else {
                                        setSelectedSpecialties((prev) => prev.filter((s) => s !== specialty))
                                      }
                                    }}
                                  />
                                  <Label htmlFor={specialty} className="text-sm">
                                    {specialty}
                                  </Label>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Selected: <span className="font-medium">{selectedTemplateData?.title}</span>
                    </div>
                    <Button
                      onClick={handleGenerateChronology}
                      disabled={!selectedCase || isGenerating}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Generate Chronology
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isGenerating && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Chronology Generation Process</CardTitle>
                  <CardDescription>AI-powered automated chronology creation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Generation Progress</span>
                      <span className="text-sm text-gray-600">{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    {generationSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          index < currentStep
                            ? "bg-green-50 text-green-700"
                            : index === currentStep && isGenerating
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {index < currentStep ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : index === currentStep && isGenerating ? (
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className="font-medium">
                          {step.id}. {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Buttons - Top */}
            <div className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800">Generation Complete</Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportComprehensive} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={() => window.print()} size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>

            {chronologyData && chronologyData.totalDocuments > 0 ? (
              <Card className="print:shadow-none">
                <CardContent className="p-8 space-y-6">
                  {/* Header with Patient Info */}
                  <div className="border-b-2 border-gray-900 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {storedCases.find((c) => c.id === selectedCase)?.client || "PATIENT NAME"}
                        </h1>
                        <p className="text-sm text-gray-600">DOB: {chronologyData.dateRange.start || "MM/DD/YYYY"}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>Page 1 of 1</p>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-center text-gray-900 mt-4">
                      VERBATIM SUMMARY –{" "}
                      {storedCases.find((c) => c.id === selectedCase)?.client?.toUpperCase() || "PATIENT"}
                    </h2>
                  </div>

                  {/* Patient Information Box */}
                  <div className="border border-gray-300 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold">Name:</span>{" "}
                          {storedCases.find((c) => c.id === selectedCase)?.client || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">DOB:</span> {chronologyData.dateRange.start || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Gender:</span> Not specified
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold">Case:</span>{" "}
                          {storedCases.find((c) => c.id === selectedCase)?.name || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Incident Date:</span> {chronologyData.dateRange.start || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Patient History Table */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">PATIENT HISTORY</h3>
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-semibold w-48">
                            Past Medical History
                          </td>
                          <td className="border border-gray-300 p-2">
                            {chronologyData.documents
                              ?.flatMap((d: any) => d.fullExtractedData?.medicalHistory || [])
                              .join(", ") || "No specific past medical history documented"}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">
                            Past Surgical History
                          </td>
                          <td className="border border-gray-300 p-2">
                            {chronologyData.documents
                              ?.flatMap((d: any) => d.fullExtractedData?.surgicalHistory || [])
                              .join(", ") || "No surgical history documented"}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Family History</td>
                          <td className="border border-gray-300 p-2">Not documented in available records</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Social History</td>
                          <td className="border border-gray-300 p-2">
                            {chronologyData.documents
                              ?.flatMap((d: any) => d.fullExtractedData?.socialHistory || [])
                              .join(", ") || "Not documented in available records"}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 bg-gray-100 font-semibold">Allergy</td>
                          <td className="border border-gray-300 p-2">
                            {chronologyData.documents
                              ?.flatMap((d: any) => d.fullExtractedData?.allergies || [])
                              .join(", ") || "No allergies documented"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Missing Records Details Table */}
                  {chronologyData.documents?.some((d: any) => d.missingInformation?.length > 0) && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">MISSING RECORDS DETAILS</h3>
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 text-left font-semibold">Provider</th>
                            <th className="border border-gray-300 p-2 text-left font-semibold">Dates</th>
                            <th className="border border-gray-300 p-2 text-left font-semibold">Records Required</th>
                            <th className="border border-gray-300 p-2 text-left font-semibold">Significance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chronologyData.documents
                            ?.filter((d: any) => d.missingInformation?.length > 0)
                            .map((doc: any, index: number) => (
                              <tr key={index}>
                                <td className="border border-gray-300 p-2">{doc.provider || "Unknown"}</td>
                                <td className="border border-gray-300 p-2">{doc.dateOfService || "N/A"}</td>
                                <td className="border border-gray-300 p-2">
                                  {doc.missingInformation.join(", ")}
                                </td>
                                <td className="border border-gray-300 p-2">Complete case documentation</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Main Chronology Summary Table */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">SUMMARY</h3>
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-left font-semibold w-24">DATE</th>
                          <th className="border border-gray-300 p-2 text-left font-semibold w-48">PROVIDER</th>
                          <th className="border border-gray-300 p-2 text-left font-semibold">EVENTS</th>
                          <th className="border border-gray-300 p-2 text-left font-semibold w-20">PDF REF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chronologyData.timeline.map((entry: any, index: number) => {
                          // Determine if this entry should be highlighted
                          const hasImportantFindings = entry.keyFindings?.some((finding: string) =>
                            finding.toLowerCase().match(/fracture|injury|diagnosis|emergency|admitted|surgery/),
                          )
                          return (
                            <tr key={index} className={hasImportantFindings ? "bg-yellow-100" : ""}>
                              <td className="border border-gray-300 p-2 align-top">
                                {new Date(entry.date).toLocaleDateString("en-US", {
                                  month: "2-digit",
                                  day: "2-digit",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="border border-gray-300 p-2 align-top">{entry.provider}</td>
                              <td className="border border-gray-300 p-2">
                                <div className="space-y-1">
                                  <p className="font-medium">{entry.event}</p>
                                  <p className="text-xs text-gray-600">Document Type: {entry.documentType}</p>
                                  {entry.keyFindings && entry.keyFindings.length > 0 && (
                                    <div className="mt-2">
                                      <p className="font-semibold text-xs">Key Findings:</p>
                                      <ul className="list-disc pl-4 space-y-1">
                                        {entry.keyFindings.map((finding: string, i: number) => (
                                          <li key={i} className="text-xs">
                                            {finding}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {entry.treatmentProvided && entry.treatmentProvided.length > 0 && (
                                    <div className="mt-2">
                                      <p className="font-semibold text-xs">Treatments:</p>
                                      <p className="text-xs">{entry.treatmentProvided.join(", ")}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="border border-gray-300 p-2 align-top text-center">
                                {index + 1}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-300">
                    <p>
                      Generated: {chronologyData?.generatedAt ? new Date(chronologyData.generatedAt).toLocaleString() : "N/A"}
                    </p>
                    <p className="text-xs mt-1">
                      This chronology contains {chronologyData.totalDocuments} documents spanning{" "}
                      {chronologyData.dateRange.start} to {chronologyData.dateRange.end}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Chronology Data Available</h3>
                  <p className="text-gray-500 mb-4">
                    Upload and process documents first to generate a comprehensive chronology.
                  </p>
                  <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                    <Link href="/dashboard/documents/upload">
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Document Chatbot - Floating component */}
      <DocumentChatbot />
    </div>
  )
}
