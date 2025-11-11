import type { PropertyPayload, PredictionResponse, APIError } from "./schemas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

// Generate request ID for tracing
export function generateRequestId(): string {
  return crypto.getRandomValues(new Uint8Array(16)).reduce((a, b) => a + b.toString(16).padStart(2, "0"), "")
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    const error: APIError = data
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  return data as T
}

export async function predictProperty(payload: PropertyPayload): Promise<PredictionResponse> {
  const requestId = generateRequestId()

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  return handleResponse<PredictionResponse>(response)
}

export async function getAnalyticsSummary() {
  const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
    method: "GET",
    headers: {
      "X-Request-Id": generateRequestId(),
    },
    credentials: "include",
  })

  return handleResponse(response)
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: "GET",
  })

  return handleResponse(response)
}
