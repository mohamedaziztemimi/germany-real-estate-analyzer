import { z } from "zod"

// User management
export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(["user", "admin"]),
  created_at: z.string(),
})

export const usersListSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
})

// Model management
export const modelSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  path: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
})

export const modelsListSchema = z.object({
  models: z.array(modelSchema),
  total: z.number(),
})

export const createModelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  version: z.string().min(1, "Version is required"),
  path: z.string().min(1, "Path is required"),
})

// Predictions tracking
export const predictionLogSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  decision: z.enum(["Buy", "Don't buy"]),
  confidence: z.number(),
  roi_estimated: z.number(),
  created_at: z.string(),
})

export const predictionsListSchema = z.object({
  predictions: z.array(predictionLogSchema),
  total: z.number(),
})

export type User = z.infer<typeof userSchema>
export type UsersList = z.infer<typeof usersListSchema>
export type Model = z.infer<typeof modelSchema>
export type ModelsList = z.infer<typeof modelsListSchema>
export type CreateModel = z.infer<typeof createModelSchema>
export type PredictionLog = z.infer<typeof predictionLogSchema>
export type PredictionsList = z.infer<typeof predictionsListSchema>
