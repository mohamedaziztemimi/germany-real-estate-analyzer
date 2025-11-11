import { z } from "zod"

// Chat message schema
export const chatMessageSchema = z.object({
  id: z.string(),
  type: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  requestId: z.string().optional(),
})

// Chat request schema for backend
export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  prediction_id: z.string().optional(),
  conversation_history: z.array(chatMessageSchema).optional(),
})

// Chat response schema from backend
export const chatResponseSchema = z.object({
  response: z.string(),
  suggested_questions: z.array(z.string()).optional(),
  request_id: z.string(),
  timestamp: z.string(),
})

// Local chat state
export const chatStateSchema = z.object({
  messages: z.array(chatMessageSchema),
  isLoading: z.boolean(),
  error: z.string().optional(),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ChatRequest = z.infer<typeof chatRequestSchema>
export type ChatResponse = z.infer<typeof chatResponseSchema>
export type ChatState = z.infer<typeof chatStateSchema>
