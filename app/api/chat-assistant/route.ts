import { NextRequest, NextResponse } from "next/server"

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, action, case_id } = body

    // case_id is REQUIRED for all operations
    if (!case_id) {
      return NextResponse.json({ error: "case_id is required" }, { status: 400 })
    }

    // Determine the endpoint based on action
    let endpoint = `${PYTHON_BACKEND_URL}/chat/`

    // If action is 'refresh', call the refresh endpoint
    if (action === "refresh") {
      endpoint = `${PYTHON_BACKEND_URL}/chat/refresh`

      // Forward request to Python backend for refresh
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ case_id }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        return NextResponse.json(
          {
            error: "Refresh request failed",
            details: errorData.detail || response.statusText,
          },
          { status: response.status },
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // For regular chat requests
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Forward request to Python backend with case_id
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, case_id }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
      return NextResponse.json(
        {
          error: "Chat request failed",
          details: errorData.detail || response.statusText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Chat Assistant API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
