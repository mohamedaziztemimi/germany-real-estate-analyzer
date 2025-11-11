import type { APIError } from "./schemas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

export interface User {
  id: string
  email: string
  role: string
}

export interface AuthResponse {
  user: User
}

// Generate request ID for tracing
function generateRequestId(): string {
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

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": generateRequestId(),
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })

  return handleResponse<AuthResponse>(response)
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": generateRequestId(),
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })

  return handleResponse<AuthResponse>(response)
}

export async function getSession(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Not authenticated")
  }

  return handleResponse<AuthResponse>(response)
}

export async function signOut(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}
