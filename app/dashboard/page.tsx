"use client"

import { useEffect } from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link"
import {
  Search,
  Bell,
  Plus,
  Upload,
  FileText,
  Clock,
  BarChart3,
  Home,
  FolderOpen,
  Users,
  Settings,
  Brain,
  Stethoscope,
  Filter,
  Download,
  Eye,
  User,
  MessageCircle,
} from "lucide-react"

const navigationItems = [
  { title: "Dashboard", icon: Home, href: "/dashboard", active: true },
  { title: "New Case Setup", icon: Plus, href: "/dashboard/cases/new" },
  { title: "Active Cases", icon: FolderOpen, href: "/dashboard/cases" },
  { title: "Document Library", icon: FileText, href: "/dashboard/documents" },
  { title: "AI Assistant", icon: MessageCircle, href: "/dashboard/chat" }, // Added AI Assistant chat navigation
  { title: "Chronology Templates", icon: Clock, href: "/dashboard/templates" },
  { title: "Analytics & Reports", icon: BarChart3, href: "/dashboard/analytics" },
  { title: "Settings & Billing", icon: Settings, href: "/dashboard/settings" },
]

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
}

export default function DashboardPage() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All Cases")
  const [activeCases, setActiveCases] = useState<CaseData[]>([
    //for static data testing 
    {
      id: "1",
      name: "Doe vs ABC Medical Center",
      client: "John Doe",
      dateOfIncident: "2025-03-12",
      injuryType: "Head Injury",
      subCategory: "Traumatic Brain Injury",
      status: "Open",
      priority: "High",
      progress: 65,
      estimatedValue: "$120,000",
      attorney: "Alice Johnson",
      lastActivity: "2025-10-07",
      createdAt: "2025-03-15",
    },{
      id: "2",
      name: "Smith vs XYZ Insurance",
      client: "Jane Smith",
      dateOfIncident: "2024-11-02",
      injuryType: "Spinal Cord Injury",
      subCategory: "Fracture",
      status: "In Progress",
      priority: "Medium",
      progress: 40,
      estimatedValue: "$80,000",
      attorney: "Robert Lee",
      lastActivity: "2025-09-29",
      createdAt: "2024-11-05",
    },
    {
      id: "3",
      name: "Johnson vs City Transport",
      client: "Mark Johnson",
      dateOfIncident: "2023-08-20",
      injuryType: "Whiplash",
      subCategory: "Neck Injury",
      status: "Closed",
      priority: "Low",
      progress: 100,
      estimatedValue: "$50,000",
      attorney: "Emma Davis",
      lastActivity: "2025-08-30",
      createdAt: "2023-08-25",
    },
  ])
  const [loading, setLoading] = useState(true)

  const filterOptions = ["All Cases", "High Priority", "Recent Activity", "Pending Analysis", "Completed Cases"]

  // useEffect(() => {
  //   const loadCases = () => {
  //     try {
  //       const cases = JSON.parse(localStorage.getItem("medchrono_cases") || "[]")
  //       setActiveCases(cases)
  //     } catch (error) {
  //       console.error("Error loading cases:", error)
  //       setActiveCases([])
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   loadCases()
  // }, [])

  //  for static data testing
  useEffect(() => {
  setLoading(false)
}, [])


  const totalCases = activeCases.length
  const avgProgress = totalCases > 0 ? Math.round(activeCases.reduce((sum, c) => sum + c.progress, 0) / totalCases) : 0
  const highPriorityCases = activeCases.filter((c) => c.priority === "High").length
  const recentCases = activeCases.filter((c) => {
    const caseDate = new Date(c.createdAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return caseDate >= weekAgo
  }).length

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Sidebar */}
        <Sidebar className="border-r bg-white">
          <SidebarContent>
            {/* Logo */}
            <div className="flex items-center space-x-2 p-6 border-b">
              <div className="flex items-center justify-center w-8 h-8 bg-cyan-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MedChronoAI</span>
            </div>

            {/* Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.active}
                        className={item.active ? "bg-cyan-50 text-cyan-700 border-r-2 border-cyan-600" : ""}
                      >
                        <a href={item.href}>
                          {item.icon && <item.icon className="w-4 h-4" />}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search cases, documents, or clients..."
                    className="pl-10 w-96 bg-gray-50 border-0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-4 h-4" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {recentCases}
                  </Badge>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Attorney" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">John Doe</p>
                        <p className="text-xs leading-none text-muted-foreground">john@smithlaw.com</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, John</h1>
                <p className="text-gray-600 mt-1">Here's what's happening with your cases today</p>
              </div>
              <div className="flex items-center space-x-3">
                <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      {selectedFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter Cases</DropdownMenuLabel>
                    <DropdownMenuSeparator />
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
                    <Plus className="w-4 h-4 mr-2" />
                    New Case
                  </Link>
                </Button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="mt-2">
                    <Progress value={totalCases > 0 ? Math.min((totalCases / 10) * 100, 100) : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgProgress}%</div>
                  <p className="text-xs text-muted-foreground">
                    {totalCases === 0 ? "No data yet" : "Average case progress"}
                  </p>
                  <div className="mt-2">
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
                    {recentCases === 0 ? "No recent activity" : "Cases this week"}
                  </p>
                  <div className="mt-2">
                    <Progress value={recentCases > 0 ? Math.min((recentCases / 5) * 100, 100) : 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No documents uploaded</p>
                  <div className="mt-2">
                    <Progress value={0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used tools and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/cases/new">
                      <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Create New Case</div>
                        <div className="text-xs text-gray-500 mt-1">Start a new case setup wizard</div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/documents/upload">
                      <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Upload Documents</div>
                        <div className="text-xs text-gray-500 mt-1">Bulk document upload interface</div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/templates">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Generate Chronology</div>
                        <div className="text-xs text-gray-500 mt-1">Template selection for existing case</div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/analysis">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">View Pending Analysis</div>
                        <div className="text-xs text-gray-500 mt-1">AI processing queue</div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/analytics">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Download className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Download Reports</div>
                        <div className="text-xs text-gray-500 mt-1">Analytics export options</div>
                      </div>
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-shadow bg-transparent"
                    asChild
                  >
                    <Link href="/dashboard/experts">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Schedule Expert Consultation</div>
                        <div className="text-xs text-gray-500 mt-1">Medical expert matching</div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Cases */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Active Cases</CardTitle>
                      <CardDescription>Cases currently in progress</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/dashboard/cases">
                        <Eye className="w-4 h-4 mr-2" />
                        View All
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading cases...</p>
                      </div>
                    ) : activeCases.length === 0 ? (
                      <div className="text-center py-12">
                        <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No active cases</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first case</p>
                        <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
                          <Link href="/dashboard/cases/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Case
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeCases.slice(0, 3).map((case_) => (
                          <div
                            key={case_.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-cyan-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{case_.name}</h4>
                                <p className="text-sm text-gray-500">{case_.client}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge
                                variant={
                                  case_.priority === "High"
                                    ? "destructive"
                                    : case_.priority === "Medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {case_.priority}
                              </Badge>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/cases/${case_.id}`}>View</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                        {activeCases.length > 3 && (
                          <div className="text-center pt-4">
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/dashboard/cases">View {activeCases.length - 3} more cases</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div>
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates and notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeCases.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <h4 className="font-medium text-gray-900 mb-1">No recent activity</h4>
                        <p className="text-sm text-gray-500">Activity will appear here as you work on cases</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeCases.slice(0, 5).map((case_) => (
                          <div key={case_.id} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-cyan-600 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                Case <span className="font-medium">{case_.name}</span> was created
                              </p>
                              <p className="text-xs text-gray-500">{new Date(case_.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
