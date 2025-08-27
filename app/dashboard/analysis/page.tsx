"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import {
  Brain,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileText,
  Search,
  Download,
  Eye,
  Edit,
  Users,
  Calculator,
  DollarSign,
} from "lucide-react"

export default function AnalysisPage() {
  const [predictiveAnalysis, setPredictiveAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const generatePredictiveAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/predictive-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseData: {
            injuryType: "Motor Vehicle Accident",
            subCategory: "Car vs. Car",
            clientAge: 32,
            dateOfIncident: "2024-01-15",
          },
          documents: [],
        }),
      })

      const result = await response.json()
      if (result.success) {
        setPredictiveAnalysis(result.analysis)
      }
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const recoveryData = predictiveAnalysis?.treatmentOutcome || null

  const causationData = predictiveAnalysis?.causationAnalysis || null

  const settlementData = predictiveAnalysis?.settlementPrediction || null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Medical Analysis Engine</h1>
          <p className="text-gray-600 mt-2">Advanced medical document analysis with predictive insights</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-cyan-600 text-cyan-600 hover:bg-cyan-50 bg-transparent"
            onClick={() => (window.location.href = "/dashboard/templates")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Chronology
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={generatePredictiveAnalysis} disabled={isAnalyzing}>
            <Brain className="w-4 h-4 mr-2" />
            {isAnalyzing ? "Running Analysis..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Button onClick={generatePredictiveAnalysis} disabled={isAnalyzing} className="bg-cyan-600 hover:bg-cyan-700">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating AI Analysis...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Generate AI Predictive Analysis
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analysis">Medical Analysis</TabsTrigger>
          <TabsTrigger value="missing">Missing Documents</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="chronology">Chronology</TabsTrigger>
          <TabsTrigger value="causation">Causation</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                NLP Processing Queue
              </CardTitle>
              <CardDescription>Medical terminology extraction and clinical data analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Analysis</h3>
                <p className="text-gray-600 mb-4">Upload medical documents to begin AI analysis and processing.</p>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Data Extraction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-600" />
                  Clinical Data Points
                </CardTitle>
                <CardDescription>Extracted medical information with confidence scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      category: "Initial Injury",
                      data: "Traumatic brain injury with loss of consciousness",
                      confidence: 96,
                      code: "S06.9",
                    },
                    {
                      category: "Diagnostic Tests",
                      data: "CT Head, MRI Cervical Spine, Neuropsych Testing",
                      confidence: 98,
                      code: "Multiple",
                    },
                    {
                      category: "Treatment Plan",
                      data: "Physical therapy, cognitive rehabilitation, pain management",
                      confidence: 92,
                      code: "Multiple",
                    },
                    {
                      category: "Functional Status",
                      data: "Moderate cognitive impairment, chronic pain syndrome",
                      confidence: 89,
                      code: "F06.70",
                    },
                  ].map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{item.category}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.code}
                          </Badge>
                          <Badge
                            variant={item.confidence > 95 ? "default" : item.confidence > 85 ? "secondary" : "outline"}
                          >
                            {item.confidence}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{item.data}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Treatment Progression
                </CardTitle>
                <CardDescription>Symptom tracking and treatment effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: "Pain Level", initial: 8, current: 6, trend: "improving", target: 4 },
                    { metric: "Cognitive Function", initial: 3, current: 5, trend: "improving", target: 7 },
                    { metric: "Physical Mobility", initial: 4, current: 6, trend: "stable", target: 8 },
                    { metric: "Work Capacity", initial: 2, current: 4, trend: "improving", target: 8 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.metric}</span>
                        <Badge
                          variant={
                            item.trend === "improving"
                              ? "default"
                              : item.trend === "stable"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {item.trend}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>Initial: {item.initial}/10</span>
                        <span>•</span>
                        <span>Current: {item.current}/10</span>
                        <span>•</span>
                        <span>Target: {item.target}/10</span>
                      </div>
                      <Progress value={(item.current / 10) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="missing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Missing Document Detection
              </CardTitle>
              <CardDescription>AI-powered gap analysis and automated request generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-red-700">Critical Missing</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">7</div>
                    <div className="text-sm text-orange-700">Important Missing</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">12</div>
                    <div className="text-sm text-yellow-700">Suggested Missing</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Critical Missing Documents</CardTitle>
                <CardDescription>Essential for case strength - immediate action required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      document: "Emergency Room Records",
                      provider: "Metro General Hospital",
                      date: "2024-01-15",
                      reason: "Initial injury documentation missing",
                      impact: "Cannot establish injury causation",
                    },
                    {
                      document: "Neurological Consultation",
                      provider: "Dr. Sarah Chen, Neurology",
                      date: "2024-01-18",
                      reason: "Referenced in PT notes but not provided",
                      impact: "Missing TBI diagnosis confirmation",
                    },
                    {
                      document: "MRI Report Interpretation",
                      provider: "Advanced Imaging Center",
                      date: "2024-02-10",
                      reason: "Images provided but radiologist report missing",
                      impact: "Cannot quantify structural damage",
                    },
                  ].map((item, index) => (
                    <div key={index} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-red-800">{item.document}</h4>
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          Generate Request
                        </Button>
                      </div>
                      <p className="text-sm text-red-700 mb-1">
                        {item.provider} • {item.date}
                      </p>
                      <p className="text-sm text-red-600 mb-2">{item.reason}</p>
                      <p className="text-xs text-red-500 italic">Impact: {item.impact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Important Missing Documents</CardTitle>
                <CardDescription>Supports case narrative - should be obtained</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      document: "Physical Therapy Progress Notes",
                      provider: "Rehabilitation Associates",
                      dateRange: "2024-01-25 to 2024-03-15",
                      reason: "3-month gap in treatment documentation",
                    },
                    {
                      document: "Psychiatric Evaluation",
                      provider: "Mental Health Services",
                      dateRange: "2024-02-01",
                      reason: "PTSD symptoms documented but no formal evaluation",
                    },
                    {
                      document: "Employer Injury Report",
                      provider: "ABC Construction Co.",
                      dateRange: "2024-01-15",
                      reason: "Work-related injury but no employer documentation",
                    },
                  ].map((item, index) => (
                    <div key={index} className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-orange-800">{item.document}</h4>
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          Request
                        </Button>
                      </div>
                      <p className="text-sm text-orange-700 mb-1">
                        {item.provider} • {item.dateRange}
                      </p>
                      <p className="text-sm text-orange-600">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Automated Request Generation</CardTitle>
              <CardDescription>Pre-written medical records requests with HIPAA compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  className="bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => {
                    // Generate critical document requests
                    alert("Generating critical document requests...")
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate All Critical Requests
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Download HIPAA forms
                    alert("Downloading HIPAA forms...")
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download HIPAA Forms
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Schedule follow-ups
                    alert("Scheduling follow-ups...")
                  }}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Follow-ups
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Recovery Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!recoveryData ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recovery analysis available</p>
                    <p className="text-sm">Run AI analysis to generate predictions</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{recoveryData.recoveryTimeline.expected}</p>
                    <p className="text-sm text-gray-600 mt-1">Months to MMI</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Conservative</span>
                        <span>{recoveryData.recoveryTimeline.conservative} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected</span>
                        <span>{recoveryData.recoveryTimeline.expected} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimistic</span>
                        <span>{recoveryData.recoveryTimeline.optimistic} months</span>
                      </div>
                    </div>
                    <Badge className="mt-3" variant="outline">
                      Based on 500K+ cases
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Future Medical Costs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!recoveryData ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recovery analysis available</p>
                    <p className="text-sm">Run AI analysis to generate predictions</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">${recoveryData.futureMedicalCosts.total}</p>
                    <p className="text-sm text-gray-600 mt-1">Projected lifetime</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ongoing therapy</span>
                        <span>${recoveryData.futureMedicalCosts.ongoingTherapy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medications</span>
                        <span>${recoveryData.futureMedicalCosts.medications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Follow-up care</span>
                        <span>${recoveryData.futureMedicalCosts.followupCare}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                  Return to Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!recoveryData ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recovery analysis available</p>
                    <p className="text-sm">Run AI analysis to generate predictions</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {recoveryData.returnToWorkLikelihood.fullCapacity}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Full capacity likelihood</p>
                    <div className="mt-4">
                      <Progress value={recoveryData.returnToWorkLikelihood.fullCapacity} className="w-full" />
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Modified duty</span>
                          <span>{recoveryData.returnToWorkLikelihood.modifiedDuty}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Part-time</span>
                          <span>{recoveryData.returnToWorkLikelihood.partTime}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Disability Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!recoveryData ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recovery analysis available</p>
                    <p className="text-sm">Run AI analysis to generate predictions</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-600">{recoveryData.disabilityProbability}%</p>
                    <p className="text-sm text-gray-600 mt-1">Permanent disability</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Cognitive</span>
                        <span className="text-amber-600">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Physical</span>
                        <span className="text-yellow-600">Medium</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Psychological</span>
                        <span className="text-amber-600">High</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Predictive Factors Analysis</CardTitle>
              <CardDescription>Key factors influencing outcome predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Positive Factors</h4>
                  {[
                    { factor: "Young age (32 years)", impact: "+15% recovery", weight: 85 },
                    { factor: "No pre-existing conditions", impact: "+20% outcome", weight: 92 },
                    { factor: "High treatment compliance", impact: "+10% recovery", weight: 78 },
                    { factor: "Strong support system", impact: "+8% outcome", weight: 65 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{item.factor}</p>
                        <p className="text-sm text-green-600">{item.impact}</p>
                      </div>
                      <Badge variant="outline" className="text-green-700">
                        {item.weight}%
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Factors</h4>
                  {[
                    { factor: "Severe initial injury", impact: "-25% recovery", weight: 95 },
                    { factor: "Multiple body systems", impact: "-15% outcome", weight: 88 },
                    { factor: "Delayed treatment", impact: "-12% recovery", weight: 72 },
                    { factor: "Psychological trauma", impact: "-18% outcome", weight: 81 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">{item.factor}</p>
                        <p className="text-sm text-red-600">{item.impact}</p>
                      </div>
                      <Badge variant="outline" className="text-red-700">
                        {item.weight}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chronology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                Chronology Template Generator
              </CardTitle>
              <CardDescription>AI-powered medical chronology creation with customizable templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Standard Medical Chronology",
                    description: "Comprehensive timeline with all medical events",
                    pages: "8-12 pages",
                    useCase: "Complete case overview",
                  },
                  {
                    name: "Executive Summary",
                    description: "Condensed 2-3 page overview for quick review",
                    pages: "2-3 pages",
                    useCase: "Client presentations",
                  },
                  {
                    name: "Treatment-Focused",
                    description: "Emphasis on therapeutic interventions and outcomes",
                    pages: "6-8 pages",
                    useCase: "Medical expert review",
                  },
                  {
                    name: "Damages-Specific",
                    description: "Timeline focused on economic losses and impacts",
                    pages: "4-6 pages",
                    useCase: "Settlement negotiations",
                  },
                  {
                    name: "Expert Witness Prep",
                    description: "Structured for medical expert testimony support",
                    pages: "10-15 pages",
                    useCase: "Trial preparation",
                  },
                  {
                    name: "Insurance Demand",
                    description: "Settlement-focused with emphasis on liability",
                    pages: "6-10 pages",
                    useCase: "Demand packages",
                  },
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Length:</span>
                          <span className="font-medium">{template.pages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Best for:</span>
                          <span className="font-medium">{template.useCase}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700"
                        size="sm"
                        onClick={() => (window.location.href = "/dashboard/templates")}
                      >
                        Generate Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chronology Customization</CardTitle>
              <CardDescription>Configure your chronology generation preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All dates</SelectItem>
                      <SelectItem value="incident">From incident date</SelectItem>
                      <SelectItem value="treatment">Treatment period only</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider Filter</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All providers</SelectItem>
                      <SelectItem value="primary">Primary care only</SelectItem>
                      <SelectItem value="specialists">Specialists only</SelectItem>
                      <SelectItem value="hospital">Hospital records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medical Specialty</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All specialties</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confidentiality</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High confidentiality</SelectItem>
                      <SelectItem value="redacted">Redacted version</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Chronologies</CardTitle>
              <CardDescription>Recent chronology generations with review and editing options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Johnson v. Metro Hospital - Standard Chronology",
                    type: "Standard Medical",
                    created: "2024-01-20",
                    pages: 12,
                    status: "ready",
                    version: "v2.1",
                  },
                  {
                    name: "Smith MVA Case - Executive Summary",
                    type: "Executive Summary",
                    created: "2024-01-18",
                    pages: 3,
                    status: "review",
                    version: "v1.0",
                  },
                  {
                    name: "Williams Slip & Fall - Damages Timeline",
                    type: "Damages-Specific",
                    created: "2024-01-15",
                    pages: 6,
                    status: "generating",
                    version: "v1.0",
                  },
                ].map((chronology, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{chronology.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{chronology.type}</span>
                        <span>•</span>
                        <span>{chronology.pages} pages</span>
                        <span>•</span>
                        <span>{chronology.created}</span>
                        <span>•</span>
                        <span>{chronology.version}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          chronology.status === "ready"
                            ? "default"
                            : chronology.status === "review"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {chronology.status}
                      </Badge>
                      {chronology.status === "ready" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // View chronology
                              alert("Opening chronology viewer...")
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Edit chronology
                              alert("Opening chronology editor...")
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Export chronology
                              alert("Exporting chronology...")
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="causation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                Medical Causation Analysis
              </CardTitle>
              <CardDescription>AI-powered causation assessment with medical literature support</CardDescription>
            </CardHeader>
            <CardContent>
              {!causationData ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No causation analysis available</p>
                  <p className="text-sm">Upload medical documents to analyze causation</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-700">Supporting Evidence</h4>
                    {[
                      {
                        factor: "Temporal Relationship",
                        strength: causationData.temporalRelationship,
                        evidence: "Symptoms began immediately after incident",
                        support: "Strong",
                      },
                      {
                        factor: "Medical Literature",
                        strength: causationData.literatureSupport,
                        evidence: "15 peer-reviewed studies support injury mechanism",
                        support: "Strong",
                      },
                      {
                        factor: "Expert Opinion",
                        strength: causationData.medicalEvidence,
                        evidence: "Neurologist confirms causation likelihood",
                        support: "Strong",
                      },
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-green-800">{item.factor}</h5>
                          <Badge className="bg-green-600">{item.strength}%</Badge>
                        </div>
                        <p className="text-sm text-green-700 mb-1">{item.evidence}</p>
                        <p className="text-xs text-green-600">Support Level: {item.support}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-700">Challenging Factors</h4>
                    {[
                      {
                        factor: "Pre-existing Conditions",
                        risk: 35,
                        evidence: "Prior back injury documented 2 years ago",
                        impact: "Moderate",
                      },
                      {
                        factor: "Alternative Causation",
                        risk: 25,
                        evidence: "Degenerative changes noted on imaging",
                        impact: "Low",
                      },
                      {
                        factor: "Treatment Delay",
                        risk: 15,
                        evidence: "48-hour delay in seeking treatment",
                        impact: "Minimal",
                      },
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-red-800">{item.factor}</h5>
                          <Badge variant="destructive">{item.risk}%</Badge>
                        </div>
                        <p className="text-sm text-red-700 mb-1">{item.evidence}</p>
                        <p className="text-xs text-red-600">Impact Level: {item.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Causation Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {!causationData ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No causation analysis available</p>
                  <p className="text-sm">Upload medical documents to analyze causation</p>
                </div>
              ) : (
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">{causationData.overallConfidence}%</div>
                  <div className="text-lg text-gray-700">Causation Confidence</div>
                  <Badge className="mt-2 bg-green-600">Strong Causation</Badge>
                </div>
              )}
              {!causationData ? null : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">{causationData.medicalEvidence}%</div>
                    <div className="text-sm text-gray-600">Medical Evidence</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">{causationData.temporalRelationship}%</div>
                    <div className="text-sm text-gray-600">Temporal Relationship</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">{causationData.literatureSupport}%</div>
                    <div className="text-sm text-gray-600">Literature Support</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-green-600" />
                AI Settlement Prediction Model
              </CardTitle>
              <CardDescription>Based on 250,000+ historical cases with jurisdiction-specific analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {!settlementData ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No settlement analysis available</p>
                  <p className="text-sm">Complete case analysis to generate settlement predictions</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-blue-600">Conservative</CardTitle>
                      <CardDescription className="text-sm">25th percentile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">${settlementData.conservative}</div>
                      <div className="text-sm text-gray-600 mt-2">Safe settlement range</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-green-600">Expected</CardTitle>
                      <CardDescription className="text-sm">50th percentile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">${settlementData.expected}</div>
                      <div className="text-sm text-gray-600 mt-2">Most likely outcome</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-amber-600">Optimistic</CardTitle>
                      <CardDescription className="text-sm">75th percentile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600">${settlementData.optimistic}</div>
                      <div className="text-sm text-gray-600 mt-2">Strong negotiation</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-purple-600">Trial Potential</CardTitle>
                      <CardDescription className="text-sm">90th percentile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">${settlementData.trialPotential}</div>
                      <div className="text-sm text-gray-600 mt-2">Jury verdict range</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {!settlementData ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Damages Quantification</CardTitle>
                  <CardDescription>Detailed breakdown of economic and non-economic damages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Past Medical Expenses</span>
                      <span className="font-bold">${settlementData.damages.pastMedical}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Future Medical Costs</span>
                      <span className="font-bold">${settlementData.damages.futureMedical}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Lost Wages (Past)</span>
                      <span className="font-bold">${settlementData.damages.lostWagesPast}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Lost Earning Capacity</span>
                      <span className="font-bold">${settlementData.damages.lostEarningCapacity}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <span className="font-medium">Pain & Suffering</span>
                      <span className="font-bold text-cyan-600">
                        ${settlementData.damages.painSuffering.min} - ${settlementData.damages.painSuffering.max}
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total Economic</span>
                        <span className="text-lg font-bold">
                          $
                          {settlementData.damages.pastMedical +
                            settlementData.damages.futureMedical +
                            settlementData.damages.lostWagesPast +
                            settlementData.damages.lostEarningCapacity}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jurisdiction Analysis</CardTitle>
                  <CardDescription>Local court trends and insurance company behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Court Trends</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Average TBI Settlement</span>
                          <span className="font-medium">$195,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Judge Martinez (assigned)</span>
                          <span className="font-medium">Plaintiff-friendly</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recent similar verdicts</span>
                          <span className="font-medium">$180K - $320K</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Insurance Behavior</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>State Farm (defendant)</span>
                          <span className="font-medium">Settles 78% pre-trial</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average settlement ratio</span>
                          <span className="font-medium">0.85x demand</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time to settlement</span>
                          <span className="font-medium">14 months avg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!settlementData ? null : (
            <Card>
              <CardHeader>
                <CardTitle>Comparable Case Analysis</CardTitle>
                <CardDescription>Similar cases with outcomes and key factors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      case: "Martinez v. City Transit (2023)",
                      similarity: 92,
                      outcome: "$210,000 settlement",
                      factors: "TBI, similar age, comparable medical costs",
                      timeframe: "16 months",
                    },
                    {
                      case: "Thompson v. ABC Trucking (2023)",
                      similarity: 87,
                      outcome: "$185,000 settlement",
                      factors: "MVA, cervical injury, PTSD components",
                      timeframe: "12 months",
                    },
                    {
                      case: "Davis v. Metro Hospital (2022)",
                      similarity: 84,
                      outcome: "$245,000 verdict",
                      factors: "Medical malpractice, similar injuries, went to trial",
                      timeframe: "24 months",
                    },
                  ].map((comp, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{comp.case}</h4>
                        <Badge variant="outline">{comp.similarity}% similar</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Outcome: </span>
                          <span className="font-medium">{comp.outcome}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Timeline: </span>
                          <span className="font-medium">{comp.timeframe}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Key Factors: </span>
                          <span className="font-medium">{comp.factors}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
