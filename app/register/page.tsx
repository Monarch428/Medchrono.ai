"use client"

import type React from "react"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Stethoscope, Shield, ArrowLeft, CheckCircle, Users } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firmName: "",
    barNumber: "",
    attorneyName: "",
    phone: "",
    email: "",
    password: "",
    caseVolume: "",
    firmSize: "",
    hipaaAgreed: false,
    dpaAgreed: false,
    marketingOptIn: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (
      !formData.firmName ||
      !formData.barNumber ||
      !formData.attorneyName ||
      !formData.phone ||
      !formData.email ||
      !formData.password
    ) {
      alert("Please fill in all required fields")
      return
    }

    if (!formData.hipaaAgreed || !formData.dpaAgreed) {
      alert("Please agree to the HIPAA Compliance and Data Processing Agreement")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user, session },
        error: signUpError,
      } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.attorneyName,
            firm_name: formData.firmName,
            phone: formData.phone,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (user) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            firmName: formData.firmName,
            barNumber: formData.barNumber,
            attorneyName: formData.attorneyName,
            phone: formData.phone,
            caseVolume: formData.caseVolume,
            firmSize: formData.firmSize,
            marketingOptIn: formData.marketingOptIn,
            hipaaAgreed: formData.hipaaAgreed,
            dpaAgreed: formData.dpaAgreed,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error ?? "Failed to save firm profile")
        }
      }

      if (!session) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (loginError) {
          console.warn("Auto sign-in after registration failed:", loginError.message)
        }
      }

      setSuccess("Account created successfully! Redirecting to your dashboard...")
      setIsLoading(false)
      setTimeout(() => router.push("/dashboard"), 1200)
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-600 hover:text-cyan-600 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-cyan-600 rounded-lg">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-serif font-black text-gray-900">MedChronoAI</span>
          </div>

          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Start Your Free Trial</h1>
          <p className="text-gray-600">Join 500+ personal injury attorneys transforming their practice</p>

          <Badge className="mt-4 bg-green-100 text-green-800 hover:bg-green-100">
            14-Day Free Trial • No Credit Card Required
          </Badge>
        </div>

        {/* Registration Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Create Your Account</CardTitle>
            <CardDescription>Complete the form below to get started with MedChronoAI</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Unable to complete registration</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Firm Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h3 className="font-serif font-bold text-lg">Firm Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firmName">Law Firm Name *</Label>
                    <Input
                      id="firmName"
                      placeholder="Smith & Associates Law Firm"
                      className="h-11"
                      value={formData.firmName}
                      onChange={(e) => handleInputChange("firmName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barNumber">State Bar Number *</Label>
                    <Input
                      id="barNumber"
                      placeholder="123456789"
                      className="h-11"
                      value={formData.barNumber}
                      onChange={(e) => handleInputChange("barNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Primary Practice Areas *</Label>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="personalInjury" defaultChecked />
                      <Label htmlFor="personalInjury" className="text-sm">
                        Personal Injury
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="medMalpractice" />
                      <Label htmlFor="medMalpractice" className="text-sm">
                        Medical Malpractice
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="workersComp" />
                      <Label htmlFor="workersComp" className="text-sm">
                        Workers Compensation
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="caseVolume">Annual Case Volume</Label>
                    <Select onValueChange={(value) => handleInputChange("caseVolume", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select volume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-25">1-25 cases</SelectItem>
                        <SelectItem value="26-100">26-100 cases</SelectItem>
                        <SelectItem value="101-500">101-500 cases</SelectItem>
                        <SelectItem value="500+">500+ cases</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firmSize">Firm Size</Label>
                    <Select onValueChange={(value) => handleInputChange("firmSize", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo Practitioner</SelectItem>
                        <SelectItem value="2-5">2-5 Attorneys</SelectItem>
                        <SelectItem value="6-20">6-20 Attorneys</SelectItem>
                        <SelectItem value="20+">20+ Attorneys</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step 2: Account Setup */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h3 className="font-serif font-bold text-lg">Account Setup</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attorneyName">Primary Attorney Name *</Label>
                    <Input
                      id="attorneyName"
                      placeholder="John Smith"
                      className="h-11"
                      value={formData.attorneyName}
                      onChange={(e) => handleInputChange("attorneyName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="(555) 123-4567"
                      className="h-11"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Business Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@smithlaw.com"
                    className="h-11"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    className="h-11"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Must contain at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
              </div>

              <Separator />

              {/* Step 3: Compliance & Security */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h3 className="font-serif font-bold text-lg">Compliance & Security</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="hipaa"
                      className="mt-1"
                      checked={formData.hipaaAgreed}
                      onCheckedChange={(checked) => handleInputChange("hipaaAgreed", checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="hipaa" className="font-medium">
                        HIPAA Compliance Agreement *
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        I acknowledge that my firm will handle protected health information in compliance with HIPAA
                        regulations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Checkbox
                      id="dpa"
                      className="mt-1"
                      checked={formData.dpaAgreed}
                      onCheckedChange={(checked) => handleInputChange("dpaAgreed", checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="dpa" className="font-medium">
                        Data Processing Agreement *
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        I agree to the terms of the Data Processing Agreement and understand how my data will be
                        handled.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketing"
                      className="mt-1"
                      checked={formData.marketingOptIn}
                      onCheckedChange={(checked) => handleInputChange("marketingOptIn", checked as boolean)}
                    />
                    <div>
                      <Label htmlFor="marketing" className="font-medium">
                        Marketing Communications
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        I would like to receive updates about new features and legal industry insights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-cyan-600 hover:bg-cyan-700 text-lg"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Start Free Trial"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-serif font-bold mb-2">14-Day Free Trial</h4>
            <p className="text-sm text-gray-600">Full access to all features</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-cyan-600" />
            </div>
            <h4 className="font-serif font-bold mb-2">HIPAA Compliant</h4>
            <p className="text-sm text-gray-600">Bank-level security</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-serif font-bold mb-2">24/7 Support</h4>
            <p className="text-sm text-gray-600">Expert assistance</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Your data is encrypted and secure • SOC 2 Certified</span>
          </div>
        </div>
      </div>
    </div>
  )
}
