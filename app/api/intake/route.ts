import { type NextRequest, NextResponse } from "next/server"

const INTAKE_API_URL = process.env.INTAKE_API_URL

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  if (!INTAKE_API_URL) {
    return NextResponse.json(
      { error: "Intake AI service is not configured.", details: "Missing INTAKE_API_URL environment variable." },
      { status: 500 },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid JSON payload.",
        details: error instanceof Error ? error.message : "Unable to parse request body as JSON.",
      },
      { status: 400 },
    )
  }

  try {
    const upstreamResponse = await fetch(INTAKE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload ?? {}),
      next: { revalidate: 0 },
    })

    const text = await upstreamResponse.text()
    let data: unknown = null

    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text
    }

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: "Failed to retrieve a response from the intake service.",
          status: upstreamResponse.status,
          details: data,
        },
        { status: upstreamResponse.status },
      )
    }

    if (data === null || data === "") {
      return NextResponse.json({ message: "" })
    }

    if (typeof data === "string") {
      return NextResponse.json({ message: data })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Intake API proxy error:", error)
    return NextResponse.json(
      {
        error: "Unable to contact the intake service.",
        details: error instanceof Error ? error.message : "Unknown error occurred.",
      },
      { status: 502 },
    )
  }
}
