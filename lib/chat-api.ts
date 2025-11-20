import { apiFetch } from "./api"
import type { ChatRequest, ChatResponse } from "./chat-schemas"

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/chat", {
    method: "POST",
    json: request,
  })
}
