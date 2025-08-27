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
import { useState, useEffect } from "react"

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

export default function ActiveCasesPage() {
  const [activeCases, setActiveCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCases = () => {
      try {
        const storedCases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
        setActiveCases(storedCases)
      } catch (error) {
        console.error("Error loading cases:", error)
        setActiveCases([])
      } finally {
        setLoading(false)
      }
    }

    loadCases()
  }, [])

  const totalCases = activeCases.length
  const highPriorityCases = activeCases.filter((c) => c.priority === "High").length
  const avgCaseValue =
    activeCases.length > 0
      ? activeCases.reduce((sum, c) => {
          const value =
            typeof c.estimatedValue === "string"
              ? Number.parseInt(c.estimatedValue.replace(/[$,]/g, "")) || 0
              : Number(c.estimatedValue) || 0
          return sum + value
        }, 0) / activeCases.length
      : 0
  const completionRate =
    activeCases.length > 0
      ? Math.round(activeCases.reduce((sum, c) => sum + (Number(c.progress) || 0), 0) / activeCases.length)
      : 0

  const handleArchiveCase = (caseId: string) => {
    const updatedCases = activeCases.filter((c) => c.id !== caseId)
    setActiveCases(updatedCases)
    localStorage.setItem("medchrono_cases", JSON.stringify(updatedCases))
  }

  const handleEditCase = (caseId: string) => {
    // For now, redirect to case details page where editing can be implemented
    window.location.href = `/dashboard/cases/${caseId}`
  }

  const handleGenerateChronology = (caseId: string) => {
    // Redirect to templates page with case context
    window.location.href = `/dashboard/templates?caseId=${caseId}`
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
              <Input placeholder="Search cases..." className="pl-10 w-80 bg-gray-50 border-0" />
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Details</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Attorney</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCases.map((case_) => (
                    <TableRow key={case_.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{case_.name}</div>
                          <div className="text-sm text-gray-500">#{case_.id}</div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {case_.incidentDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{case_.client}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {case_.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(case_.status)}`}>{case_.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {case_.progress && case_.progress > 0 ? (
                            <>
                              <div className="flex items-center justify-between text-xs">
                                <span>{case_.progress}%</span>
                                <span className="text-gray-500">{case_.documentsCount || 0} docs</span>
                              </div>
                              <Progress value={case_.progress} className="h-2" />
                            </>
                          ) : (
                            <div className="text-xs text-gray-500">No progress yet</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getPriorityColor(case_.priority)}`}>{case_.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{case_.assignedAttorney}</div>
                        <div className="text-xs text-gray-500">{case_.lastActivity}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {case_.estimatedValue && case_.estimatedValue !== "" && case_.estimatedValue !== "$0" ? (
                            <span className="font-medium text-green-600">{case_.estimatedValue}</span>
                          ) : (
                            "Not estimated"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
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
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCase(case_.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Case
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateChronology(case_.id)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Generate Chronology
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleArchiveCase(case_.id)}>
                              Archive Case
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
