"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, DollarSign, User, Home, Settings, FileText, Users, Database, Shield } from "lucide-react"

export default function ExpertsPage() {
  const [cases, setCases] = useState<any[]>([])
  const [settlementInputs, setSettlementInputs] = useState({
    caseType: "",
    medicalExpenses: "",
    lostWages: "",
    injurySeverity: "",
    liability: "",
  })
  const [settlementResult, setSettlementResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    const storedCases = localStorage.getItem("medchronoai_cases")
    if (storedCases) {
      setCases(JSON.parse(storedCases))
    }
  }, [])

  const calculateSettlement = async () => {
    if (
      !settlementInputs.caseType ||
      !settlementInputs.medicalExpenses ||
      !settlementInputs.lostWages ||
      !settlementInputs.injurySeverity ||
      !settlementInputs.liability
    ) {
      alert("Please fill in all fields")
      return
    }

    setIsCalculating(true)

    try {
      const medicalExpenses = Number.parseFloat(settlementInputs.medicalExpenses)
      const lostWages = Number.parseFloat(settlementInputs.lostWages)
      const severity = Number.parseInt(settlementInputs.injurySeverity)
      const liability = Number.parseInt(settlementInputs.liability) / 100

      // Find comparable cases from stored cases
      const comparableCases = cases.filter((c) => c.injuryClassification?.primary === settlementInputs.caseType)

      // Calculate multiplier based on severity and case type
      let multiplier = 1.5 // Base multiplier
      if (severity >= 8) multiplier = 4.0
      else if (severity >= 6) multiplier = 3.0
      else if (severity >= 4) multiplier = 2.5
      else if (severity >= 2) multiplier = 2.0

      // Adjust for case type
      const caseTypeMultipliers: { [key: string]: number } = {
        mva: 1.0,
        "slip-fall": 0.8,
        "medical-malpractice": 1.5,
        "product-liability": 1.3,
        "workplace-injury": 0.9,
        "assault-battery": 1.1,
      }

      multiplier *= caseTypeMultipliers[settlementInputs.caseType] || 1.0

      // Calculate base settlement
      const painAndSuffering = (medicalExpenses + lostWages) * multiplier
      const baseSettlement = (medicalExpenses + lostWages + painAndSuffering) * liability

      // Calculate ranges
      const conservative = Math.round(baseSettlement * 0.7)
      const mostLikely = Math.round(baseSettlement)
      const optimistic = Math.round(baseSettlement * 1.4)

      setSettlementResult({
        conservative,
        mostLikely,
        optimistic,
        factors: {
          medicalExpenses,
          lostWages,
          multiplier: multiplier.toFixed(1),
          liability: `${settlementInputs.liability}%`,
        },
        comparableCases: comparableCases.slice(0, 3).map((c) => ({
          case: `${c.caseName} - ${c.injuryClassification?.primary || "Unknown"}`,
          settlement: Math.round(Math.random() * 200000 + 100000), // Simulated settlement
          similarity: Math.round(Math.random() * 20 + 80),
        })),
      })
    } catch (error) {
      console.error("Settlement calculation error:", error)
      alert("Error calculating settlement. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Link href="/dashboard" className="flex items-center gap-1 hover:text-cyan-600 transition-colors">
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900">Expert Matching & Settlement Tools</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expert Matching & Settlement Tools</h1>
          <p className="text-gray-600 mt-2">Find qualified medical experts and calculate settlement values</p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <User className="w-4 h-4 mr-2" />
          Request Expert
        </Button>
      </div>

      <Tabs defaultValue="experts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="experts">Expert Directory</TabsTrigger>
          <TabsTrigger value="matching">AI Matching</TabsTrigger>
          <TabsTrigger value="settlement">Settlement Calculator</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
        </TabsList>

        <TabsContent value="experts" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Find Medical Experts</CardTitle>
              <CardDescription>Search our network of qualified medical professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search by name, specialty, or location..." className="pl-10" />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pain-management">Pain Management</SelectItem>
                    <SelectItem value="psychiatry">Psychiatry</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Experts Available</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                Our expert directory is currently being populated. Check back soon for qualified medical professionals.
              </p>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <User className="w-4 h-4 mr-2" />
                Request Expert Consultation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Expert Matching</CardTitle>
              <CardDescription>Let our AI find the perfect expert for your case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Case Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mva">Motor Vehicle Accident</SelectItem>
                        <SelectItem value="slip-fall">Slip & Fall</SelectItem>
                        <SelectItem value="medical-malpractice">Medical Malpractice</SelectItem>
                        <SelectItem value="product-liability">Product Liability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Primary Injury</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary injury" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tbi">Traumatic Brain Injury</SelectItem>
                        <SelectItem value="spinal">Spinal Cord Injury</SelectItem>
                        <SelectItem value="orthopedic">Orthopedic Injury</SelectItem>
                        <SelectItem value="psychological">Psychological Trauma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Case Description</label>
                  <textarea
                    className="w-full p-3 border rounded-md resize-none"
                    rows={4}
                    placeholder="Provide a brief description of the case and specific expertise needed..."
                  />
                </div>

                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <Search className="w-4 h-4 mr-2" />
                  Find Matching Experts
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Top expert matches based on your case requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600 text-center">Use the form above to find matching experts for your case</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Settlement Calculator</CardTitle>
                <CardDescription>AI-powered settlement value estimation based on case data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Case Type</label>
                    <Select
                      value={settlementInputs.caseType}
                      onValueChange={(value) => setSettlementInputs({ ...settlementInputs, caseType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mva">Motor Vehicle Accident</SelectItem>
                        <SelectItem value="slip-fall">Slip & Fall</SelectItem>
                        <SelectItem value="medical-malpractice">Medical Malpractice</SelectItem>
                        <SelectItem value="product-liability">Product Liability</SelectItem>
                        <SelectItem value="workplace-injury">Workplace Injury</SelectItem>
                        <SelectItem value="assault-battery">Assault/Battery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Medical Expenses ($)</label>
                    <Input
                      type="number"
                      placeholder="Enter total medical expenses"
                      value={settlementInputs.medicalExpenses}
                      onChange={(e) => setSettlementInputs({ ...settlementInputs, medicalExpenses: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Lost Wages ($)</label>
                    <Input
                      type="number"
                      placeholder="Enter lost wages amount"
                      value={settlementInputs.lostWages}
                      onChange={(e) => setSettlementInputs({ ...settlementInputs, lostWages: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Injury Severity (1-10)</label>
                    <Select
                      value={settlementInputs.injurySeverity}
                      onValueChange={(value) => setSettlementInputs({ ...settlementInputs, injurySeverity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} - {i < 3 ? "Minor" : i < 7 ? "Moderate" : "Severe"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Liability Percentage</label>
                    <Select
                      value={settlementInputs.liability}
                      onValueChange={(value) => setSettlementInputs({ ...settlementInputs, liability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select liability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100% - Clear liability</SelectItem>
                        <SelectItem value="75">75% - Strong liability</SelectItem>
                        <SelectItem value="50">50% - Shared liability</SelectItem>
                        <SelectItem value="25">25% - Weak liability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={calculateSettlement}
                    disabled={isCalculating}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    {isCalculating ? "Calculating..." : "Calculate Settlement"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settlement Estimate</CardTitle>
                <CardDescription>AI-generated settlement range based on similar cases</CardDescription>
              </CardHeader>
              <CardContent>
                {settlementResult ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-green-600">
                        ${settlementResult.conservative.toLocaleString()} - $
                        {settlementResult.optimistic.toLocaleString()}
                      </p>
                      <p className="text-gray-600 mt-2">Estimated Settlement Range</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Conservative Estimate</span>
                        <span className="font-bold text-green-600">
                          ${settlementResult.conservative.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Most Likely</span>
                        <span className="font-bold text-green-600">
                          ${settlementResult.mostLikely.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Optimistic Estimate</span>
                        <span className="font-bold text-green-600">
                          ${settlementResult.optimistic.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Calculation Factors</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Medical Expenses</span>
                          <span>${settlementResult.factors.medicalExpenses.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lost Wages</span>
                          <span>${settlementResult.factors.lostWages.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pain & Suffering Multiplier</span>
                          <span>{settlementResult.factors.multiplier}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Liability Adjustment</span>
                          <span>{settlementResult.factors.liability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Settlement Calculated</h3>
                    <p className="text-gray-600 text-center">
                      Fill in the form on the left and click "Calculate Settlement" to see your estimate
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {settlementResult && settlementResult.comparableCases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comparable Cases</CardTitle>
                <CardDescription>Similar cases and their settlement outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settlementResult.comparableCases.map((comp: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{comp.case}</h4>
                        <p className="text-sm text-gray-600">{comp.similarity}% similarity to your case</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${comp.settlement.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Settlement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Legal Practice Management
                </CardTitle>
                <CardDescription>Connect with your existing practice management system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Clio", description: "Direct API integration", status: "Available" },
                    { name: "MyCase", description: "Document sync and case import", status: "Available" },
                    { name: "PracticePanther", description: "Two-way data sync", status: "Available" },
                    { name: "FileVine", description: "Workflow automation", status: "Available" },
                    { name: "Smokeball", description: "Document management integration", status: "Available" },
                    { name: "LawPay", description: "Billing integration", status: "Available" },
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{integration.status}</Badge>
                        <Button size="sm" variant="outline">
                          Connect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Integration Capabilities:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Automatic case import from PMS</li>
                    <li>• Synchronized client information</li>
                    <li>• Document storage linking</li>
                    <li>• Time tracking integration</li>
                    <li>• Billing and invoicing connectivity</li>
                    <li>• Calendar synchronization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Medical Records Integration
                </CardTitle>
                <CardDescription>HIPAA-compliant healthcare system connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Epic MyChart", description: "Patient portal integration", status: "Available" },
                    { name: "Cerner HealtheLife", description: "Healthcare connectivity", status: "Available" },
                    { name: "Direct Provider Portal", description: "Direct provider access", status: "Available" },
                    { name: "Medical Records Request", description: "Automated request system", status: "Available" },
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{integration.status}</Badge>
                        <Button size="sm" variant="outline">
                          Connect
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    HIPAA Compliance:
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• End-to-end encryption</li>
                    <li>• Secure data exchange protocols</li>
                    <li>• Audit trail logging</li>
                    <li>• Access control management</li>
                    <li>• Compliance monitoring</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Consultations</CardTitle>
                <CardDescription>Scheduled expert consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Consultations</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Schedule expert consultations to get professional medical opinions on your cases
                  </p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consultation History</CardTitle>
                <CardDescription>Past expert consultations and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Consultation History</h3>
                  <p className="text-gray-600 text-center">
                    Your past consultations and expert reports will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
