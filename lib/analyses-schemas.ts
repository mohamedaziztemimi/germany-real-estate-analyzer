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
})

export const analysisResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  notes: z.string().optional(),
  payload: propertyPayloadSchema,
  response: predictionResponseSchema,
  created_at: z.string(),
  updated_at: z.string(),
  request_id: z.string(),
})

export const analysisListSchema = z.object({
  analyses: z.array(analysisResponseSchema),
  total: z.number(),
  request_id: z.string(),
})

export type AnalysisSave = z.infer<typeof analysisSaveSchema>
export type AnalysisPayload = z.infer<typeof analysisPayloadSchema>
export type Analysis = z.infer<typeof analysisResponseSchema>
export type AnalysisList = z.infer<typeof analysisListSchema>
