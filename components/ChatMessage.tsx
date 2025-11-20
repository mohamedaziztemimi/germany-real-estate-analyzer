"use client"

import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType } from "@/lib/chat-schemas"

interface ChatMessageProps {
  message: ChatMessageType
}

interface StructuredSection {
  title: string
  bullets: string[]
}

function parseStructuredContent(content: string): StructuredSection[] | null {
  const lines = content.split("\n").map((line) => line.trim())
  const sections: StructuredSection[] = []
  let currentSection: StructuredSection | null = null

  for (const line of lines) {
    if (!line) continue

    const headingMatch = line.match(/^#{2,6}\s+(.*)$/)
    if (headingMatch) {
      currentSection = { title: headingMatch[1].trim(), bullets: [] }
      sections.push(currentSection)
      continue
    }

    if (line.startsWith("- ")) {
      if (!currentSection) {
        currentSection = { title: "Details", bullets: [] }
        sections.push(currentSection)
      }
      currentSection.bullets.push(line.slice(2).trim())
      continue
    }

    if (currentSection) {
      currentSection.bullets.push(line)
    }
  }

  return sections.length ? sections : null
}

function renderInlineFormatting(text: string, indexPrefix: string) {
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return segments.map((segment, idx) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return (
        <strong key={`${indexPrefix}-bold-${idx}`} className="font-semibold">
          {segment.slice(2, -2)}
        </strong>
      )
    }
    if (segment.startsWith("`") && segment.endsWith("`")) {
      return (
        <code
          key={`${indexPrefix}-code-${idx}`}
          className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-gray-700"
        >
          {segment.slice(1, -1)}
        </code>
      )
    }
    return <span key={`${indexPrefix}-text-${idx}`}>{segment}</span>
  })
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user"
  const structuredContent = !isUser ? parseStructuredContent(message.content) : null

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs rounded-2xl px-4 py-3 lg:max-w-md",
          isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900 shadow-sm border border-gray-200",
        )}
      >
        {structuredContent ? (
          <div className="space-y-4">
            {structuredContent.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{section.title}</p>
                <ul className="space-y-1 text-sm text-gray-800">
                  {section.bullets.map((bullet, idx) => (
                    <li key={`${section.title}-${idx}`} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400" />
                      <span className="leading-relaxed">{renderInlineFormatting(bullet, `${section.title}-${idx}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
        )}
        <time className={cn("mt-2 block text-xs", isUser ? "text-blue-100" : "text-gray-500")}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </time>
      </div>
    </div>
  )
}
