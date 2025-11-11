import { generateRequestId } from "./api"
import type { ChatRequest, ChatResponse } from "./chat-schemas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || `API error: ${response.status}`)
  }

  return data as T
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const requestId = generateRequestId()

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    },
    credentials: "include",
    body: JSON.stringify(request),
  })

  return handleResponse<ChatResponse>(response)
}
