import { Card } from "@/components/ui/card"
import type { Driver } from "@/lib/schemas"

interface DriversListProps {
  drivers: Driver[]
}

const driverMeta: Record<string, { label: string; detail: string }> = {
  projected_uplift_pct: {
    label: "Projected uplift versus purchase",
    detail: "How much more the unit could be worth after renovation compared with today.",
  },
  market_greix_index: {
    label: "Local GREIX momentum",
    detail: "Captures the momentum of real-estate prices in the area.",
  },
  market_hpi_index: {
    label: "House price index trend",
    detail: "National/regional HPI contribution to the valuation.",
  },
  renovation_cost_intensity: {
    label: "Renovation cost intensity",
    detail: "Impact of works budget per square metre on overall returns.",
  },
}

const percentFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "always",
})

function formatLabel(key: string) {
  const meta = driverMeta[key]
  if (meta) return meta.label
  return key
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ")
}

function formatDetail(key: string) {
  return driverMeta[key]?.detail
}

export function DriversList({ drivers }: DriversListProps) {
  const sorted = [...drivers].sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect))

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Key Value Drivers</h3>
      <div className="space-y-3">
        {sorted.map((driver, idx) => (
          <div key={`${driver.feature}-${idx}`} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{formatLabel(driver.feature)}</p>
                {formatDetail(driver.feature) && (
                  <p className="text-sm text-slate-500">{formatDetail(driver.feature)}</p>
                )}
              </div>
              <span
                className={`text-base font-semibold ${driver.effect >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {percentFormatter.format(driver.effect * 100)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
