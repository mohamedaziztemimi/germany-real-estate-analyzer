import { Card } from "@/components/ui/card"
import type { PredictionResponse } from "@/lib/schemas"

interface KpiTilesProps {
  prediction: PredictionResponse
}

export function KpiTiles({ prediction }: KpiTilesProps) {
  const kpis = [
    {
      label: "Estimated ROI",
      value: `${(prediction.roi_estimated * 100).toFixed(2)}%`,
    },
    {
      label: "Cap Rate",
      value: prediction.cap_rate ? `${(prediction.cap_rate * 100).toFixed(2)}%` : "N/A",
    },
    {
      label: "Price per m² (post-reno)",
      value: prediction.price_post_reno_per_m2
        ? `€${prediction.price_post_reno_per_m2.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`
        : "N/A",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="p-6">
          <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{kpi.value}</p>
        </Card>
      ))}
    </div>
  )
}
