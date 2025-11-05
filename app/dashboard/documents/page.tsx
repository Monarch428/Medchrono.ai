"use client"

import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import {
  Activity,
  FileText,
  Home,
  ImageIcon,
  Pill,
  Scale,
  Search,
  Shield,
  Stethoscope,
  Upload,
  Building,
} from "lucide-react"

const documentCategories = [
  { id: "emergency", label: "Emergency Treatment", icon: Activity, color: "bg-red-100 text-red-700" },
  { id: "hospital", label: "Hospital Records", icon: Building, color: "bg-blue-100 text-blue-700" },
  { id: "physician", label: "Physician Records", icon: Stethoscope, color: "bg-green-100 text-green-700" },
  { id: "imaging", label: "Diagnostic Imaging", icon: ImageIcon, color: "bg-purple-100 text-purple-700" },
  { id: "lab", label: "Laboratory Results", icon: FileText, color: "bg-amber-100 text-amber-700" },
  { id: "therapy", label: "Therapy Records", icon: ImageIcon, color: "bg-cyan-100 text-cyan-700" },
  { id: "pharmacy", label: "Pharmacy Records", icon: Pill, color: "bg-pink-100 text-pink-700" },
  { id: "insurance", label: "Insurance Documentation", icon: Shield, color: "bg-indigo-100 text-indigo-700" },
  { id: "legal", label: "Legal Documents", icon: Scale, color: "bg-gray-100 text-gray-700" },
  { id: "other", label: "Other Records", icon: FileText, color: "bg-slate-100 text-slate-700" },
]

interface DocumentRecord {
  id: string
  filename?: string | null
  file_type?: string | null
  file_size?: number | string | null
  case_id?: string | null
  processing_status?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
  storage_path?: string | null
  extracted_text?: string | null
  key_findings?: unknown
  timeline_events?: unknown
  medical_data?: Record<string, unknown> | null
  missing_records?: unknown
  category?: string | null
  document_category?: string | null
  provider?: string | null
  confidence?: number | string | null
  confidence_score?: number | string | null
  case_name?: string | null
  case_client?: string | null
}

const getConfidenceClasses = (confidence: number | null) => {
  if (confidence === null) return "bg-gray-100 text-gray-600"
  if (confidence >= 95) return "bg-green-100 text-green-700"
  if (confidence >= 80) return "bg-yellow-100 text-yellow-700"
  return "bg-red-100 text-red-700"
}

const getStatusIcon = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized.includes("processed") || normalized.includes("verified")) {
    return <ImageIcon className="h-4 w-4 text-emerald-600" />
  }
  if (normalized.includes("flag")) {
    return <ImageIcon className="h-4 w-4 text-red-500" />
  }
  if (normalized.includes("review") || normalized.includes("pending")) {
    return <ImageIcon className="h-4 w-4 text-amber-500" />
  }
  return <FileText className="h-4 w-4 text-gray-500" />
}

const getStatusClasses = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized.includes("processed") || normalized.includes("verified")) return "bg-emerald-50 text-emerald-700"
  if (normalized.includes("flag")) return "bg-red-50 text-red-700"
  if (normalized.includes("review") || normalized.includes("pending")) return "bg-amber-50 text-amber-700"
  return "bg-gray-100 text-gray-700"
}

const getFileIcon = (extension: string) => {
  switch (extension.toLowerCase()) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />
    case "jpg":
    case "jpeg":
    case "png":
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    default:
      return <FileText className="h-5 w-5 text-gray-500" />
  }
}

const getCategoryId = (doc: DocumentRecord) => {
  const value = (doc.category ?? doc.document_category ?? "other").toLowerCase()
  const match = documentCategories.find(
    (category) => category.id === value || category.label.toLowerCase() === value,
  )
  return match?.id ?? "other"
}

const getCategoryLabel = (doc: DocumentRecord) => {
  const id = getCategoryId(doc)
  return documentCategories.find((category) => category.id === id)?.label ?? "Other Records"
}

const getDocumentStatus = (doc: DocumentRecord) => doc.processing_status ?? doc.status ?? "Pending"

const getConfidenceValue = (doc: DocumentRecord) => {
  const direct = doc.confidence ?? doc.confidence_score
  const derived =
    doc.medical_data && typeof doc.medical_data === "object" && doc.medical_data !== null
      ? (doc.medical_data as Record<string, unknown>).confidence
      : undefined
  const raw = direct ?? derived ?? null

  if (raw === null || raw === undefined) {
    return null
  }

  const numeric = typeof raw === "string" ? Number.parseFloat(raw) : Number(raw)
  return Number.isFinite(numeric) ? numeric : null
}

const getFileExtension = (doc: DocumentRecord) => {
  const name = doc.filename ?? ""
  const parts = name.split(".")
  return parts.length > 1 ? parts.pop() ?? "pdf" : doc.file_type ?? "pdf"
}

export default function DocumentsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [caseLookup, setCaseLookup] = useState<Record<string, { name: string | null; client: string | null }>>({})
  const [availableCases, setAvailableCases] = useState<Array<{ id: string; name: string | null; client: string | null }>>([])
  const [caseFilter, setCaseFilter] = useState("all")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadDocuments = async () => {
      setLoading(true)
      try {
        setErrorMessage(null)
        const {
          data: caseRecords,
          error: caseError,
        } = await supabase
          .from("cases")
          .select("id, case_name, client_name")
          .order("updated_at", { ascending: false })

        if (caseError) {
          throw caseError
        }

        const normalizedCases = (caseRecords ?? [])
          .map((caseItem) => ({
            id: caseItem?.id ? String(caseItem.id) : "",
            name: caseItem?.case_name ?? null,
            client: caseItem?.client_name ?? null,
          }))
          .filter((caseItem) => caseItem.id.length > 0)

        const lookup = normalizedCases.reduce<Record<string, { name: string | null; client: string | null }>>(
          (acc, caseItem) => {
            acc[caseItem.id] = {
              name: caseItem.name,
              client: caseItem.client,
            }
            return acc
          },
          {},
        )

        if (isMounted) {
          setAvailableCases(normalizedCases)
          setCaseLookup(lookup)
        }

        const caseIds = normalizedCases.map((caseItem) => caseItem.id)

        const limits = [100, 50, 25]
        let documentsResult: DocumentRecord[] = []
        let lastError: any = null

        for (const limit of limits) {
          let query = supabase
            .from("documents")
            .select(
              "id, filename, file_type, file_size, case_id, processing_status, created_at, updated_at, storage_path, extracted_text, medical_data, missing_records, key_findings, timeline_events",
            )
            .order("created_at", { ascending: false })
            .limit(limit)

          if (caseIds.length > 0) {
            query = query.in("case_id", caseIds)
          }

          const { data, error } = await query

          if (!error) {
            documentsResult = data ?? []
            lastError = null
            break
          }

          lastError = error
          if (!lastError || lastError.code !== "57014") {
            break
          }
        }

        if (lastError) {
          throw lastError
        }

        const enrichedDocs = documentsResult
          .map((doc) => {
            const caseKey = doc.case_id ? String(doc.case_id) : ""
            const related = caseKey ? lookup[caseKey] : undefined
            return {
              ...doc,
              case_id: caseKey || null,
              case_name: doc.case_name ?? related?.name ?? null,
              case_client: doc.case_client ?? related?.client ?? null,
            }
          })

        if (isMounted) {
          setDocuments(enrichedDocs)

          const counts: Record<string, number> = {}
          enrichedDocs.forEach((doc) => {
            const id = getCategoryId(doc)
            counts[id] = (counts[id] ?? 0) + 1
          })
          setCategoryCounts(counts)
        }
      } catch (error) {
        console.error("Error loading documents:", error)
        if (isMounted) {
          setDocuments([])
          setCategoryCounts({})
          setCaseLookup({})
          setAvailableCases([])
          const code = (error as { code?: string }).code
          const rawMessage = (error as { message?: string }).message
          if (code === "57014") {
            setErrorMessage(
              "The document query took too long to respond. Please refine your filters or try again shortly.",
            )
          } else {
            setErrorMessage(
              typeof rawMessage === "string" && rawMessage.length > 0
                ? rawMessage
                : error instanceof Error
                  ? error.message
                  : "Unable to load documents at this time. Please try again.",
            )
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadDocuments()

    const channel = supabase
      .channel("documents-dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents" },
        () => {
          void loadDocuments()
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const categoriesWithCounts = useMemo(
    () =>
      documentCategories.map((category) => ({
        ...category,
        count: categoryCounts[category.id] ?? 0,
      })),
    [categoryCounts],
  )

  const caseOptions = useMemo(
    () =>
      availableCases.map((caseItem) => ({
        id: caseItem.id,
        label: caseItem.name ?? `Case ${caseItem.id.slice(0, 6)}`,
        client: caseItem.client ?? "—",
      })),
    [availableCases],
  )

  useEffect(() => {
    if (caseFilter !== "all" && !caseOptions.some((option) => option.id === caseFilter)) {
      setCaseFilter("all")
    }
  }, [caseFilter, caseOptions])

  const totalDocuments = documents.length
  const autoClassified = documents.filter((doc) => {
    const status = getDocumentStatus(doc).toLowerCase()
    return status.includes("processed") || status.includes("verified")
  }).length
  const pendingReview = documents.filter((doc) => {
    const status = getDocumentStatus(doc).toLowerCase()
    return status.includes("review") || status.includes("pending")
  }).length

  const storageBytes = documents.reduce((sum, doc) => sum + (Number(doc.file_size) || 0), 0)
  const storageGb = storageBytes / 1024 / 1024 / 1024
  const storageLabel =
    storageGb >= 0.01 ? `${storageGb.toFixed(2)} GB` : `${(storageBytes / 1024 / 1024).toFixed(1)} MB`
  const storagePercentage = Math.min((storageGb / 5) * 100, 100)

  const filteredDocuments = documents.filter((doc) => {
    const categoryMatch = selectedCategory === "all" || getCategoryId(doc) === selectedCategory
    const caseMatch = caseFilter === "all" || (doc.case_id && doc.case_id === caseFilter)
    const query = searchQuery.trim().toLowerCase()
    if (!categoryMatch || !caseMatch) return false
    if (query === "") return true

    const searchable = [
      doc.filename,
      doc.case_name,
      doc.case_client,
      doc.provider,
      doc.case_id,
      doc.category,
      doc.document_category,
    ]

    return searchable
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .some((value) => value.toLowerCase().includes(query))
  })

  const recentDocuments = documents.filter((doc) => {
    if (!doc.created_at) return false
    const created = new Date(doc.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return created >= sevenDaysAgo
  })

  const reviewDocuments = documents.filter((doc) => {
    const status = getDocumentStatus(doc).toLowerCase()
    const confidence = getConfidenceValue(doc)
    return status.includes("review") || status.includes("flag") || (typeof confidence === "number" && confidence < 80)
  })

  const renderDocumentList = (docs: DocumentRecord[]) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12 text-sm text-gray-500">
          <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
          Loading documents...
        </div>
      )
    }

    if (docs.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No documents found</h3>
          <p className="mx-auto mb-4 max-w-md text-sm text-gray-500">
            Upload medical records to begin classification and chronology generation.
          </p>
          <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
            <Link href="/dashboard/documents/upload">
              <Upload className="mr-2 h-4 w-4" /> Upload documents
            </Link>
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {docs.map((doc) => {
          const categoryLabel = getCategoryLabel(doc)
          const status = getDocumentStatus(doc)
          const confidence = getConfidenceValue(doc)
          const fileExtension = getFileExtension(doc)
          const relatedCase = doc.case_id ? caseLookup[doc.case_id] : undefined
          const caseReference = doc.case_name ?? relatedCase?.name ?? (doc.case_id ? `Case #${doc.case_id}` : "Unassigned case")
          const clientReference = doc.case_client ?? relatedCase?.client ?? null
          const uploadedLabel = doc.created_at
            ? formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })
            : "Upload time unavailable"
          const fileSizeValue = Number(doc.file_size)
          const fileSizeLabel = !Number.isNaN(fileSizeValue) && fileSizeValue > 0 ? `${(fileSizeValue / 1024 / 1024).toFixed(1)} MB` : null
          const displayName = doc.filename ?? (doc.case_id ? `Document ${doc.case_id}` : `Document ${doc.id.slice(0, 8)}`)

          return (
            <div
              key={doc.id}
              className="flex flex-col gap-4 border-b border-gray-100 pb-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex w-full items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                  {getFileIcon(fileExtension)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-medium text-gray-900">{displayName}</h4>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${getConfidenceClasses(confidence)}`}>
                      {confidence === null ? "Confidence pending" : `${confidence.toFixed(0)}% confidence`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {categoryLabel} • {caseReference}
                  </p>
                  {clientReference && (
                    <p className="text-xs text-gray-400">Client: {clientReference}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Uploaded {uploadedLabel}
                    {fileSizeLabel ? ` • ${fileSizeLabel}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(status)}`}>
                  {getStatusIcon(status)}
                  {status}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/documents/${doc.id}`}>Open</Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-6">
        <div className="mb-4 flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-900">Document Library</span>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Document Library</h1>
            <p className="mt-1 text-gray-600">
              Manage and organize all case documents with AI-powered classification and review workflows.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search documents..."
                className="w-80 bg-gray-50 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={caseFilter} onValueChange={setCaseFilter}>
              <SelectTrigger className="w-full sm:w-56 bg-white">
                <SelectValue placeholder="Filter by case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cases</SelectItem>
                {caseOptions.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No cases available
                  </SelectItem>
                ) : (
                  caseOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label} {option.client ? `• ${option.client}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
              <Link href="/dashboard/documents/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload documents
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {errorMessage && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {errorMessage}
          </div>
        )}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                {totalDocuments === 0 ? "No documents yet" : `${totalDocuments} records available`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-classified</CardTitle>
              <ImageIcon className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{autoClassified}</div>
              <p className="text-xs text-muted-foreground">
                {autoClassified === 0 ? "Awaiting processing" : "AI classified records"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending review</CardTitle>
              <ImageIcon className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingReview}</div>
              <p className="text-xs text-muted-foreground">
                {pendingReview === 0 ? "Nothing requires attention" : "Needs human review"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage used</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storageLabel}</div>
              <Progress value={storagePercentage} className="mt-2" />
              <p className="mt-1 text-xs text-muted-foreground">{storagePercentage.toFixed(0)}% of 5 GB limit</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">By category</TabsTrigger>
            <TabsTrigger value="recent">Recent uploads</TabsTrigger>
            <TabsTrigger value="review">Needs review</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {categoriesWithCounts.map((category) => (
                <Card
                  key={category.id}
                  className={`border-0 shadow-sm transition-all hover:shadow-md ${
                    selectedCategory === category.id ? "ring-2 ring-cyan-600" : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${category.color}`}>
                      <category.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{category.count}</div>
                    <p className="text-xs text-muted-foreground">documents</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="font-serif">
                    {selectedCategory === "all"
                      ? "All documents"
                      : documentCategories.find((c) => c.id === selectedCategory)?.label ?? "Documents"}
                  </CardTitle>
                  <CardDescription>
                    {loading
                      ? "Loading documents..."
                      : `${filteredDocuments.length} document${filteredDocuments.length === 1 ? "" : "s"} found`}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={selectedCategory === "all" ? "bg-cyan-50 text-cyan-700" : ""}
                >
                  View all
                </Button>
              </CardHeader>
              <CardContent>{renderDocumentList(filteredDocuments)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif">Recent uploads</CardTitle>
                <CardDescription>Documents uploaded in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>{renderDocumentList(recentDocuments)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif">Documents needing review</CardTitle>
                <CardDescription>Documents with low confidence or flagged status</CardDescription>
              </CardHeader>
              <CardContent>{renderDocumentList(reviewDocuments)}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
