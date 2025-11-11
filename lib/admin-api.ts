import { generateRequestId } from "./api"
import type { User, Model, CreateModel, UsersList, ModelsList, PredictionsList } from "./admin-schemas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || `API error: ${response.status}`)
  }

  return data as T
}

// Users
export async function getUsers(): Promise<UsersList> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "GET",
    credentials: "include",
  })
  return handleResponse<UsersList>(response)
}

export async function updateUserRole(userId: string, role: "user" | "admin"): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": generateRequestId(),
    },
    credentials: "include",
    body: JSON.stringify({ role }),
  })
  return handleResponse<User>(response)
}

// Models
export async function getModels(): Promise<ModelsList> {
  const response = await fetch(`${API_BASE_URL}/admin/models`, {
    method: "GET",
    credentials: "include",
  })
  return handleResponse<ModelsList>(response)
}

export async function createModel(data: CreateModel): Promise<Model> {
  const response = await fetch(`${API_BASE_URL}/admin/models`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": generateRequestId(),
    },
    credentials: "include",
    body: JSON.stringify(data),
  })
  return handleResponse<Model>(response)
}

export async function activateModel(modelId: string): Promise<Model> {
  const response = await fetch(`${API_BASE_URL}/admin/models/${modelId}/activate`, {
    method: "POST",
    credentials: "include",
  })
  return handleResponse<Model>(response)
}

// Predictions
export async function getPredictions(page = 1): Promise<PredictionsList> {
  const response = await fetch(`${API_BASE_URL}/admin/predictions?page=${page}&limit=50`, {
    method: "GET",
    credentials: "include",
  })
  return handleResponse<PredictionsList>(response)
}
