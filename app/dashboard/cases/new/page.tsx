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
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  AlertCircle,
} from "lucide-react"

// Import constants from a separate file to reduce component size
import {
  injuryCategories,
  bodySystemsAffected,
  documentRequirements,
  mvaSubCategories,
  slipFallSubCategories,
  medMalpracticeSubCategories,
  productLiabilitySubCategories,
  workplaceSubCategories,
  assaultSubCategories,
} from "./constants"

interface FormData {
  caseName: string
  clientName: string
  incidentDate: string
  representingParty: string
  caseStatus: string
  assignedAttorney: string
  priorityLevel: string
  caseDescription: string
  primaryInjury: string
  subCategory: string
  bodySystems: string[]
}

interface ValidationErrors {
  [key: string]: string
}

export default function NewCasePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caseCreated, setCaseCreated] = useState(false)
  const [caseId, setCaseId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState<FormData>({
    caseName: "",
    clientName: "",
    incidentDate: "",
    representingParty: "",
    caseStatus: "",
    assignedAttorney: "",
    priorityLevel: "",
    caseDescription: "",
    primaryInjury: "",
    subCategory: "",
    bodySystems: [],
  })

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleBodySystem = (systemId: string) => {
    setFormData((prev) => ({
      ...prev,
      bodySystems: prev.bodySystems.includes(systemId)
        ? prev.bodySystems.filter((id) => id !== systemId)
        : [...prev.bodySystems, systemId],
    }))
  }

  const validateStep1 = (): boolean => {
    const errors: ValidationErrors = {}

    // Case Name validation
    if (!formData.caseName.trim()) {
      errors.caseName = "Case name is required"
    } else if (formData.caseName.trim().length < 3) {
      errors.caseName = "Case name must be at least 3 characters"
    } else if (formData.caseName.trim().length > 50) {
      errors.caseName = "Case name must not exceed 50 characters"
    }

    // Client Name validation
    if (!formData.clientName.trim()) {
      errors.clientName = "Client name is required"
    }

    // Incident Date validation
    if (!formData.incidentDate) {
      errors.incidentDate = "Incident date is required"
    } else {
      const incidentDate = new Date(formData.incidentDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (incidentDate > today) {
        errors.incidentDate = "Incident date cannot be in the future"
      }
    }

    // Representing Party validation
    if (!formData.representingParty) {
      errors.representingParty = "Representing party is required"
    }

    // Case Status validation
    if (!formData.caseStatus) {
      errors.caseStatus = "Case status is required"
    }

    // Assigned Attorney validation
    if (!formData.assignedAttorney) {
      errors.assignedAttorney = "Assigned attorney is required"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.primaryInjury) {
      errors.primaryInjury = "Primary injury category is required"
    }

    // Subcategory is recommended but not strictly required
    if (!formData.subCategory && formData.primaryInjury) {
      errors.subCategory = "Subcategory is recommended for better document requirements"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) return validateStep1()
    if (currentStep === 2) return validateStep2()
    return true
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      setError("Please fix the validation errors before proceeding")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      console.log("Creating case with data:", formData)

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to create case")
      }

      console.log("Case created successfully:", data.case)

      setCaseId(data.case.id)
      setCaseCreated(true)
      setCurrentStep(4) // Move to document upload step
    } catch (err) {
      console.error("Error creating case:", err)
      setError(err instanceof Error ? err.message : "Failed to create case. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDocumentChoice = (choice: "upload" | "skip") => {
    if (choice === "upload") {
      router.push(`/dashboard/documents/upload?caseId=${caseId}&caseName=${encodeURIComponent(formData.caseName)}`)
    } else {
      router.push("/dashboard/cases?created=true")
    }
  }

  const getRequiredDocuments = () => {
    const categoryDocs = documentRequirements[formData.primaryInjury as keyof typeof documentRequirements]
    if (!categoryDocs) return []

    if (formData.subCategory && categoryDocs[formData.subCategory as keyof typeof categoryDocs]) {
      return categoryDocs[formData.subCategory as keyof typeof categoryDocs] as string[]
    }

    return []
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
    if (currentStep === 1 && !validateStep1()) {
      setError("Please fill in all required fields correctly")
      return
    }
    if (currentStep === 2 && !validateStep2()) {
      setError("Please select a primary injury category")
      return
    }
    setError(null)
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setError(null)
    setValidationErrors({})
    // Fixed: properly handle back button from step 4
    if (currentStep === 4 && caseCreated) {
      // If case is created and we're on step 4, go back to step 3
      setCurrentStep(3)
    } else {
      setCurrentStep((prev) => Math.max(1, prev - 1))
    }
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
        {/* Global Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
                    className={`h-11 ${validationErrors.caseName ? "border-red-500" : ""}`}
                  />
                  {validationErrors.caseName && (
                    <p className="text-xs text-red-500">{validationErrors.caseName}</p>
                  )}
                  {!validationErrors.caseName && (
                    <p className="text-xs text-gray-500">3-50 characters, alphanumeric</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    placeholder="Enter client full name"
                    value={formData.clientName}
                    onChange={(e) => updateFormData("clientName", e.target.value)}
                    className={`h-11 ${validationErrors.clientName ? "border-red-500" : ""}`}
                  />
                  {validationErrors.clientName && (
                    <p className="text-xs text-red-500">{validationErrors.clientName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Date of Incident *</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.incidentDate}
                    onChange={(e) => updateFormData("incidentDate", e.target.value)}
                    className={`h-11 ${validationErrors.incidentDate ? "border-red-500" : ""}`}
                  />
                  {validationErrors.incidentDate && (
                    <p className="text-xs text-red-500">{validationErrors.incidentDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="representingParty">Representing Party *</Label>
                  <Select
                    value={formData.representingParty}
                    onValueChange={(value) => updateFormData("representingParty", value)}
                  >
                    <SelectTrigger className={`h-11 ${validationErrors.representingParty ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select party" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plaintiff">Plaintiff</SelectItem>
                      <SelectItem value="defendant">Defendant</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.representingParty && (
                    <p className="text-xs text-red-500">{validationErrors.representingParty}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caseStatus">Case Status *</Label>
                  <Select value={formData.caseStatus} onValueChange={(value) => updateFormData("caseStatus", value)}>
                    <SelectTrigger className={`h-11 ${validationErrors.caseStatus ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="litigation">Litigation</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.caseStatus && (
                    <p className="text-xs text-red-500">{validationErrors.caseStatus}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedAttorney">Assigned Attorney *</Label>
                  <Select
                    value={formData.assignedAttorney}
                    onValueChange={(value) => updateFormData("assignedAttorney", value)}
                  >
                    <SelectTrigger className={`h-11 ${validationErrors.assignedAttorney ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Select attorney" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john-doe">John Doe</SelectItem>
                      <SelectItem value="jane-smith">Jane Smith</SelectItem>
                      <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.assignedAttorney && (
                    <p className="text-xs text-red-500">{validationErrors.assignedAttorney}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorityLevel">Priority Level (Optional)</Label>
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
                <Label htmlFor="caseDescription">Case Description (Optional)</Label>
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
                {validationErrors.primaryInjury && (
                  <p className="text-sm text-red-500 mb-2">{validationErrors.primaryInjury}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {injuryCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.primaryInjury === category.id
                          ? "border-cyan-600 bg-cyan-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        updateFormData("primaryInjury", category.id)
                        // Reset subcategory when changing primary injury
                        updateFormData("subCategory", "")
                      }}
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
                  {validationErrors.subCategory && (
                    <p className="text-sm text-amber-600 mb-2">{validationErrors.subCategory}</p>
                  )}
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
                    <CardDescription>Select the body systems affected by this injury (Optional)</CardDescription>
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
                    disabled={isSubmitting}
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

            {/* Document Requirements Preview */}
            {formData.primaryInjury && formData.subCategory && getRequiredDocuments().length > 0 && (
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
                      upload these documents after case creation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 4: Document Upload Choice */}
        {currentStep === 4 && caseCreated && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <CardTitle className="font-serif text-2xl text-green-600">Case Created Successfully!</CardTitle>
                <CardDescription className="text-lg">
                  Case ID: <strong className="text-cyan-600">{caseId}</strong> has been created for {formData.clientName}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">What would you like to do next?</h3>
                  <p className="text-gray-600 mb-6">
                    You can upload documents now or add them later from the case details page.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className="border-2 border-cyan-200 hover:border-cyan-400 cursor-pointer transition-all"
                    onClick={() => handleDocumentChoice("upload")}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="font-medium text-lg mb-2">Upload Documents</h4>
                      <p className="text-gray-600 text-sm mb-4">Add medical records and case documents</p>
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
                      <p className="text-gray-600 text-sm mb-4">Add documents later from case details</p>
                      <Button variant="outline" className="w-full">
                        Go to Cases
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center pt-4">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Review
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document Requirements Preview */}
            {formData.primaryInjury && formData.subCategory && getRequiredDocuments().length > 0 && (
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
