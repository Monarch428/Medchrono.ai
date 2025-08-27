"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Brain,
  Clock,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  Calculator,
  ArrowRight,
  Scale,
  Stethoscope,
  FileSearch,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const [cases, setCases] = useState(0)
  const [hours, setHours] = useState(0)
  const [rate, setRate] = useState(0)
  const [calculated, setCalculated] = useState(false)

  const calculateSavings = () => {
    setCalculated(true)
  }

  const timeSavedPerMonth = Math.round(cases * hours * 0.9) // 90% time reduction
  const costSavingsPerMonth = Math.round(timeSavedPerMonth * rate)
  const annualSavings = costSavingsPerMonth * 12
  const subscriptionCost = 299 * 12 // Annual subscription cost
  const netSavings = annualSavings - subscriptionCost

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-cyan-600 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-serif font-black text-gray-900">MedChrono.io</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-cyan-600 transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-cyan-600 transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-cyan-600 transition-colors">
                Pricing
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-cyan-600 transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-amber-100 text-amber-800 hover:bg-amber-100">
            HIPAA Compliant • AI-Powered • Trusted by 500+ Law Firms
          </Badge>

          <h1 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-6 leading-tight">
            Transform Medical Records into <span className="text-cyan-600">Winning Case Narratives</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Harness the power of precise medical chronologies for impactful legal strategies. Analyze, organize, and
            present medical records effortlessly with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-lg px-8 py-4" asChild>
              <Link href="/register">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 bg-transparent" asChild>
              <Link href="#demo">Request Demo</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">Save 15+ Hours Per Case</h3>
              <p className="text-gray-600">Automated chronology generation reduces manual review time by 90%</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">99.2% Accuracy Rate</h3>
              <p className="text-gray-600">AI-powered medical terminology extraction and classification</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2">35% Higher Settlements</h3>
              <p className="text-gray-600">Comprehensive chronologies lead to better case outcomes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">
              Everything You Need for Medical Case Analysis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From document upload to expert matching, our platform streamlines every aspect of medical chronology
              creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <FileSearch className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="font-serif">Smart Document Analysis</CardTitle>
                <CardDescription>AI-powered OCR and medical terminology extraction with 99.2% accuracy</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <CardTitle className="font-serif">Automated Chronologies</CardTitle>
                <CardDescription>Generate comprehensive medical timelines in minutes, not hours</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="font-serif">Expert Matching</CardTitle>
                <CardDescription>Connect with qualified medical experts based on case specifics</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Scale className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="font-serif">Settlement Predictions</CardTitle>
                <CardDescription>AI-driven case value estimation based on historical data</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="font-serif">HIPAA Compliance</CardTitle>
                <CardDescription>Bank-level security with full HIPAA compliance and audit trails</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="font-serif">Predictive Analytics</CardTitle>
                <CardDescription>Advanced insights to optimize case strategy and outcomes</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">
              Trusted by Leading Personal Injury Attorneys
            </h2>
            <p className="text-xl text-gray-600">See how MedChronoAI is transforming case preparation nationwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed">
                  "MedChronoAI reduced our case prep time by 80%. The AI analysis caught medical details we would have
                  missed, leading to a $2.3M settlement."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold">Sarah Mitchell</p>
                    <p className="text-sm text-gray-600">Partner, Mitchell & Associates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed">
                  "The expert matching feature connected us with the perfect neurologist. His testimony was crucial in
                  our $4.1M brain injury case."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold">David Rodriguez</p>
                    <p className="text-sm text-gray-600">Rodriguez Law Firm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <CardDescription className="text-base leading-relaxed">
                  "As a solo practitioner, MedChronoAI gives me the analytical power of a large firm. My settlement
                  rates have increased 40% since adoption."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="font-semibold">Jennifer Chen</p>
                    <p className="text-sm text-gray-600">Chen Legal Services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-cyan-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-black text-gray-900 mb-4">Calculate Your Time & Cost Savings</h2>
              <p className="text-xl text-gray-600">See how much MedChronoAI can save your firm annually</p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="cases">Average Cases Per Month</Label>
                      <Input
                        id="cases"
                        type="number"
                        value={cases || ""}
                        onChange={(e) => setCases(Number(e.target.value) || 0)}
                        placeholder="Enter number of cases"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hours">Hours Per Case (Manual Review)</Label>
                      <Input
                        id="hours"
                        type="number"
                        value={hours || ""}
                        onChange={(e) => setHours(Number(e.target.value) || 0)}
                        placeholder="Enter hours per case"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rate">Attorney Hourly Rate ($)</Label>
                      <Input
                        id="rate"
                        type="number"
                        value={rate || ""}
                        onChange={(e) => setRate(Number(e.target.value) || 0)}
                        placeholder="Enter hourly rate"
                        className="mt-2"
                      />
                    </div>

                    <Button onClick={calculateSavings} className="w-full bg-cyan-600 hover:bg-cyan-700">
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate Savings
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-serif font-bold text-xl mb-6">Your Potential Savings</h3>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Time Saved Per Month:</span>
                        <span className="font-bold text-green-600">{timeSavedPerMonth.toLocaleString()} hours</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cost Savings Per Month:</span>
                        <span className="font-bold text-green-600">${costSavingsPerMonth.toLocaleString()}</span>
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-semibold">Annual Savings:</span>
                        <span className="font-bold text-2xl text-green-600">${annualSavings.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Less: Annual Subscription:</span>
                        <span className="font-bold text-red-600">-${subscriptionCost.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-gray-900 font-semibold">Net Annual Savings:</span>
                        <span className="font-bold text-2xl text-green-600">${netSavings.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>ROI:</strong> Based on {Math.round((timeSavedPerMonth / (cases * hours)) * 100)}% time
                        reduction and $299/month subscription
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-black text-white mb-4">Ready to Transform Your Practice?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join 500+ personal injury attorneys who trust MedChronoAI for their medical chronology needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-lg px-8 py-4" asChild>
              <Link href="/register">
                Start Free 14-Day Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              asChild
            >
              <Link href="#demo">Schedule Demo</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 mt-12 text-gray-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-cyan-600 rounded-lg">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-serif font-black text-gray-900">MedChronoAI</span>
              </div>
              <p className="text-gray-600 mb-4">
                Transforming medical records into winning case narratives for personal injury attorneys.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
            </div>

            <div>
              <h3 className="font-serif font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#features" className="hover:text-cyan-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-cyan-600">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#demo" className="hover:text-cyan-600">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="#security" className="hover:text-cyan-600">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#help" className="hover:text-cyan-600">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-cyan-600">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#training" className="hover:text-cyan-600">
                    Training
                  </Link>
                </li>
                <li>
                  <Link href="#api" className="hover:text-cyan-600">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#privacy" className="hover:text-cyan-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="hover:text-cyan-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#hipaa" className="hover:text-cyan-600">
                    HIPAA Compliance
                  </Link>
                </li>
                <li>
                  <Link href="#dpa" className="hover:text-cyan-600">
                    Data Processing Agreement
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center text-gray-600">
            <p>&copy; 2024 MedChronoAI. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-sm">Trusted by 500+ Law Firms</span>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
