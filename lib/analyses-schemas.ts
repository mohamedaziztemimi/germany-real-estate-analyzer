import { z } from "zod"
import { propertyPayloadSchema, predictionResponseSchema } from "./schemas"

// Analysis saved record schema
export const analysisSaveSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  notes: z.string().max(500).optional(),
})

export const analysisPayloadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  payload: propertyPayloadSchema,
  response: predictionResponseSchema,
  model_version: z.string().optional(),
})

export const analysisResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  notes: z.string().optional(),
  payload: propertyPayloadSchema,
  response: predictionResponseSchema,
  model_version: z.string().optional().nullable(),
  share_id: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const analysisListSchema = z.object({
  items: z.array(analysisResponseSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
})

export const analysisDocumentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  content_type: z.string(),
  created_at: z.string(),
})

export const userInfoSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
})

export const analysisShareSchema = z.object({
  id: z.string(),
  analysis: analysisResponseSchema,
  shared_by: userInfoSchema,
  message: z.string().nullable().optional(),
  created_at: z.string(),
})

export const analysisShareListSchema = z.object({
  items: z.array(analysisShareSchema),
})

export const analysisCommentSchema = z.object({
  id: z.string(),
  share_id: z.string(),
  user: userInfoSchema,
  body: z.string(),
  created_at: z.string(),
  likes_count: z.number(),
  liked_by_me: z.boolean(),
})

export type AnalysisSave = z.infer<typeof analysisSaveSchema>
export type AnalysisPayload = z.infer<typeof analysisPayloadSchema>
export type Analysis = z.infer<typeof analysisResponseSchema>
export type AnalysisList = z.infer<typeof analysisListSchema>
export type AnalysisDocument = z.infer<typeof analysisDocumentSchema>
export type AnalysisShare = z.infer<typeof analysisShareSchema>
export type AnalysisShareList = z.infer<typeof analysisShareListSchema>
export type AnalysisComment = z.infer<typeof analysisCommentSchema>
