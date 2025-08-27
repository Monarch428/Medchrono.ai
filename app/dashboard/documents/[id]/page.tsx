"use client"

import { ArrowLeft, FileText, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Not Found</h1>
            <p className="text-gray-600">Document ID: {params.id}</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Document Data Available</h3>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            This document doesn't exist or hasn't been uploaded yet. Start by uploading your first document to see
            detailed analysis here.
          </p>
          <div className="flex space-x-3">
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
              <Link href="/dashboard/documents/upload">
                <Plus className="w-4 h-4 mr-2" />
                Upload Documents
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/documents">
                <FileText className="w-4 h-4 mr-2" />
                View All Documents
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
