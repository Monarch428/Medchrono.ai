"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  FileText,
  Plus,
  AlertCircle,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Edit,
  Upload,
  BarChart3,
  FileCheck,
} from "lucide-react"
import Link from "next/link"

interface CaseData {
  id: string
  name: string
  client: string
  dateOfIncident: string
  injuryType: string
  subCategory: string
  status: string
  priority: string
  progress: number
  estimatedValue: string
  attorney: string
  lastActivity: string
  createdAt: string
  clientPhone?: string
  clientEmail?: string
  incidentLocation?: string
  description?: string
}

export default function CaseDetailsPage({ params }: { params: { id: string } }) {
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<CaseData | null>(null)

  useEffect(() => {
    const loadCaseData = () => {
      try {
        const cases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
        const foundCase = cases.find((c: CaseData) => c.id === params.id)
        setCaseData(foundCase || null)
        setEditData(foundCase || null)
      } catch (error) {
        console.error("Error loading case data:", error)
        setCaseData(null)
      } finally {
        setLoading(false)
      }
    }

    loadCaseData()
  }, [params.id])

  const handleSaveEdit = () => {
    if (!editData) return

    try {
      const cases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
      const updatedCases = cases.map((c: CaseData) => (c.id === editData.id ? editData : c))
      localStorage.setItem("medchrono_cases", JSON.stringify(updatedCases))
      setCaseData(editData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving case data:", error)
    }
  }

  const handleCancelEdit = () => {
    setEditData(caseData)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/cases">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cases
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Case Not Found</h1>
                <p className="text-gray-600 mt-1">Case #{params.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Empty State */}
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Case Data Available</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                This case doesn't exist or hasn't been created yet. Start by creating your first case to see detailed
                case information here.
              </p>
              <div className="flex space-x-3">
                <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                  <Link href="/dashboard/cases/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Case
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/cases">
                    <FileText className="w-4 h-4 mr-2" />
                    View All Cases
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/cases">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cases
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{caseData.name}</h1>
              <p className="text-gray-600 mt-1">Case #{caseData.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Case"}
            </Button>
            <Badge
              variant={
                caseData.priority === "High" ? "destructive" : caseData.priority === "Medium" ? "default" : "secondary"
              }
            >
              {caseData.priority} Priority
            </Badge>
            <Badge variant="outline">{caseData.status}</Badge>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="caseName">Case Name</Label>
                            <Input
                              id="caseName"
                              value={editData?.name || ""}
                              onChange={(e) => setEditData((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input
                              id="clientName"
                              value={editData?.client || ""}
                              onChange={(e) =>
                                setEditData((prev) => (prev ? { ...prev, client: e.target.value } : null))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="clientPhone">Client Phone</Label>
                            <Input
                              id="clientPhone"
                              value={editData?.clientPhone || ""}
                              onChange={(e) =>
                                setEditData((prev) => (prev ? { ...prev, clientPhone: e.target.value } : null))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="clientEmail">Client Email</Label>
                            <Input
                              id="clientEmail"
                              value={editData?.clientEmail || ""}
                              onChange={(e) =>
                                setEditData((prev) => (prev ? { ...prev, clientEmail: e.target.value } : null))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="incidentDate">Incident Date</Label>
                            <Input
                              id="incidentDate"
                              type="date"
                              value={editData?.dateOfIncident || ""}
                              onChange={(e) =>
                                setEditData((prev) => (prev ? { ...prev, dateOfIncident: e.target.value } : null))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="estimatedValue">Estimated Value</Label>
                            <Input
                              id="estimatedValue"
                              value={editData?.estimatedValue || ""}
                              onChange={(e) =>
                                setEditData((prev) => (prev ? { ...prev, estimatedValue: e.target.value } : null))
                              }
                              placeholder="e.g., $50,000"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={editData?.description || ""}
                            onChange={(e) =>
                              setEditData((prev) => (prev ? { ...prev, description: e.target.value } : null))
                            }
                            placeholder="Case description..."
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button onClick={handleSaveEdit} className="bg-cyan-600 hover:bg-cyan-700">
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Client Information</h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{caseData.client}</span>
                            </div>
                            {caseData.clientPhone && (
                              <div className="flex items-center text-sm">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{caseData.clientPhone}</span>
                              </div>
                            )}
                            {caseData.clientEmail && (
                              <div className="flex items-center text-sm">
                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{caseData.clientEmail}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Case Details</h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <span>
                                Incident:{" "}
                                {caseData.dateOfIncident
                                  ? new Date(caseData.dateOfIncident).toLocaleDateString()
                                  : "Not specified"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm">
                              <FileText className="w-4 h-4 mr-2 text-gray-400" />
                              <span>
                                {caseData.injuryType} - {caseData.subCategory}
                              </span>
                            </div>
                            {caseData.incidentLocation && (
                              <div className="flex items-center text-sm">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{caseData.incidentLocation}</span>
                              </div>
                            )}
                            {caseData.estimatedValue && caseData.estimatedValue.trim() !== "" && (
                              <div className="flex items-center text-sm">
                                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                                <span>Estimated Value: {caseData.estimatedValue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {!isEditing && caseData.description && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                        <p className="text-gray-600 text-sm">{caseData.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No documents uploaded yet</p>
                      <Button asChild>
                        <Link href="/dashboard/documents/upload">Upload Documents</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No timeline events yet</p>
                      <p className="text-sm text-gray-500">
                        Timeline will be generated after document upload and analysis
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No notes added yet</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {caseData.progress > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Case Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{caseData.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${caseData.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Last Activity: {caseData.lastActivity}</p>
                      <p>Created: {new Date(caseData.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Documents</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Upload medical records and case documents</p>
                      <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                        <Link href="/dashboard/documents/upload">Go to Upload Page</Link>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <FileCheck className="w-4 h-4 mr-2" />
                      Generate Chronology
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Chronology</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                      <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Create a medical chronology for this case</p>
                      <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                        <Link href="/dashboard/templates">Select Template</Link>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Run Analysis
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Run AI Analysis</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Analyze case documents with AI</p>
                      <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                        <Link href="/dashboard/analysis">Start Analysis</Link>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
