import { generateRequestId } from "./api"
import type { AnalysisPayload, Analysis, AnalysisList } from "./analyses-schemas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || `API error: ${response.status}`)
  }

  return data as T
}

// Save new analysis
export async function saveAnalysis(payload: AnalysisPayload): Promise<Analysis> {
  const response = await fetch(`${API_BASE_URL}/analyses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": generateRequestId(),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  })

  return handleResponse<Analysis>(response)
}

// Get all analyses (paginated)
export async function getAnalyses(page = 1, limit = 20): Promise<AnalysisList> {
  const response = await fetch(`${API_BASE_URL}/analyses?page=${page}&limit=${limit}`, {
    method: "GET",
    credentials: "include",
  })

  return handleResponse<AnalysisList>(response)
}

// Get single analysis by ID
export async function getAnalysis(id: string): Promise<Analysis> {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
    method: "GET",
    credentials: "include",
  })

  return handleResponse<Analysis>(response)
}

// Update analysis (title and notes)
export async function updateAnalysis(id: string, data: { title?: string; notes?: string }): Promise<Analysis> {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": generateRequestId(),
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  return handleResponse<Analysis>(response)
}

// Delete analysis
export async function deleteAnalysis(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to delete analysis")
  }
}
