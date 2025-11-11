"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useChatMutation } from "@/lib/hooks"
import { ChatContainer } from "@/components/ChatContainer"
import { ChatInput } from "@/components/ChatInput"
import { SuggestedQuestions } from "@/components/SuggestedQuestions"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { ChatMessage } from "@/lib/chat-schemas"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const predictionId = searchParams.get("predictionId")

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const chatMutation = useChatMutation()

  const handleSendMessage = async (content: string) => {
    setError(null)

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "user",
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      const response = await chatMutation.mutateAsync({
        message: content,
        prediction_id: predictionId || undefined,
        conversation_history: messages,
      })

      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: response.response,
        timestamp: response.timestamp,
        requestId: response.request_id,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update suggested questions
      if (response.suggested_questions) {
        setSuggestedQuestions(response.suggested_questions)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message. Please try again."
      setError(errorMessage)
      console.error("[v0] Chat error:", err)
    }
  }

  const handleSelectQuestion = (question: string) => {
    handleSendMessage(question)
  }

  if (!predictionId) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please analyze a property first to start a conversation about the results.{" "}
                <a href="/analyze" className="font-medium text-blue-600 hover:text-blue-700">
                  Go to Analyze
                </a>
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Property Analysis Chat</h1>
          <p className="mt-2 text-gray-600">
            Ask questions about the property analysis results and get AI-powered insights
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <ChatContainer messages={messages} isLoading={chatMutation.isPending} />

          <ChatInput onSendMessage={handleSendMessage} isLoading={chatMutation.isPending} disabled={!predictionId} />

          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelectQuestion={handleSelectQuestion}
            isLoading={chatMutation.isPending}
          />
        </div>
      </div>
    </main>
  )
}
