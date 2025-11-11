import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PredictionResponse } from "@/lib/schemas"

interface DecisionCardProps {
  prediction: PredictionResponse
}

export function DecisionCard({ prediction }: DecisionCardProps) {
  const isBuy = prediction.decision === "Buy"
  const bgClass = isBuy ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  const badgeVariant = isBuy ? "default" : "destructive"

  return (
    <Card className={`p-8 text-center ${bgClass}`}>
      <h2 className="mb-4 text-2xl font-bold">Investment Decision</h2>
      <Badge variant={badgeVariant} className="mb-6 text-lg px-4 py-2">
        {prediction.decision}
      </Badge>
      <div className="mt-6">
        <p className="text-gray-600">Confidence Level</p>
        <p className="text-4xl font-bold text-blue-600">{(prediction.confidence * 100).toFixed(1)}%</p>
      </div>
    </Card>
  )
}
