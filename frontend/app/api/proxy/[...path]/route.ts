import { type NextRequest, NextResponse } from "next/server"

// Get the API URL from environment variables
const API_URL = process.env.API_URL || "http://localhost:8000"

// Timeout for fetch requests (in milliseconds)
const FETCH_TIMEOUT = 10000

// Helper function to create a fetch request with timeout
const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const controller = new AbortController()
  const { signal } = controller

  const timeout = setTimeout(() => {
    controller.abort()
  }, FETCH_TIMEOUT)

  try {
    const response = await fetch(url, { ...options, signal })
    clearTimeout(timeout)
    return response
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const searchParams = request.nextUrl.search
  const url = `${API_URL}/api/${path}${searchParams}`

  console.log(`Proxying GET request to: ${url}`)

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Forward authorization header if present
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetchWithTimeout(url, {
      headers,
      cache: "no-store",
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    } else {
      const text = await response.text()
      return new NextResponse(text, {
        status: response.status,
        headers: { "Content-Type": contentType || "text/plain" },
      })
    }
  } catch (error) {
    console.error(`Error proxying GET request to ${url}:`, error)

    // Provide more specific error messages
    let errorMessage = "Failed to fetch data from API"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "API request timed out"
        statusCode = 504 // Gateway Timeout
      } else if (error.message.includes("fetch")) {
        errorMessage = "API server is unreachable"
        statusCode = 503 // Service Unavailable
      } else {
        errorMessage = `API error: ${error.message}`
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const url = `${API_URL}/api/${path}`

  console.log(`Proxying POST request to: ${url}`)

  try {
    const body = await request.json()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Forward authorization header if present
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    } else {
      const text = await response.text()
      return new NextResponse(text, {
        status: response.status,
        headers: { "Content-Type": contentType || "text/plain" },
      })
    }
  } catch (error) {
    console.error(`Error proxying POST request to ${url}:`, error)

    // Provide more specific error messages
    let errorMessage = "Failed to send data to API"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "API request timed out"
        statusCode = 504 // Gateway Timeout
      } else if (error.message.includes("fetch")) {
        errorMessage = "API server is unreachable"
        statusCode = 503 // Service Unavailable
      } else {
        errorMessage = `API error: ${error.message}`
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const url = `${API_URL}/api/${path}`

  console.log(`Proxying PUT request to: ${url}`)

  try {
    const body = await request.json()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Forward authorization header if present
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetchWithTimeout(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    } else {
      const text = await response.text()
      return new NextResponse(text, {
        status: response.status,
        headers: { "Content-Type": contentType || "text/plain" },
      })
    }
  } catch (error) {
    console.error(`Error proxying PUT request to ${url}:`, error)

    // Provide more specific error messages
    let errorMessage = "Failed to update data in API"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        errorMessage = "API request timed out"
        statusCode = 504 // Gateway Timeout
      } else if (error.message.includes("fetch")) {
        errorMessage = "API server is unreachable"
        statusCode = 503 // Service Unavailable
      } else {
        errorMessage = `API error: ${error.message}`
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

