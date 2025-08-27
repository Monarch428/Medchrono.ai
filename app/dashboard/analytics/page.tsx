"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  Clock,
  FileText,
  Download,
  Calendar,
  Home,
  Target,
  Brain,
  Users,
  AlertCircle,
  BarChart3,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Analytics & Reports</span>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Analytics & Reporting Dashboard</h1>
            <p className="text-gray-600 mt-2">Case performance analytics and predictive insights</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="6months">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Document Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">--</div>
              <p className="text-xs text-gray-500">No data available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chronology Generation Speed</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">--</div>
              <p className="text-xs text-gray-500">No data available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Accuracy Rate</CardTitle>
              <Brain className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">--</div>
              <p className="text-xs text-gray-500">No data available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settlement Prediction Accuracy</CardTitle>
              <Target className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">--</div>
              <p className="text-xs text-gray-500">No data available</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="case-performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="case-performance">Case Performance</TabsTrigger>
            <TabsTrigger value="predictive-analytics">Predictive Analytics</TabsTrigger>
            <TabsTrigger value="market-intelligence">Market Intelligence</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="case-performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Individual Case Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Individual Case Metrics</CardTitle>
                  <CardDescription>Performance tracking for individual cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No case data available</p>
                        <p className="text-sm text-gray-400">Create cases to see metrics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Processing Efficiency:</p>
                        <p className="font-medium text-gray-400">-- minutes avg</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Missing Document ID:</p>
                        <p className="font-medium text-gray-400">--%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Model Confidence:</p>
                        <p className="font-medium text-gray-400">--%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expert Effectiveness:</p>
                        <p className="font-medium text-gray-400">--%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Firm-Wide Performance Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Firm-Wide Performance</CardTitle>
                  <CardDescription>Overall firm productivity and efficiency metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: "Average Case Resolution Time", value: "--", unit: "days" },
                      { metric: "Settlement Rate Improvement", value: "--", unit: "%" },
                      { metric: "Cost Savings Per Case", value: "--", unit: "$" },
                      { metric: "Attorney Productivity Gains", value: "--", unit: "%" },
                      { metric: "Client Satisfaction Scores", value: "--", unit: "/10" },
                      { metric: "Revenue Per Case Increase", value: "--", unit: "%" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.metric}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-400">{item.value}</p>
                          <p className="text-xs text-gray-500">{item.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictive-analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Case Outcome Forecasting */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Case Outcome Forecasting</CardTitle>
                  <CardDescription>AI-powered predictions for case outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No prediction data available</p>
                        <p className="text-sm text-gray-400">Upload case documents to generate forecasts</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        "Settlement Probability Trends",
                        "Trial Outcome Predictions",
                        "Case Value Projections",
                        "Timeline to Resolution Estimates",
                        "Resource Allocation Recommendations",
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{item}</span>
                          <Badge variant="outline" className="text-gray-400">
                            No Data
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settlement Prediction vs Actual */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Prediction Accuracy</CardTitle>
                  <CardDescription>Settlement predictions vs actual outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No accuracy data available</p>
                        <p className="text-sm text-gray-400">Complete cases to track prediction accuracy</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">--%</p>
                        <p className="text-sm text-gray-500">Prediction Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-400">--</p>
                        <p className="text-sm text-gray-500">Cases Analyzed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="market-intelligence" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Local Jurisdiction Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Market Intelligence Reports</CardTitle>
                  <CardDescription>Local jurisdiction and market analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No market data available</p>
                        <p className="text-sm text-gray-400">Analyze more cases to generate insights</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        "Local Jurisdiction Settlement Patterns",
                        "Insurance Company Behavior Analysis",
                        "Opposing Counsel Success Rates",
                        "Medical Expert Effectiveness Tracking",
                        "Industry Trend Identification",
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm font-medium">{item}</span>
                          <Badge variant="outline" className="text-gray-400">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            No Data
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Industry Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Industry Trends</CardTitle>
                  <CardDescription>Market trends and competitive analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No trend data available</p>
                        <p className="text-sm text-gray-400">Build case history to identify trends</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="font-medium text-sm">Settlement Trend Analysis</p>
                        <p className="text-xs text-gray-500">Track market settlement patterns</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="font-medium text-sm">Competitive Benchmarking</p>
                        <p className="text-xs text-gray-500">Compare performance against market</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="font-medium text-sm">Regulatory Impact Analysis</p>
                        <p className="text-xs text-gray-500">Monitor regulatory changes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Available Reports</CardTitle>
                  <CardDescription>Generate and download detailed reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Case Performance Analytics Report",
                        description: "Individual and firm-wide metrics",
                        format: "PDF",
                      },
                      {
                        name: "Predictive Analytics Summary",
                        description: "AI forecasting and accuracy metrics",
                        format: "Excel",
                      },
                      {
                        name: "Market Intelligence Report",
                        description: "Jurisdiction and industry analysis",
                        format: "PDF",
                      },
                      {
                        name: "Settlement Outcome Analysis",
                        description: "Prediction vs actual outcomes",
                        format: "CSV",
                      },
                      { name: "ROI and Efficiency Report", description: "Platform value assessment", format: "PDF" },
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{report.name}</p>
                          <p className="text-sm text-gray-600">{report.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{report.format}</Badge>
                          <Button size="sm" variant="outline" disabled>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Scheduled Reports</CardTitle>
                  <CardDescription>Automated report delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No scheduled reports</p>
                      <p className="text-sm text-gray-400">Set up automated report delivery</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700">+ Schedule New Report</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
