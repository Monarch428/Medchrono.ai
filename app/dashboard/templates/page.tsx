"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  Home,
  ChevronRight,
  FileText,
  Clock,
  Stethoscope,
  DollarSign,
  Scale,
  Shield,
  Gavel,
  Play,
  Download,
  Share,
  Edit,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Users,
  Printer,
  Mail,
  History,
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
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<string>("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showReviewInterface, setShowReviewInterface] = useState(false)
  const [storedCases, setStoredCases] = useState<any[]>([])

  useEffect(() => {
    const cases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
    setStoredCases(cases)
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleGenerateChronology = async () => {
    if (!selectedTemplate || !selectedCase) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setCurrentStep(0)

    // Simulate generation process
    for (let i = 0; i < generationSteps.length; i++) {
      setCurrentStep(i)
      setGenerationProgress(((i + 1) / generationSteps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    setIsGenerating(false)
    setShowReviewInterface(true)
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Chronology Templates</h1>
            <p className="text-gray-600 mt-1">Generate professional medical chronologies with AI-powered templates</p>
          </div>
        </div>

        {!showReviewInterface ? (
          <Tabs defaultValue="selection" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="selection">Template Selection</TabsTrigger>
              <TabsTrigger value="generation" disabled={!selectedTemplate}>
                Generation Process
              </TabsTrigger>
            </TabsList>

            <TabsContent value="selection" className="space-y-6">
              {/* Template Selection Interface */}
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
                              <div
                                className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center`}
                              >
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

              {/* Customization Options */}
              {selectedTemplate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Customization Options</CardTitle>
                    <CardDescription>Configure your chronology settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Case Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="case-select">Select Case</Label>
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

                      {/* Date Range */}
                      <div className="space-y-2">
                        <Label>Date Range Selection</Label>
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
                      {/* Provider Filtering */}
                      <div className="space-y-2">
                        <Label>Provider Filtering</Label>
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

                      {/* Medical Specialty Focus */}
                      <div className="space-y-2">
                        <Label>Medical Specialty Focus</Label>
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

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Selected: <span className="font-medium">{selectedTemplateData?.title}</span>
                      </div>
                      <Button
                        onClick={handleGenerateChronology}
                        disabled={!selectedCase}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Generate Chronology
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="generation" className="space-y-6">
              {/* Generation Process */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Chronology Generation Process</CardTitle>
                  <CardDescription>AI-powered automated chronology creation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isGenerating && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Generation Progress</span>
                        <span className="text-sm text-gray-600">{Math.round(generationProgress)}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}

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

                  {!isGenerating && currentStep === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate</h3>
                      <p className="text-gray-500 mb-4">Click "Generate Chronology" to start the automated process</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          /* Review and Editing Interface */
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Chronology Review & Editing</CardTitle>
              <CardDescription>Review, edit, and export your generated chronology</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className="bg-green-100 text-green-800">Generation Complete</Badge>
                  <span className="text-sm text-gray-600">{selectedTemplateData?.title} • Generated just now</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Comment
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Preview */}
                <div className="lg:col-span-2">
                  <Card className="h-96">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Document Preview</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="h-full bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chronology Preview</h3>
                        <p className="text-gray-500">Your generated chronology will appear here</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Review Tools */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Export Options</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Download className="w-4 h-4 mr-2" />
                        PDF Export
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <FileText className="w-4 h-4 mr-2" />
                        Word Document
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Distribution
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Format
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Collaboration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Users className="w-4 h-4 mr-2" />
                        Team Review
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comments
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <History className="w-4 h-4 mr-2" />
                        Version History
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReviewInterface(false)}>
                  Generate New Chronology
                </Button>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export Final
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
