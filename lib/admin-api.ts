import { apiFetch } from "./api"
import type { User, Model, CreateModel, UsersList, ModelsList, PredictionsList } from "./admin-schemas"

// Users
export async function getUsers(): Promise<UsersList> {
  const data = await apiFetch<any>("/admin/users", { method: "GET" })
  const users = Array.isArray(data) ? data : data?.users ?? data?.items ?? []
  const total = typeof data?.total === "number" ? data.total : users.length
  return { users, total }
}

export async function updateUserRole(userId: string, role: "user" | "admin"): Promise<User> {
  return apiFetch<User>(`/admin/users/${userId}/role`, { method: "PUT", json: { role } })
}

export async function createUser(data: { email: string; password: string; role: "user" | "admin" }): Promise<User> {
  return apiFetch<User>("/admin/users", { method: "POST", json: data })
}

export async function updateUser(userId: string, data: { email?: string; role?: "user" | "admin" }): Promise<User> {
  return apiFetch<User>(`/admin/users/${userId}`, { method: "PUT", json: data })
}

export async function deleteUser(userId: string): Promise<void> {
  await apiFetch(`/admin/users/${userId}`, { method: "DELETE" })
}

// Models
export async function getModels(): Promise<ModelsList> {
  const data = await apiFetch<any>("/admin/models", { method: "GET" })
  const models: Model[] = (Array.isArray(data) ? data : data?.models ?? data?.items ?? []).map((model: any) => ({
    ...model,
    active: Boolean(model?.active),
  }))
  const total = typeof data?.total === "number" ? data.total : models.length
  return { models, total }
}

export async function createModel(data: CreateModel): Promise<Model> {
  return apiFetch<Model>("/admin/models", {
    method: "POST",
    json: data,
  })
}

export async function activateModel(modelId: string): Promise<Model> {
  return apiFetch<Model>(`/admin/models/${modelId}/activate`, { method: "PUT" })
}

// Predictions
export async function getPredictions(page = 1): Promise<PredictionsList> {
  const data = await apiFetch<any>(`/admin/predictions?page=${page}&page_size=50`, { method: "GET" })
  const predictions = Array.isArray(data) ? data : data?.predictions ?? data?.items ?? []
  const total = typeof data?.total === "number" ? data.total : predictions.length
  const pageSize = typeof data?.page_size === "number" ? data.page_size : 50
  const pageNum = typeof data?.page === "number" ? data.page : page
  return { predictions, total, page: pageNum, page_size: pageSize }
}
