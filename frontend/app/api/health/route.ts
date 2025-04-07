import { NextResponse } from "next/server"

export async function GET() {
  const API_URL = process.env.API_URL || "http://localhost:8000"

  let apiStatus = "unknown"
  let apiMessage = "API status unknown"

  try {
    // Try to connect to the API server
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${API_URL}/api/health`, {
      signal: controller.signal,
      cache: "no-store",
    })

    clearTimeout(timeout)

    if (response.ok) {
      apiStatus = "online"
      apiMessage = "API server is online and responding"
    } else {
      apiStatus = "error"
      apiMessage = `API server returned status ${response.status}`
    }
  } catch (error) {
    apiStatus = "offline"
    apiMessage = error instanceof Error ? error.message : "Failed to connect to API server"
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    api_url: API_URL,
    api_status: apiStatus,
    api_message: apiMessage,
  })
}

