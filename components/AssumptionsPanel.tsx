import { Card } from "@/components/ui/card"

interface AssumptionsPanelProps {
  assumptions?: Record<string, string>
}

export function AssumptionsPanel({ assumptions }: AssumptionsPanelProps) {
  if (!assumptions || Object.keys(assumptions).length === 0) {
    return null
  }

  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <h3 className="mb-4 text-lg font-semibold">Assumptions</h3>
      <ul className="space-y-2">
        {Object.entries(assumptions).map(([key, value]) => (
          <li key={key} className="text-sm text-gray-700">
            <span className="font-medium">{key}:</span> {value}
          </li>
        ))}
      </ul>
    </Card>
  )
}
