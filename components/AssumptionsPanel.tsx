import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"

interface AssumptionsPanelProps {
  assumptions?: Record<string, any>
  prediction?: {
    price_post_reno_per_m2?: number | null
    post_reno_value_today?: number | null
    future_sale_price?: number | null
    roi_total?: number | null
    roi_estimated?: number | null
  }
  payload?: {
    price_buy?: number
    reno_cost?: number
    fees?: { other?: number | null }
  }
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return `${(value * 100).toFixed(1)}%`
}

export function AssumptionsPanel({ assumptions, prediction, payload }: AssumptionsPanelProps) {
  const { language, strings } = useLanguage()
  const postReno = prediction?.post_reno_value_today ?? null
  const futureSale = prediction?.future_sale_price ?? null
  const roiTotal = prediction?.roi_total ?? prediction?.roi_estimated ?? null
  const totalCost =
    (payload?.price_buy ?? 0) +
    (payload?.reno_cost ?? 0) +
    (payload?.fees?.other ?? 0) +
    // the backend already folded purchase fees into the ROI calc; show base investment as reference only
    0

  if (!assumptions && !prediction) {
    return null
  }

  const formatSentence = (template: string) =>
    template
      .replace("{postReno}", formatCurrency(postReno))
      .replace("{futureSale}", formatCurrency(futureSale))
      .replace("{totalCost}", formatCurrency(totalCost))
      .replace("{roiTotal}", formatPercent(roiTotal))

  const t = translations[language]

  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <h3 className="mb-3 text-lg font-semibold">{strings.summaryTitle}</h3>
      <p className="text-sm text-slate-800 leading-relaxed space-y-2">
        <span className="block">
          {formatSentence(t.summaryPara1)}
        </span>
        <span className="block">
          {formatSentence(t.summaryPara2)}
        </span>
        <span className="block">
          {t.summaryPara3}
        </span>
      </p>
    </Card>
  )
}
