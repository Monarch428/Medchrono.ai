import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


// const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

// let INTAKE_API_URL =  `${PYTHON_BACKEND_URL}/intake/respond`

export async function POST(request: NextRequest) {
  const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"
  const INTAKE_API_URL = `${PYTHON_BACKEND_URL}/intake/respond`

  let payload
  try {
    const body = await request.json()
    // 🔥 Ensure body.message maps to user_message (as FastAPI expects)
    payload = {
      user_message: body.message || body.user_message,
      session_id: body.session_id || null,
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  console.log("➡️ Sending payload to backend:", payload)

  const upstreamResponse = await fetch(INTAKE_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const text = await upstreamResponse.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }

  if (!upstreamResponse.ok) {
    console.error("❌ Backend error:", data)
    return NextResponse.json({ error: "Backend rejected request", details: data }, { status: upstreamResponse.status })
  }

  return NextResponse.json(data)
}

