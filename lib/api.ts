import type { PropertyPayload, PredictionResponse, APIError } from "./schemas"

// Default to same-origin API so auth cookies work with SameSite=Lax.
// Override via NEXT_PUBLIC_API_BASE_URL (or fallback REACT_APP_API_URL) for deployments that need a full URL.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.REACT_APP_API_URL ?? "/api/v1").replace(
  /\/$/,
  "",
)

const TOKEN_STORAGE_KEY = "rea_access_token"

// Generate request ID for tracing
export function generateRequestId(): string {
  return crypto.getRandomValues(new Uint8Array(16)).reduce((a, b) => a + b.toString(16).padStart(2, "0"), "")
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

export async function apiFetch<T>(path: string, options: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {})
  const token = getAccessToken()

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json")
  }

  // Always include request ID for tracing
  if (!headers.has("X-Request-Id")) {
    headers.set("X-Request-Id", generateRequestId())
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  })

  let data: any = null
  try {
    data = await response.json()
  } catch {
    // ignore - some endpoints may return no content
  }

  if (!response.ok) {
    const error: APIError | undefined = data
    throw new Error(
      error?.error?.message || (data as any)?.detail || `API error: ${response.status} ${response.statusText}`,
    )
  }

  return data as T
}

export async function predictProperty(payload: PropertyPayload): Promise<PredictionResponse> {
  return apiFetch<PredictionResponse>("/predict", { method: "POST", json: payload })
}

export async function getAnalyticsSummary() {
  return apiFetch("/analytics/summary", { method: "GET" })
}

export async function checkHealth() {
  return apiFetch("/health", { method: "GET" })
}
