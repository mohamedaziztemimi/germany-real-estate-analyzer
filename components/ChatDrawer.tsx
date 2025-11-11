"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, X, MessageSquare } from "lucide-react"
import { useChatMutation } from "@/lib/hooks"
import { ChatMessage } from "@/components/ChatMessage"
import { SuggestedQuestions } from "@/components/SuggestedQuestions"
import type { ChatMessage as ChatMessageType } from "@/lib/chat-schemas"

interface ChatDrawerProps {
  predictionId?: string
  isOpen: boolean
  onClose: () => void
}

export function ChatDrawer({ predictionId, isOpen, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [input, setInput] = useState("")
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const { mutate: sendMessage, isPending } = useChatMutation()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (text?: string) => {
    const messageText = text || input.trim()
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
        message: messageText,
        prediction_id: predictionId,
        conversation_history: messages,
      },
      {
        onSuccess: (response) => {
          const assistantMessage: ChatMessageType = {
            id: response.request_id,
            type: "assistant",
            content: response.response,
            timestamp: response.timestamp,
          }
          setMessages((prev) => [...prev, assistantMessage])
          setSuggestedQuestions(response.suggested_questions || [])
        },
      },
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="fixed bottom-0 right-0 h-screen w-full sm:w-96 bg-white shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Analysis Assistant</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-center text-sm">Ask me anything about this analysis</p>
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

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && !isPending && (
          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelectQuestion={handleSendMessage}
            isLoading={isPending}
          />
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
