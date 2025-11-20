"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, X, MessageSquare } from "lucide-react"
import { useChatMutation } from "@/lib/hooks"
import { ChatMessage } from "@/components/ChatMessage"
import type { ChatMessage as ChatMessageType } from "@/lib/chat-schemas"
import type { PropertyPayload, PredictionResponse } from "@/lib/schemas"

interface ChatDrawerProps {
  predictionId?: string
  analysisPayload?: PropertyPayload
  analysisResponse?: PredictionResponse
  isOpen: boolean
  onClose: () => void
}

export function ChatDrawer({ predictionId, analysisPayload, analysisResponse, isOpen, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const { mutate: sendMessage, isPending } = useChatMutation()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId] = useState(() => crypto.randomUUID())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    const messageText = input.trim()
    if (!messageText) return

    const userMessage: ChatMessageType = {
      id: Math.random().toString(36).substr(2, 9),
      type: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    sendMessage(
      {
        session_id: sessionId,
        message: messageText,
        context: {
          prediction_id: predictionId,
          history: [...messages, userMessage],
          analysis_payload: analysisPayload,
          analysis_response: analysisResponse,
        },
      },
      {
        onSuccess: (response) => {
          const assistantMessage: ChatMessageType = {
            id: (response.meta as any)?.request_id || crypto.randomUUID(),
            type: "assistant",
            content: response.reply,
            timestamp:
              typeof response.meta?.timestamp === "string" ? response.meta.timestamp : new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMessage])
        },
      },
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onClose} />
      <div
        className="pointer-events-auto relative bottom-6 right-6 w-full max-w-md rounded-2xl border border-blue-100 bg-white shadow-2xl flex flex-col h-[520px]"
      >
        <div className="border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl bg-blue-50">
          <div className="flex items-center gap-2 text-blue-700">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-semibold">Analysis Copilot</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-center text-sm">Ask me anything about this analysis.</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3 rounded-b-2xl bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask a question..."
              disabled={isPending}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
