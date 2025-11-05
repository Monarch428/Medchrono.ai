"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Clock,
  User,
  Calendar,
  TrendingUp,
  AlertCircle,
  Home,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800"
    case "Medium":
      return "bg-yellow-100 text-yellow-800"
    case "Low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Analysis Complete":
      return "bg-green-100 text-green-800"
    case "Document Review":
      return "bg-blue-100 text-blue-800"
    case "Expert Review":
      return "bg-purple-100 text-purple-800"
    case "Initial Review":
      return "bg-gray-100 text-gray-800"
    case "Settlement Negotiation":
      return "bg-amber-100 text-amber-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getPriorityLabel = (caseItem: any): string => {
  const raw = caseItem.priority_level ?? caseItem.priority ?? "Normal"
  return typeof raw === "string" ? raw : String(raw)
}

const CASE_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
})

export default function ActiveCasesPage() {
  const [activeCases, setActiveCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return activeCases
    }

    return activeCases.filter((caseItem) => {
      const haystacks = [
        caseItem.case_name,
        caseItem.client_name,
        caseItem.assigned_attorney,
        caseItem.case_status,
        caseItem.priority_level,
        caseItem.id,
      ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase())

      return haystacks.some((value) => value.includes(query))
    })
  }, [activeCases, searchTerm])

  useEffect(() => {
    let isMounted = true

    const loadCases = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("cases").select("*").order("updated_at", { ascending: false })

        if (error) {
          throw error
        }

        if (isMounted) {
          setActiveCases(data ?? [])
        }
      } catch (error) {
        console.error("Error loading cases:", error)
        if (isMounted) {
          setActiveCases([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadCases()

    const channel = supabase
      .channel("cases-dashboard-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cases" },
        () => {
          void loadCases()
        },
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const totalCases = activeCases.length
  const highPriorityCases = activeCases.filter((c) => getPriorityLabel(c).toLowerCase() === "high").length
  const avgCaseValue =
    activeCases.length > 0
      ? activeCases.reduce((sum, c) => {
          const rawValue = c.estimated_value ?? c.estimatedValue
          if (!rawValue) return sum
          const numeric =
            typeof rawValue === "string"
              ? Number.parseFloat(rawValue.replace(/[^0-9.]/g, "")) || 0
              : Number(rawValue) || 0
          return sum + numeric
        }, 0) / activeCases.length
      : 0
  const completionRate =
    activeCases.length > 0
      ? Math.round(
          activeCases.reduce((sum, c) => {
            const value = c.progress ?? (c as Record<string, any>).case_progress ?? 0
            const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value)
            return sum + (Number.isNaN(numeric) ? 0 : numeric)
          }, 0) / activeCases.length,
        )
      : 0

  const handleArchiveCase = async (caseId: string) => {
    try {
      const { error } = await supabase
        .from("cases")
        .update({ case_status: "Archived", updated_at: new Date().toISOString() })
        .eq("id", caseId)

      if (error) {
        throw error
      }

      setActiveCases((prev) => prev.filter((caseItem) => caseItem.id !== caseId))
    } catch (error) {
      console.error("Error archiving case:", error)
      alert("Unable to archive case. Please try again.")
    }
  }

  const handleEditCase = (caseId: string) => {
    router.push(`/dashboard/cases/${caseId}`)
  }

  const handleGenerateChronology = (caseId: string) => {
    router.push(`/dashboard/templates?caseId=${caseId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cases...</p>
        </div>
      </div>
    )
  }

  const filteredCases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return activeCases
    }

    return activeCases.filter((caseItem) => {
      const haystacks = [
        caseItem.case_name,
        caseItem.client_name,
        caseItem.assigned_attorney,
        caseItem.case_status,
        caseItem.priority_level,
        caseItem.id,
      ]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase())

      return haystacks.some((value) => value.includes(query))
    })
  }, [activeCases, searchTerm])

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
          <span className="text-gray-900 font-medium">Active Cases</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Cases</h1>
            <p className="text-gray-600 mt-1">Manage and track all your ongoing cases</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cases..."
                className="pl-10 w-80 bg-gray-50 border-0"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search cases"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
              <Link href="/dashboard/cases/new">
                <Plus className="w-4 h-4 mr-2" />
                New Case
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
              <CardTitle className="text-sm font-medium">Total Active Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCases}</div>
              <p className="text-xs text-muted-foreground">
                {totalCases === 0 ? "No cases yet" : `${totalCases} active case${totalCases !== 1 ? "s" : ""}`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highPriorityCases}</div>
              <p className="text-xs text-muted-foreground">
                {highPriorityCases === 0 ? "No high priority cases" : `${highPriorityCases} high priority`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Case Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgCaseValue > 0 ? `$${Math.round(avgCaseValue).toLocaleString()}` : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {avgCaseValue > 0 ? "Calculated from active cases" : "No case values yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate > 0 ? `${completionRate}%` : "-"}</div>
              <p className="text-xs text-muted-foreground">
                {completionRate > 0 ? "Average case progress" : "No progress data yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cases Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Case Overview</CardTitle>
            <CardDescription>Detailed view of all active cases and their current status</CardDescription>
          </CardHeader>
          <CardContent>
            {activeCases.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Cases</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first case</p>
                <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
                  <Link href="/dashboard/cases/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Case
                  </Link>
                </Button>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                <p className="font-medium text-gray-900">No cases match your search.</p>
                <p className="mt-1 text-gray-500">Try adjusting your keywords or clearing the search filter.</p>
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
                    <TableHead>Attorney</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((case_) => {
                    const status = case_.case_status ?? case_.status ?? "Active"
                    const priority = getPriorityLabel(case_)
                    const progressValue =
                      typeof case_.progress === "number"
                        ? case_.progress
                        : typeof case_.progress === "string"
                          ? Number.parseFloat(case_.progress)
                          : 0
                    const safeProgress = Number.isNaN(progressValue) ? 0 : Math.max(0, Math.min(100, Math.round(progressValue)))
                    const estimatedValue = case_.estimated_value ?? case_.estimatedValue ?? null
                    const lastUpdated = case_.updated_at ?? case_.last_activity ?? case_.created_at

                    return (
                      <TableRow key={case_.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">{case_.case_name ?? case_.name ?? "Untitled case"}</div>
                          <div className="text-xs text-gray-500">#{case_.id}</div>
                          <div className="mt-1 flex items-center text-xs text-gray-400">
                            <Calendar className="mr-1 h-3 w-3" />
                            {case_.incident_date
                              ? CASE_DATE_FORMATTER.format(new Date(case_.incident_date))
                              : "Incident date unavailable"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{case_.client_name ?? case_.client ?? "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getStatusColor(status)}`}>{status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getPriorityColor(priority)}`}>{priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={safeProgress} className="h-2 w-32" />
                            <span className="text-xs text-gray-500">{safeProgress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700">{case_.assigned_attorney ?? case_.assignedAttorney ?? "—"}</div>
                          {case_.representing_party && (
                            <div className="text-xs text-gray-500">{case_.representing_party}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {lastUpdated ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }) : "—"}
                          {estimatedValue && (
                            <div className="text-[10px] text-emerald-600">
                              Est. value: {typeof estimatedValue === "string"
                                ? estimatedValue
                                : `$${Math.round(Number(estimatedValue)).toLocaleString()}`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/cases/${case_.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> View details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCase(case_.id)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit case
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGenerateChronology(case_.id)}>
                                <FileText className="mr-2 h-4 w-4" /> Generate chronology
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleArchiveCase(case_.id)} className="text-red-600">
                                Archive case
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
