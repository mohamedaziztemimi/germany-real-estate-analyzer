import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import type { PredictionResponse, PropertyPayload } from "@/lib/schemas"

interface AssumptionsPanelProps {
  assumptions?: Record<string, any>
  prediction?: PredictionResponse | null
  payload?: PropertyPayload | null
}

const currencyFormatter = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
const currencyFormatterPrecise = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-"
  return `${(value * 100).toFixed(1)}%`
}

export function AssumptionsPanel({ assumptions, prediction, payload }: AssumptionsPanelProps) {
  const { language, strings } = useLanguage()
  if (!prediction) return null

  const annualRoi = prediction.annual_roi ?? prediction.roi_estimated ?? 0
  const totalRoi = prediction.roi_total ?? annualRoi
  const futureSale = prediction.future_sale_price ?? null
  const cashflows = prediction.cashflow_per_year ?? []
  const cashflowMax = Math.max(...cashflows.map((v) => Math.abs(v)), 1)
  const financing = prediction.financing_impact
  const vacancy = prediction.vacancy_risk_score ?? payload?.vacancy_risk_score ?? (assumptions as any)?.vacancy_risk_score
  const macro = prediction.location_scores?.macro ?? payload?.macro_location_score
  const micro = prediction.location_scores?.micro ?? payload?.micro_location_score
  const uplift = prediction.renovation_uplift ?? payload?.uplift_pct

  const cashflowBars = cashflows.length ? cashflows : [0]

  const aiExplainer =
    language === "de"
      ? "Die Prognose kombiniert den modellierten Sanierungswert pro m2, erwartete Mietsteigerungen, marktuebliche Betriebskosten sowie GREIX/HPI-Impulse. Finanzierungskosten und Eigenkapitalquote liefern den Hebeleffekt."
      : "The model blends post-renovation value per m2, expected rent growth, operating costs, and GREIX/HPI momentum. Financing costs and equity share drive leverage effects, while renovation uplift shapes upside."

  return (
    <Card className="p-6 bg-slate-50 border-slate-200 space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{strings.returnProfileTitle}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{formatPercent(annualRoi)}</p>
          <p className="text-sm text-slate-600">{strings.annualROI}</p>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
            <span>{strings.totalROI}</span>
            <span className="font-semibold">{formatPercent(totalRoi)}</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{strings.exitAndUpliftTitle}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{futureSale ? currencyFormatter.format(futureSale) : "-"}</p>
          <p className="text-sm text-slate-600">{strings.projectedSaleValue}</p>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
            <span>{strings.renovationUplift}</span>
            <span className="font-semibold">{uplift !== undefined ? formatPercent(uplift) : "-"}</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{strings.riskLocationTitle}</p>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
            <span>{strings.vacancyRisk}</span>
            <span className="font-semibold">{vacancy ? `${vacancy.toFixed(1)}/5` : "-"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
            <span>{strings.macroScore}</span>
            <span className="font-semibold">{macro ? `${macro.toFixed(1)}/5` : "-"}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-slate-700">
            <span>{strings.microScore}</span>
            <span className="font-semibold">{micro ? `${micro.toFixed(1)}/5` : "-"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">{strings.cashflowByYear}</p>
            <span className="text-xs text-slate-500">{strings.cashflowSubtitle}</span>
          </div>
          <div className="mt-3 space-y-2">
            {cashflowBars.map((value, idx) => {
              const width = Math.min(100, (Math.abs(value) / cashflowMax) * 100)
              const positive = value >= 0
              return (
                <div key={`cf-${idx}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{strings.yearLabel.replace("{year}", String(idx + 1))}</span>
                    <span className={positive ? "text-emerald-600" : "text-rose-600"}>
                      {currencyFormatterPrecise.format(value)}
                    </span>
                  </div>
                  <div className="h-2 rounded bg-slate-100">
                    <div
                      className={`h-2 rounded ${positive ? "bg-emerald-500" : "bg-rose-500"}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">{strings.leverageImpact}</p>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
              <span>{strings.interestPerYear}</span>
              <span className="font-semibold">{financing ? currencyFormatter.format(financing.interest_cost_pa) : "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>{strings.principalPerYear}</span>
              <span className="font-semibold">
                {financing ? currencyFormatter.format(financing.principal_paydown_pa) : "-"}
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed">
            {aiExplainer}
          </div>
        </div>
      </div>
    </Card>
  )
}
