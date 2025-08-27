"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Upload,
  FileText,
  ImageIcon,
  Building,
  Stethoscope,
  Activity,
  Pill,
  Shield,
  Scale,
  Home,
} from "lucide-react"
import Link from "next/link"

const documentCategories = [
  { id: "emergency", label: "Emergency Treatment", icon: Activity, count: 0, color: "bg-red-100 text-red-700" },
  { id: "hospital", label: "Hospital Records", icon: Building, count: 0, color: "bg-blue-100 text-blue-700" },
  { id: "physician", label: "Physician Records", icon: Stethoscope, count: 0, color: "bg-green-100 text-green-700" },
  { id: "imaging", label: "Diagnostic Imaging", icon: ImageIcon, count: 0, color: "bg-purple-100 text-purple-700" },
  { id: "lab", label: "Laboratory Results", icon: FileText, count: 0, color: "bg-amber-100 text-amber-700" },
  { id: "therapy", label: "Therapy Records", icon: ImageIcon, count: 0, color: "bg-cyan-100 text-cyan-700" },
  { id: "pharmacy", label: "Pharmacy Records", icon: Pill, count: 0, color: "bg-pink-100 text-pink-700" },
  {
    id: "insurance",
    label: "Insurance Documentation",
    icon: Shield,
    count: 0,
    color: "bg-indigo-100 text-indigo-700",
  },
  { id: "legal", label: "Legal Documents", icon: Scale, count: 0, color: "bg-gray-100 text-gray-700" },
]

const mockDocuments: any[] = []

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 95) return "text-green-600 bg-green-100"
  if (confidence >= 80) return "text-yellow-600 bg-yellow-100"
  return "text-red-600 bg-red-100"
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "verified":
      return <ImageIcon className="w-4 h-4 text-green-600" />
    case "review":
      return <ImageIcon className="w-4 h-4 text-yellow-600" />
    case "flagged":
      return <ImageIcon className="w-4 h-4 text-red-600" />
    default:
      return <FileText className="w-4 h-4 text-gray-600" />
  }
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="w-5 h-5 text-red-600" />
    case "jpg":
    case "jpeg":
    case "png":
      return <ImageIcon className="w-5 h-5 text-blue-600" />
    default:
      return <FileText className="w-5 h-5 text-gray-600" />
  }
}

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.provider.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-6">
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Document Library</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Document Library</h1>
            <p className="text-gray-600 mt-1">Manage and organize all case documents with AI-powered classification</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                className="pl-10 w-80 bg-gray-50 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
              <Link href="/dashboard/documents/upload">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No documents yet</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Classified</CardTitle>
              <ImageIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">No data yet</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <ImageIcon className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No pending reviews</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 GB</div>
              <Progress value={0} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">0% of 5 GB limit</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
            <TabsTrigger value="review">Needs Review</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            {/* Document Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {documentCategories.map((category) => (
                <Card
                  key={category.id}
                  className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? "ring-2 ring-cyan-600" : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                      <category.icon className="w-4 h-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">documents</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Document List */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-serif">
                    {selectedCategory === "all"
                      ? "All Documents"
                      : documentCategories.find((c) => c.id === selectedCategory)?.label}
                  </CardTitle>
                  <CardDescription>0 documents found</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-cyan-50 text-cyan-700" : ""}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                  <p className="text-gray-500 mb-4">Upload your first medical documents to get started</p>
                  <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
                    <Link href="/dashboard/documents/upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Documents
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif">Recent Uploads</CardTitle>
                <CardDescription>Documents uploaded in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-1">No recent uploads</h4>
                  <p className="text-sm text-gray-500">Recent document uploads will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif">Documents Needing Review</CardTitle>
                <CardDescription>Documents with low confidence scores requiring manual verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-1">No documents need review</h4>
                  <p className="text-sm text-gray-500">Documents requiring manual review will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
