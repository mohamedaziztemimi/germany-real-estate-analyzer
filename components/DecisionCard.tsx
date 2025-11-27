import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PredictionResponse } from "@/lib/schemas"
import { useLanguage } from "@/lib/language-context"
import { CountUp } from "@/components/CountUp"

interface DecisionCardProps {
  prediction: PredictionResponse
}

export function DecisionCard({ prediction }: DecisionCardProps) {
  const { strings, language } = useLanguage()
  const isBuy = prediction.decision === "Buy"
  const bgClass = isBuy ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  const badgeVariant = isBuy ? "default" : "destructive"
  const decisionLabel =
    language === "de"
      ? isBuy
        ? strings.decisionBuy
        : strings.decisionDontBuy
      : prediction.decision

  return (
    <Card className={`p-8 text-center ${bgClass}`}>
      <h2 className="mb-4 text-2xl font-bold">{strings.investmentDecision}</h2>
      <Badge variant={badgeVariant} className="mb-6 text-lg px-4 py-2 mx-auto">
        {decisionLabel}
      </Badge>
      <div className="mt-6">
        <p className="text-gray-600">{strings.confidenceLevel}</p>
        <p className="text-4xl font-bold text-blue-600">
          <CountUp value={prediction.confidence * 100} decimals={1} suffix="%" />
        </p>
      </div>
      {prediction.summary_text && (
        <p className="mt-4 text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto">{prediction.summary_text}</p>
      )}
    </Card>
  )
}
