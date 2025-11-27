import { Card } from "@/components/ui/card"
import type { PredictionResponse } from "@/lib/schemas"
import { useLanguage } from "@/lib/language-context"
import { CountUp } from "@/components/CountUp"

interface KpiTilesProps {
  prediction: PredictionResponse
}

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

export function KpiTiles({ prediction }: KpiTilesProps) {
  const { strings } = useLanguage()

  const kpis = [
    {
      label: strings.annualROI ?? "Annual ROI",
      value: (prediction.annual_roi ?? prediction.roi_estimated) * 100,
      format: (val: number) => `${val.toFixed(1)}%`,
      detail: strings.kpiRoiDetail,
    },
    {
      label: strings.totalROI ?? "Total ROI",
      value: prediction.roi_total !== undefined && prediction.roi_total !== null ? prediction.roi_total * 100 : null,
      format: (val: number) => `${val.toFixed(1)}%`,
      detail: strings.kpiTotalRoiDetail ?? strings.kpiCapDetail,
    },
    {
      label: strings.futureSalePrice ?? "Future sale price",
      value: prediction.future_sale_price ?? null,
      format: (val: number) => euroFormatter.format(val),
      detail: strings.kpiPriceDetail,
    },
    {
      label: strings.cashflowYearOne ?? "Year 1 cashflow",
      value: prediction.cashflow_per_year?.[0] ?? null,
      format: (val: number) => euroFormatter.format(val),
      detail: strings.kpiCashflowDetail ?? "",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
          <p className="mt-3 text-4xl font-semibold text-slate-900">
            {kpi.value === null ? strings.capRateNA : <CountUp value={kpi.value} decimals={1} formatter={kpi.format} />}
          </p>
          {kpi.detail && <p className="mt-2 text-sm text-slate-500">{kpi.detail}</p>}
        </Card>
      ))}
    </div>
  )
}
