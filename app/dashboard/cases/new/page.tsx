"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  User,
  Stethoscope,
  Car,
  Building,
  Heart,
  Brain,
  Bone,
  Eye,
  Blinds as Lungs,
} from "lucide-react"

const injuryCategories = [
  { id: "mva", label: "Motor Vehicle Accident (MVA)", icon: Car, color: "bg-red-100 text-red-700" },
  { id: "slip-fall", label: "Slip and Fall", icon: Building, color: "bg-orange-100 text-orange-700" },
  { id: "med-malpractice", label: "Medical Malpractice", icon: Stethoscope, color: "bg-blue-100 text-blue-700" },
  { id: "product-liability", label: "Product Liability", icon: FileText, color: "bg-green-100 text-green-700" },
  { id: "workplace", label: "Workplace Injury", icon: Building, color: "bg-purple-100 text-purple-700" },
  { id: "assault", label: "Assault/Battery", icon: User, color: "bg-gray-100 text-gray-700" },
]

const mvaSubCategories = [
  "Car vs. Car",
  "Car vs. Pedestrian",
  "Car vs. Bicycle",
  "Car vs. Motorcycle",
  "Truck/Commercial Vehicle",
  "Rideshare/Uber/Lyft",
]

const slipFallSubCategories = [
  "Wet/Slippery Surface",
  "Uneven Surface/Trip Hazard",
  "Inadequate Lighting",
  "Defective Stairs/Handrails",
  "Ice/Snow Related",
  "Debris/Objects on Floor",
]

const medMalpracticeSubCategories = [
  "Surgical Error",
  "Misdiagnosis/Delayed Diagnosis",
  "Medication Error",
  "Birth Injury",
  "Anesthesia Error",
  "Hospital Negligence",
]

const productLiabilitySubCategories = [
  "Defective Design",
  "Manufacturing Defect",
  "Inadequate Warning/Instructions",
  "Pharmaceutical/Drug",
  "Medical Device",
  "Consumer Product",
]

const workplaceSubCategories = [
  "Construction Accident",
  "Machinery/Equipment Injury",
  "Fall from Height",
  "Chemical Exposure",
  "Repetitive Stress Injury",
  "Workplace Violence",
]

const assaultSubCategories = [
  "Physical Assault",
  "Sexual Assault",
  "Domestic Violence",
  "Bar/Nightclub Incident",
  "Road Rage",
  "Security Negligence",
]

const bodySystemsAffected = [
  { id: "neurological", label: "Neurological", description: "Brain, spine, nerves", icon: Brain },
  { id: "orthopedic", label: "Orthopedic", description: "Bones, joints, muscles", icon: Bone },
  { id: "cardiovascular", label: "Cardiovascular", description: "Heart, circulation", icon: Heart },
  { id: "respiratory", label: "Respiratory", description: "Lungs, breathing", icon: Lungs },
  { id: "psychological", label: "Psychological", description: "Mental health, PTSD", icon: Brain },
  { id: "internal", label: "Internal Organs", description: "Liver, kidney, etc.", icon: Heart },
  { id: "dermatological", label: "Dermatological", description: "Burns, scarring", icon: Eye },
]

const documentRequirements = {
  mva: {
    "Car vs. Car": [
      "Police Report (required within 24 hours)",
      "Emergency Medical Services (EMS/Ambulance) Report",
      "Emergency Room Records",
      "Hospital Admission Records (if applicable)",
      "Radiology Reports (X-rays, CT, MRI)",
      "Primary Care Physician Records",
      "Specialist Consultation Reports",
      "Physical Therapy Records",
      "Pharmacy Records",
      "Insurance Documentation",
      "Vehicle Damage Photos",
      "Traffic Camera Footage (if available)",
    ],
    "Car vs. Pedestrian": [
      "Police Report",
      "Emergency Medical Treatment Records",
      "Trauma Center Records",
      "Orthopedic/Neurological Specialist Reports",
      "Rehabilitation Records",
      "Witness Statements",
      "Traffic Signal/Crosswalk Documentation",
      "Surveillance Footage",
    ],
    "Car vs. Bicycle": [
      "Police Report",
      "Emergency Medical Records",
      "Orthopedic Treatment Records",
      "Bicycle Damage Assessment",
      "Helmet/Safety Equipment Documentation",
      "Road Condition Reports",
    ],
    "Car vs. Motorcycle": [
      "Police Report",
      "Emergency Medical Records",
      "Trauma Surgery Records",
      "Motorcycle Damage Assessment",
      "Protective Gear Documentation",
      "Road Surface Analysis",
    ],
    "Truck/Commercial Vehicle": [
      "Police Report",
      "DOT Driver Logs",
      "Vehicle Inspection Records",
      "Commercial Insurance Documentation",
      "Company Safety Records",
      "Emergency Medical Records",
      "Cargo Manifest (if applicable)",
    ],
    "Rideshare/Uber/Lyft": [
      "Police Report",
      "Rideshare Company Insurance",
      "Driver Background Check Records",
      "Vehicle Inspection Records",
      "Trip Documentation",
      "Emergency Medical Records",
    ],
  },
  "slip-fall": {
    "Wet/Slippery Surface": [
      "Incident Report (property owner/manager)",
      "Emergency Medical Treatment Records",
      "Property Maintenance Records",
      "Cleaning Logs/Schedules",
      "Weather Reports (if outdoor)",
      "Surveillance Footage",
      "Witness Statements",
    ],
    "Uneven Surface/Trip Hazard": [
      "Incident Report",
      "Property Inspection Records",
      "Construction/Repair Documentation",
      "Code Violation Reports",
      "Emergency Medical Records",
      "Photos of Hazard",
    ],
    "Inadequate Lighting": [
      "Incident Report",
      "Lighting Maintenance Records",
      "Electrical Inspection Reports",
      "Emergency Medical Records",
      "Light Level Measurements",
    ],
    "Defective Stairs/Handrails": [
      "Building Inspection Reports",
      "Construction/Installation Records",
      "Code Compliance Documentation",
      "Maintenance Records",
      "Emergency Medical Records",
    ],
    "Ice/Snow Related": [
      "Weather Reports",
      "Snow Removal Contracts/Logs",
      "Salt/De-icing Records",
      "Property Maintenance Documentation",
      "Emergency Medical Records",
    ],
    "Debris/Objects on Floor": [
      "Incident Report",
      "Cleaning/Maintenance Schedules",
      "Store/Property Surveillance",
      "Employee Training Records",
      "Emergency Medical Records",
    ],
  },
  "med-malpractice": {
    "Surgical Error": [
      "Complete Medical Records",
      "Surgical Reports/Notes",
      "Anesthesia Records",
      "Pre/Post-Operative Records",
      "Pathology Reports",
      "Radiology/Imaging Studies",
      "Hospital Policies/Procedures",
      "Staff Credentials/Training",
    ],
    "Misdiagnosis/Delayed Diagnosis": [
      "Complete Medical Records",
      "Diagnostic Test Results",
      "Consultation Reports",
      "Radiology Reports",
      "Laboratory Results",
      "Referral Documentation",
      "Treatment Timeline",
    ],
    "Medication Error": [
      "Pharmacy Records",
      "Prescription Documentation",
      "Medical Records",
      "Drug Interaction Warnings",
      "Dosage Calculations",
      "Administration Records",
    ],
    "Birth Injury": [
      "Prenatal Records",
      "Labor/Delivery Records",
      "Fetal Monitoring Strips",
      "Newborn Records",
      "NICU Documentation",
      "Pediatric Neurology Reports",
    ],
    "Anesthesia Error": [
      "Anesthesia Records",
      "Pre-operative Assessment",
      "Monitoring Records",
      "Equipment Maintenance Logs",
      "Staff Credentials",
      "Emergency Response Documentation",
    ],
    "Hospital Negligence": [
      "Hospital Records",
      "Nursing Notes",
      "Medication Administration Records",
      "Incident Reports",
      "Staff Training Records",
      "Hospital Policies",
    ],
  },
  "product-liability": {
    "Defective Design": [
      "Product Documentation",
      "Design Specifications",
      "Safety Testing Reports",
      "Regulatory Approvals",
      "Similar Incident Reports",
      "Expert Analysis Reports",
    ],
    "Manufacturing Defect": [
      "Product Sample/Evidence",
      "Manufacturing Records",
      "Quality Control Documentation",
      "Batch/Lot Information",
      "Inspection Reports",
      "Recall Notices (if any)",
    ],
    "Inadequate Warning/Instructions": [
      "Product Packaging/Labels",
      "User Manuals/Instructions",
      "Safety Warnings",
      "Marketing Materials",
      "Regulatory Requirements",
      "Industry Standards",
    ],
    "Pharmaceutical/Drug": [
      "Prescription Records",
      "FDA Approval Documentation",
      "Clinical Trial Data",
      "Adverse Event Reports",
      "Package Inserts",
      "Medical Records",
    ],
    "Medical Device": [
      "Device Documentation",
      "FDA Clearance/Approval",
      "Implantation/Usage Records",
      "Maintenance Records",
      "Malfunction Reports",
      "Medical Records",
    ],
    "Consumer Product": [
      "Product Sample",
      "Purchase Documentation",
      "Safety Standards Compliance",
      "Consumer Complaints",
      "Recall Information",
      "Injury Documentation",
    ],
  },
  workplace: {
    "Construction Accident": [
      "OSHA Incident Report",
      "Safety Training Records",
      "Equipment Inspection Logs",
      "Site Safety Plans",
      "Workers' Compensation Claims",
      "Medical Treatment Records",
      "Witness Statements",
    ],
    "Machinery/Equipment Injury": [
      "Equipment Maintenance Records",
      "Safety Training Documentation",
      "OSHA Reports",
      "Equipment Manuals/Warnings",
      "Lockout/Tagout Procedures",
      "Medical Records",
    ],
    "Fall from Height": [
      "Safety Harness/Equipment Records",
      "Fall Protection Plans",
      "Training Documentation",
      "OSHA Citations",
      "Medical Treatment Records",
      "Site Inspection Reports",
    ],
    "Chemical Exposure": [
      "Material Safety Data Sheets (MSDS)",
      "Exposure Monitoring Records",
      "Personal Protective Equipment Logs",
      "Medical Surveillance Records",
      "OSHA Reports",
      "Toxicology Reports",
    ],
    "Repetitive Stress Injury": [
      "Ergonomic Assessments",
      "Job Description/Requirements",
      "Medical Records",
      "Physical Therapy Documentation",
      "Workplace Modification Records",
      "Workers' Compensation Claims",
    ],
    "Workplace Violence": [
      "Incident Reports",
      "Security Records/Footage",
      "Employee Background Checks",
      "Workplace Violence Policies",
      "Medical/Psychological Records",
      "Police Reports",
    ],
  },
  assault: {
    "Physical Assault": [
      "Police Report",
      "Emergency Medical Records",
      "Criminal Case Documentation",
      "Witness Statements",
      "Surveillance Footage",
      "Medical Treatment Records",
      "Psychological Evaluation",
    ],
    "Sexual Assault": [
      "Police Report",
      "Medical Examination Records",
      "Counseling/Therapy Records",
      "Criminal Case Files",
      "Expert Testimony Documentation",
      "Psychological Treatment Records",
    ],
    "Domestic Violence": [
      "Police Reports",
      "Medical Records",
      "Protective Order Documentation",
      "Counseling Records",
      "Witness Statements",
      "Photos of Injuries",
    ],
    "Bar/Nightclub Incident": [
      "Police Report",
      "Security Footage",
      "Incident Reports",
      "Alcohol Service Records",
      "Security Training Documentation",
      "Medical Records",
    ],
    "Road Rage": [
      "Police Report",
      "Traffic Camera Footage",
      "Vehicle Damage Documentation",
      "Medical Records",
      "Witness Statements",
      "Criminal Case Files",
    ],
    "Security Negligence": [
      "Security Company Records",
      "Training Documentation",
      "Incident Reports",
      "Property Security Assessments",
      "Surveillance Systems Documentation",
      "Medical Records",
    ],
  },
}

export default function NewCasePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caseCreated, setCaseCreated] = useState(false)
  const [caseId, setCaseId] = useState("")
  const [formData, setFormData] = useState({
    // Step 1: Basic Case Information
    caseName: "",
    clientName: "",
    incidentDate: "",
    representingParty: "",
    caseStatus: "",
    assignedAttorney: "",
    priorityLevel: "",
    caseDescription: "",

    // Step 2: Injury Classification
    primaryInjury: "",
    subCategory: "",

    // Step 3: Medical Specialty Focus
    bodySystems: [] as string[],
  })

  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([])
  const [wantsSummary, setWantsSummary] = useState<boolean | null>(null)
  const [summaryTemplate, setSummaryTemplate] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState<{
    missingDocuments: string[]
    summary: string
    confidence: number
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleBodySystem = (systemId: string) => {
    setFormData((prev) => ({
      ...prev,
      bodySystems: prev.bodySystems.includes(systemId)
        ? prev.bodySystems.filter((id) => id !== systemId)
        : [...prev.bodySystems, systemId],
    }))
  }

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return (
        formData.caseName.trim() !== "" &&
        formData.clientName.trim() !== "" &&
        formData.incidentDate !== "" &&
        formData.representingParty !== "" &&
        formData.caseStatus !== "" &&
        formData.assignedAttorney !== ""
      )
    }
    if (currentStep === 2) {
      return formData.primaryInjury !== ""
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      console.log("[v0] Starting case creation with data:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate case ID
      const newCaseId = `CASE-${Date.now()}`
      setCaseId(newCaseId)

      const caseData = {
        id: newCaseId,
        name: formData.caseName,
        client: formData.clientName,
        type: formData.primaryInjury,
        subType: formData.subCategory,
        incidentDate: formData.incidentDate,
        status: "Initial Review",
        progress: 0,
        priority: formData.priorityLevel || "Medium", // Use form priority level
        assignedAttorney: formData.assignedAttorney,
        estimatedValue: "",
        documentsCount: 0,
        lastActivity: "Case created",
        createdAt: new Date().toISOString(),
        formData: formData,
      }

      // Get existing cases from localStorage
      const existingCases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")

      // Add new case
      existingCases.push(caseData)

      // Save back to localStorage
      localStorage.setItem("medchrono_cases", JSON.stringify(existingCases))

      console.log("[v0] Case created successfully:", caseData)

      setCaseCreated(true)
      setCurrentStep(4) // Move to document upload step
    } catch (error) {
      console.error("[v0] Error creating case:", error)
      alert("Error creating case. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocumentChoice = (choice: "upload" | "skip" | "summary") => {
    if (choice === "summary") {
      setWantsSummary(true)
      // Summary requires document upload
    } else if (choice === "upload") {
      setWantsSummary(false)
      // Redirect to document upload with case context
      router.push(`/dashboard/documents/upload?caseId=${caseId}&caseName=${encodeURIComponent(formData.caseName)}`)
    } else {
      // Skip and go to cases page
      router.push("/dashboard/cases?created=true")
    }
  }

  const handleDocumentUpload = async (documentName: string) => {
    setUploadedDocuments((prev) => [...prev, documentName])

    // Simulate AI analysis after upload
    if (uploadedDocuments.length + 1 >= 3) {
      // Trigger analysis after 3+ documents
      setIsAnalyzing(true)

      // Simulate AI analysis delay
      setTimeout(() => {
        const allRequiredDocs = getRequiredDocuments()
        const missing = allRequiredDocs.filter(
          (doc) =>
            !uploadedDocuments.some((uploaded) => doc.toLowerCase().includes(uploaded.toLowerCase().split(" ")[0])),
        )

        setAiAnalysis({
          missingDocuments: missing.slice(0, 3), // Show top 3 missing
          summary: `Based on the uploaded documents, this appears to be a ${formData.primaryInjury} case with ${formData.subCategory} specifics. The medical records indicate injuries consistent with the incident type. Key findings include documented treatment timeline and medical causation evidence.`,
          confidence: 87,
        })
        setIsAnalyzing(false)
      }, 2000)
    }
  }

  const summaryTemplates = [
    { id: "chronological", name: "Chronological Timeline", description: "Events organized by date and time" },
    { id: "medical", name: "Medical Summary", description: "Focus on medical treatment and injuries" },
    { id: "legal", name: "Legal Brief Format", description: "Structured for legal proceedings" },
    { id: "insurance", name: "Insurance Claim Format", description: "Optimized for insurance submissions" },
    { id: "expert", name: "Expert Witness Report", description: "Detailed analysis for expert testimony" },
  ]

  const getRequiredDocuments = () => {
    const categoryDocs = documentRequirements[formData.primaryInjury as keyof typeof documentRequirements]
    if (!categoryDocs) return []

    if (formData.subCategory && categoryDocs[formData.subCategory as keyof typeof categoryDocs]) {
      return categoryDocs[formData.subCategory as keyof typeof categoryDocs] as string[]
    }

    // Return first sub-category as default if no specific sub-category selected
    const firstSubCategory = Object.keys(categoryDocs)[0]
    return (categoryDocs[firstSubCategory as keyof typeof categoryDocs] as string[]) || []
  }

  const getSubCategories = () => {
    switch (formData.primaryInjury) {
      case "mva":
        return mvaSubCategories
      case "slip-fall":
        return slipFallSubCategories
      case "med-malpractice":
        return medMalpracticeSubCategories
      case "product-liability":
        return productLiabilitySubCategories
      case "workplace":
        return workplaceSubCategories
      case "assault":
        return assaultSubCategories
      default:
        return []
    }
  }

  const getSubCategoryTitle = () => {
    switch (formData.primaryInjury) {
      case "mva":
        return "MVA Sub-Categories"
      case "slip-fall":
        return "Slip & Fall Sub-Categories"
      case "med-malpractice":
        return "Medical Malpractice Sub-Categories"
      case "product-liability":
        return "Product Liability Sub-Categories"
      case "workplace":
        return "Workplace Injury Sub-Categories"
      case "assault":
        return "Assault/Battery Sub-Categories"
      default:
        return "Sub-Categories"
    }
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                {caseCreated ? "Case Created Successfully" : "New Case Setup"}
              </h1>
              <p className="text-gray-600">
                {caseCreated
                  ? "Would you like to upload documents for this case?"
                  : "Create a new case and configure initial settings"}
              </p>
            </div>
          </div>

          {!caseCreated && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Step {currentStep} of 3</div>
              <Progress value={(currentStep / 3) * 100} className="w-32" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Step 1: Basic Case Information */}
        {currentStep === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">Basic Case Information</CardTitle>
                  <CardDescription>Enter the fundamental details about this case</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="caseName">Case Name/Number *</Label>
                  <Input
                    id="caseName"
                    placeholder="Enter case name or number"
                    value={formData.caseName}
                    onChange={(e) => updateFormData("caseName", e.target.value)}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">3-50 characters, alphanumeric</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client full name"
                    value={formData.clientName}
                    onChange={(e) => updateFormData("clientName", e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Date of Incident *</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => updateFormData("incidentDate", e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representingParty">Representing Party *</Label>
                  <Select
                    value={formData.representingParty}
                    onValueChange={(value) => updateFormData("representingParty", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select party" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plaintiff">Plaintiff</SelectItem>
                      <SelectItem value="defendant">Defendant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseStatus">Case Status *</Label>
                  <Select value={formData.caseStatus} onValueChange={(value) => updateFormData("caseStatus", value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="litigation">Litigation</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedAttorney">Assigned Attorney *</Label>
                  <Select
                    value={formData.assignedAttorney}
                    onValueChange={(value) => updateFormData("assignedAttorney", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select attorney" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john-doe">John Doe</SelectItem>
                      <SelectItem value="jane-smith">Jane Smith</SelectItem>
                      <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorityLevel">Priority Level</Label>
                  <Select
                    value={formData.priorityLevel}
                    onValueChange={(value) => updateFormData("priorityLevel", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caseDescription">Case Description</Label>
                <Textarea
                  id="caseDescription"
                  placeholder="Brief description of the case circumstances..."
                  value={formData.caseDescription}
                  onChange={(e) => updateFormData("caseDescription", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={nextStep} className="bg-cyan-600 hover:bg-cyan-700">
                  Next: Injury Classification
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Injury Classification */}
        {currentStep === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="font-serif text-xl">Injury Classification</CardTitle>
                  <CardDescription>Select the primary injury category and specifics</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-4 block">Primary Injury Categories *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {injuryCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.primaryInjury === category.id
                          ? "border-cyan-600 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => updateFormData("primaryInjury", category.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                          <category.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{category.label}</h3>
                          {formData.primaryInjury === category.id && (
                            <Badge className="mt-1 bg-cyan-600">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.primaryInjury && getSubCategories().length > 0 && (
                <div>
                  <Label className="text-base font-medium mb-4 block">{getSubCategoryTitle()}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getSubCategories().map((subCategory) => (
                      <div
                        key={subCategory}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.subCategory === subCategory
                            ? "border-cyan-600 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => updateFormData("subCategory", subCategory)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{subCategory}</span>
                          {formData.subCategory === subCategory && <CheckCircle className="w-5 h-5 text-cyan-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={nextStep} className="bg-cyan-600 hover:bg-cyan-700">
                  Next: Medical Focus
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Medical Specialty Focus */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-xl">Medical Specialty Focus</CardTitle>
                    <CardDescription>Select the body systems affected by this injury</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">Body Systems Affected (Multi-select)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bodySystemsAffected.map((system) => (
                      <div
                        key={system.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.bodySystems.includes(system.id)
                            ? "border-cyan-600 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleBodySystem(system.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <system.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{system.label}</h3>
                            <p className="text-sm text-gray-500">{system.description}</p>
                          </div>
                          {formData.bodySystems.includes(system.id) && (
                            <CheckCircle className="w-5 h-5 text-cyan-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !validateCurrentStep()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Case...
                      </>
                    ) : (
                      <>
                        Create Case
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document Requirements Matrix */}
            {formData.primaryInjury && getRequiredDocuments().length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif">Required Documents Checklist</CardTitle>
                  <CardDescription>AI-generated document requirements based on your case type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getRequiredDocuments().map((doc, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{doc}</p>
                        </div>
                        <Checkbox />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> This checklist is automatically generated based on your case type. You can
                      modify it after case creation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 4: Enhanced Document Upload Choice */}
        {currentStep === 4 && caseCreated && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <CardTitle className="font-serif text-2xl text-green-600">Case Created Successfully!</CardTitle>
                <CardDescription className="text-lg">
                  Case ID: <strong>{caseId}</strong> has been created for {formData.clientName}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {!wantsSummary && wantsSummary !== true && (
                  <>
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">What would you like to do next?</h3>
                      <p className="text-gray-600 mb-6">
                        You can upload documents now, generate an AI summary, or add documents later.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card
                        className="border-2 border-amber-200 hover:border-amber-400 cursor-pointer transition-all"
                        onClick={() => handleDocumentChoice("summary")}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-6 h-6" />
                          </div>
                          <h4 className="font-medium text-lg mb-2">Generate AI Summary</h4>
                          <p className="text-gray-600 text-sm mb-4">Upload documents and get AI-powered chronology</p>
                          <Button className="w-full bg-amber-600 hover:bg-amber-700">Generate Summary</Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="border-2 border-cyan-200 hover:border-cyan-400 cursor-pointer transition-all"
                        onClick={() => handleDocumentChoice("upload")}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-6 h-6" />
                          </div>
                          <h4 className="font-medium text-lg mb-2">Upload Documents</h4>
                          <p className="text-gray-600 text-sm mb-4">Upload case documents without summary</p>
                          <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Upload Documents</Button>
                        </CardContent>
                      </Card>

                      <Card
                        className="border-2 border-gray-200 hover:border-gray-400 cursor-pointer transition-all"
                        onClick={() => handleDocumentChoice("skip")}
                      >
                        <CardContent className="p-6 text-center">
                          <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowRight className="w-6 h-6" />
                          </div>
                          <h4 className="font-medium text-lg mb-2">Skip for Now</h4>
                          <p className="text-gray-600 text-sm mb-4">Add documents later</p>
                          <Button variant="outline" className="w-full bg-transparent">
                            Go to Cases
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {wantsSummary === true && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Generate AI Medical Chronology</h3>
                      <p className="text-gray-600 mb-6">
                        Upload your case documents and select a template for AI-powered analysis and summary generation.
                      </p>
                    </div>

                    {/* Template Selection */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="font-serif">Choose Summary Template</CardTitle>
                        <CardDescription>Select the format that best suits your needs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {summaryTemplates.map((template) => (
                            <Card
                              key={template.id}
                              className={`cursor-pointer transition-all ${
                                summaryTemplate === template.id
                                  ? "border-2 border-cyan-400 bg-cyan-50"
                                  : "border border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => setSummaryTemplate(template.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`w-4 h-4 rounded-full border-2 mt-1 ${
                                      summaryTemplate === template.id
                                        ? "bg-cyan-600 border-cyan-600"
                                        : "border-gray-300"
                                    }`}
                                  />
                                  <div>
                                    <h4 className="font-medium">{template.name}</h4>
                                    <p className="text-sm text-gray-600">{template.description}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Document Upload with Auto-tick */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="font-serif">Upload Required Documents</CardTitle>
                        <CardDescription>
                          Documents are required for AI summary generation. Upload progress will be tracked
                          automatically.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getRequiredDocuments().map((doc, index) => {
                            const isUploaded = uploadedDocuments.some((uploaded) =>
                              doc.toLowerCase().includes(uploaded.toLowerCase().split(" ")[0]),
                            )
                            return (
                              <div
                                key={index}
                                className={`flex items-center space-x-3 p-3 rounded-lg ${
                                  isUploaded ? "bg-green-50 border border-green-200" : "bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isUploaded ? "bg-green-100 text-green-600" : "bg-cyan-100 text-cyan-600"
                                  }`}
                                >
                                  {isUploaded ? <CheckCircle className="w-4 h-4" /> : index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium ${isUploaded ? "text-green-800" : ""}`}>{doc}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {isUploaded ? (
                                    <span className="text-sm text-green-600 font-medium">Uploaded</span>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDocumentUpload(doc.split(" ")[0])}
                                    >
                                      Upload
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Upload Progress */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Upload Progress</span>
                            <span className="text-sm text-blue-600">
                              {uploadedDocuments.length} of {getRequiredDocuments().length} documents
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(uploadedDocuments.length / getRequiredDocuments().length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Analysis Results */}
                    {(isAnalyzing || aiAnalysis) && (
                      <Card className="border-0 shadow-lg">
                        <CardHeader>
                          <CardTitle className="font-serif flex items-center space-x-2">
                            <Brain className="w-5 h-5" />
                            <span>AI Document Analysis</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isAnalyzing ? (
                            <div className="text-center py-8">
                              <div className="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-4" />
                              <p className="text-gray-600">Analyzing uploaded documents...</p>
                            </div>
                          ) : (
                            aiAnalysis && (
                              <div className="space-y-6">
                                <div className="flex items-center space-x-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                                  <span className="text-sm font-medium">
                                    Analysis Complete ({aiAnalysis.confidence}% confidence)
                                  </span>
                                </div>

                                {aiAnalysis.missingDocuments.length > 0 && (
                                  <div className="p-4 bg-amber-50 rounded-lg">
                                    <h4 className="font-medium text-amber-800 mb-2">Missing Documents Detected</h4>
                                    <ul className="space-y-1">
                                      {aiAnalysis.missingDocuments.map((doc, index) => (
                                        <li key={index} className="text-sm text-amber-700">
                                          • {doc}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="p-4 bg-green-50 rounded-lg">
                                  <h4 className="font-medium text-green-800 mb-2">Case Summary Preview</h4>
                                  <p className="text-sm text-green-700">{aiAnalysis.summary}</p>
                                </div>

                                <div className="flex space-x-4">
                                  <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" disabled={!summaryTemplate}>
                                    Generate Full{" "}
                                    {summaryTemplates.find((t) => t.id === summaryTemplate)?.name || "Summary"}
                                  </Button>
                                  <Button variant="outline" onClick={() => router.push("/dashboard/cases")}>
                                    Save & Continue Later
                                  </Button>
                                </div>
                              </div>
                            )
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Requirements Preview */}
            {formData.primaryInjury && getRequiredDocuments().length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-serif">Recommended Documents for This Case Type</CardTitle>
                  <CardDescription>
                    Based on your case classification: {formData.primaryInjury.toUpperCase()}
                    {formData.subCategory && ` - ${formData.subCategory}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {getRequiredDocuments()
                      .slice(0, 8)
                      .map((doc, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{doc}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                  {getRequiredDocuments().length > 8 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      +{getRequiredDocuments().length - 8} more documents recommended
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
