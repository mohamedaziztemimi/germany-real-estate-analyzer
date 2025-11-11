"use client"

import { Button } from "@/components/ui/button"

interface SuggestedQuestionsProps {
  questions: string[]
  onSelectQuestion: (question: string) => void
  isLoading: boolean
}

export function SuggestedQuestions({ questions, onSelectQuestion, isLoading }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-600">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelectQuestion(question)}
            disabled={isLoading}
            className="text-xs"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}
