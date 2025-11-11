"use client"

import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType } from "@/lib/chat-schemas"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user"

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs rounded-lg px-4 py-2 lg:max-w-md",
          isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900",
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <time className={cn("mt-1 block text-xs", isUser ? "text-blue-100" : "text-gray-600")}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </time>
      </div>
    </div>
  )
}
