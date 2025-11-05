"use client"

import Link from "next/link"
import { Mail, MessageCircle, Phone, Reply, LifeBuoy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-6">
        <div className="mb-4 flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-gray-900">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-700">Support</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Support</h1>
            <p className="mt-1 text-gray-600">
              Reach our team for technical help, onboarding assistance, or account questions.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <LifeBuoy className="h-5 w-5 text-cyan-600" />
            <span>We're here Monday – Friday, 8am to 6pm CT</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form and the MedChronoAI support team will reply within one business day.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="support-name">
                    Full name
                  </label>
                  <Input id="support-name" placeholder="Jane Attorney" className="bg-white" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="support-email">
                    Work email
                  </label>
                  <Input id="support-email" type="email" placeholder="attorney@firm.com" className="bg-white" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="support-subject">
                  Subject
                </label>
                <Input id="support-subject" placeholder="Chronology export help" className="bg-white" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="support-message">
                  How can we help?
                </label>
                <Textarea
                  id="support-message"
                  rows={6}
                  placeholder="Share details about your request, recent actions, or any error messages."
                  className="bg-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Our team will email you at the address provided.</p>
                <Button className="bg-cyan-600 hover:bg-cyan-700" type="button">
                  <Reply className="mr-2 h-4 w-4" />
                  Submit request
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Contact options</CardTitle>
                <CardDescription>Choose the best channel for your request.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@medchrono.ai</p>
                    <p className="text-xs text-gray-500">Replies within one business day</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">(312) 555-0198</p>
                    <p className="text-xs text-gray-500">Weekdays, 8am – 6pm Central Time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Chat with us</p>
                    <p className="text-sm text-gray-600">Use the AI assistant or live chat from the dashboard.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Helpful resources</CardTitle>
                <CardDescription>Guides to get the most from MedChronoAI.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Link href="/dashboard/templates" className="flex items-center justify-between text-cyan-700 hover:text-cyan-900">
                  Chronology templates overview
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/dashboard/documents/upload" className="flex items-center justify-between text-cyan-700 hover:text-cyan-900">
                  Document upload best practices
                  <span aria-hidden>→</span>
                </Link>
                <Link href="/dashboard/cases/new" className="flex items-center justify-between text-cyan-700 hover:text-cyan-900">
                  Case intake checklist
                  <span aria-hidden>→</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
