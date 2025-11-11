import { Card } from "@/components/ui/card"

interface ExplanationsPanelProps {
  explanations?: string[]
}

export function ExplanationsPanel({ explanations }: ExplanationsPanelProps) {
  if (!explanations || explanations.length === 0) {
    return null
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Analysis Insights</h3>
      <ul className="space-y-2">
        {explanations.map((explanation, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span className="text-sm text-gray-700">{explanation}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
