"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowUpRight,
  BarChart3,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  MessageCircle,
  Search,
  Plus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { IntakeChatbot } from "@/components/IntakeChatbot"

interface CaseRecord {
  id: string
  case_name?: string | null
  client_name?: string | null
  incident_date?: string | null
  case_status?: string | null
  priority_level?: string | null
  priority?: string | null
  progress?: number | null
  estimated_value?: string | number | null
  assigned_attorney?: string | null
  last_activity?: string | null
  updated_at?: string | null
  created_at?: string | null
}

interface DocumentRecord {
  id: string
  document_name?: string | null
  original_filename?: string | null
  category?: string | null
  document_category?: string | null
  status?: string | null
  processing_status?: string | null
  confidence?: number | null
  confidence_score?: number | null
  created_at?: string | null
  case_id?: string | null
}

const CASE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
})

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const filterOptions = ["All Cases", "High Priority", "Recent Activity", "Pending Analysis", "Completed Cases"]

const parseProgress = (record: CaseRecord) => {
  const value = record.progress ?? (record as Record<string, any>).case_progress ?? (record as Record<string, any>).completion ?? 0
  const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value)
  if (Number.isNaN(numeric)) return 0
  return Math.min(Math.max(Math.round(numeric), 0), 100)
}

const parsePriority = (record: CaseRecord) => {
  const raw = record.priority_level ?? record.priority ?? "Normal"
  return typeof raw === "string" ? raw : String(raw)
}

const parseStatus = (record: CaseRecord) => {
  const raw = record.case_status ?? (record as Record<string, any>).status ?? "Active"
  return typeof raw === "string" ? raw : String(raw)
}

const parseEstimatedValue = (record: CaseRecord) => {
  const raw = record.estimated_value ?? (record as Record<string, any>).estimatedValue
  if (!raw) return null
  if (typeof raw === "number") return raw
  const cleaned = raw.replace(/[^0-9.]/g, "")
  const value = Number.parseFloat(cleaned)
  return Number.isNaN(value) ? null : value
}

const filterCases = (cases: CaseRecord[], filter: string) => {
  const now = new Date()
  switch (filter) {
    case "High Priority":
      return cases.filter((caseItem) => parsePriority(caseItem).toLowerCase() === "high")
    case "Recent Activity":
      return cases.filter((caseItem) => {
        const updated = caseItem.updated_at ?? caseItem.last_activity ?? caseItem.created_at
        if (!updated) return false
        const updatedDate = new Date(updated)
        const diff = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
        return diff <= 7
      })
    case "Pending Analysis":
      return cases.filter((caseItem) => {
        const status = parseStatus(caseItem).toLowerCase()
        const progress = parseProgress(caseItem)
        return status.includes("pending") || status.includes("review") || progress < 50
      })
    case "Completed Cases":
      return cases.filter((caseItem) => {
        const status = parseStatus(caseItem).toLowerCase()
        return status.includes("closed") || parseProgress(caseItem) >= 100
      })
    default:
      return cases
  }
}

const getPriorityBadgeVariant = (priority: string) => {
  const normalized = priority.toLowerCase()
  if (normalized === "high") return "bg-red-100 text-red-700"
  if (normalized === "medium") return "bg-amber-100 text-amber-700"
  if (normalized === "low") return "bg-green-100 text-green-700"
  return "bg-gray-100 text-gray-700"
}

const getStatusBadgeVariant = (status: string) => {
  const normalized = status.toLowerCase()
  if (normalized.includes("closed") || normalized.includes("complete")) return "bg-green-100 text-green-700"
  if (normalized.includes("review") || normalized.includes("analysis")) return "bg-blue-100 text-blue-700"
  if (normalized.includes("pending")) return "bg-amber-100 text-amber-700"
  return "bg-gray-100 text-gray-700"
}

const formatRelative = (value: string) => formatDistanceToNow(new Date(value), { addSuffix: true })

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), [])
  const [cases, setCases] = useState<CaseRecord[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>(filterOptions[0])
  const [filterOpen, setFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attorneyName, setAttorneyName] = useState<string | null>(null)
  const [caseSearch, setCaseSearch] = useState("")

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      setLoading(true)
      try {
        const [{ data: caseData, error: caseError }, { data: documentData, error: documentError }] = await Promise.all([
          supabase.from("cases").select("*").order("updated_at", { ascending: false }),
          supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(12),
        ])

        if (caseError) {
          console.error("Error loading cases:", caseError.message)
        }

        if (documentError) {
          console.error("Error loading documents:", documentError.message)
        }

        if (isMounted) {
          setCases(caseData ?? [])
          setDocuments(documentData ?? [])
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle()

          if (isMounted) {
            setAttorneyName(profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? null)
          }
        }
      } catch (error) {
        console.error("Dashboard load error:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [supabase])

  const totalCases = cases.length
  const avgProgress = totalCases > 0 ? Math.round(cases.reduce((sum, item) => sum + parseProgress(item), 0) / totalCases) : 0
  const highPriorityCases = cases.filter((caseItem) => parsePriority(caseItem).toLowerCase() === "high").length

  const recentCases = cases.filter((caseItem) => {
    const created = caseItem.created_at ?? caseItem.updated_at
    if (!created) return false
    const createdDate = new Date(created)
    const diff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }).length

  const documentCount = documents.length

  const filteredCases = filterCases(cases, selectedFilter).filter((caseItem) => {
    if (!caseSearch.trim()) return true
    const query = caseSearch.toLowerCase()
    const haystacks = [
      caseItem.case_name,
      caseItem.client_name,
      caseItem.assigned_attorney,
      caseItem.case_status,
      caseItem.priority_level,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase())

    return haystacks.some((value) => value.includes(query))
  })
  const visibleCases = filteredCases.slice(0, 5)
  const latestDocuments = documents.slice(0, 3)

  const firstName = attorneyName ? attorneyName.split(" ")[0] : "there"

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-3 text-gray-500">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-gray-600">Here's the latest on your medical chronology cases</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {selectedFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter cases</DropdownMenuLabel>
              {filterOptions.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => {
                    setSelectedFilter(option)
                    setFilterOpen(false)
                  }}
                  className={selectedFilter === option ? "bg-cyan-50 text-cyan-700" : ""}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
            <Link href="/dashboard/cases/new">
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCases}</div>
            <p className="text-xs text-muted-foreground">
              {totalCases === 0 ? "No cases yet" : `${highPriorityCases} high priority`}
            </p>
            <div className="mt-3">
              <Progress value={totalCases > 0 ? Math.min((totalCases / 12) * 100, 100) : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <p className="text-xs text-muted-foreground">Average completion across all cases</p>
            <div className="mt-3">
              <Progress value={avgProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentCases}</div>
            <p className="text-xs text-muted-foreground">
              {recentCases === 0 ? "No updates in the last week" : "Updates in the last 7 days"}
            </p>
            <div className="mt-3">
              <Progress value={recentCases > 0 ? Math.min((recentCases / totalCases || 0) * 100, 100) : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentCount}</div>
            <p className="text-xs text-muted-foreground">Documents processed across all cases</p>
            <div className="mt-3">
              <Progress value={documentCount > 0 ? Math.min((documentCount / 40) * 100, 100) : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Button
              variant="outline"
              className="flex h-auto flex-col items-start space-y-2 bg-transparent p-4 text-left hover:shadow-md"
              asChild
            >
              <Link href="/dashboard/cases/new">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
                  <Plus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Create new case</div>
                  <div className="mt-1 text-xs text-gray-500">Launch guided intake workflow</div>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="flex h-auto flex-col items-start space-y-2 bg-transparent p-4 text-left hover:shadow-md"
              asChild
            >
              <Link href="/dashboard/documents/upload">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Upload medical records</div>
                  <div className="mt-1 text-xs text-gray-500">Ingest records for AI chronology</div>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="flex h-auto flex-col items-start space-y-2 bg-transparent p-4 text-left hover:shadow-md"
              asChild
            >
              <Link href="/dashboard/chat">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Ask the AI assistant</div>
                  <div className="mt-1 text-xs text-gray-500">Summaries, timelines, demand prep</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Active cases</CardTitle>
              <CardDescription>Track progress and status across your matters</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search cases or clients"
                  value={caseSearch}
                  onChange={(event) => setCaseSearch(event.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/cases">
                  View all cases
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {visibleCases.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-2 px-6 py-12 text-center text-sm text-gray-500">
                <FolderOpen className="h-6 w-6 text-gray-400" />
                <p>No cases found for the selected filter.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleCases.map((caseItem) => {
                    const status = parseStatus(caseItem)
                    const priority = parsePriority(caseItem)
                    const progress = parseProgress(caseItem)
                    const estimatedValue = parseEstimatedValue(caseItem)
                    const updatedAt = caseItem.updated_at ?? caseItem.last_activity ?? caseItem.created_at

                    return (
                      <TableRow key={caseItem.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">{caseItem.case_name ?? "Untitled case"}</div>
                          <div className="text-xs text-gray-500">
                            Incident {caseItem.incident_date ? CASE_DATE_FORMATTER.format(new Date(caseItem.incident_date)) : "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">{caseItem.client_name ?? "—"}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeVariant(status)}>{status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityBadgeVariant(priority)}>{priority}</Badge>
                        </TableCell>
                        <TableCell className="w-48">
                          <div className="flex items-center gap-3">
                            <Progress value={progress} className="h-2 flex-1" />
                            <span className="text-xs text-gray-500">{progress}%</span>
                          </div>
                          {estimatedValue !== null && (
                            <span className="text-xs text-gray-400">
                              {CURRENCY_FORMATTER.format(estimatedValue)} est.
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-500">
                          {updatedAt ? formatRelative(updatedAt) : "—"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Latest document activity</CardTitle>
              <CardDescription>Recent uploads and processing updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestDocuments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                  No documents processed yet. Upload your first record to start generating chronologies.
                </div>
              ) : (
                latestDocuments.map((document) => {
                  const status = document.processing_status ?? document.status ?? "Pending"
                  const category = document.category ?? document.document_category ?? "Uncategorized"
                  const confidence =
                    typeof document.confidence === "number"
                      ? document.confidence
                      : typeof document.confidence_score === "number"
                        ? document.confidence_score
                        : null

                  return (
                    <div key={document.id} className="rounded-lg border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {document.document_name ?? document.original_filename ?? "Document"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {category} • Uploaded {document.created_at ? formatRelative(document.created_at) : "recently"}
                          </p>
                        </div>
                        <Badge className="bg-cyan-50 text-cyan-700">{status}</Badge>
                      </div>
                      {confidence !== null && (
                        <div className="mt-2 text-xs text-gray-500">AI confidence: {confidence.toFixed(0)}%</div>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/documents/${document.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <IntakeChatbot />
        </div>
      </div>
    </div>
  )
}
