import type { Analysis } from "./analyses-schemas"
import type { PredictionResponse } from "./schemas"

function formatCurrency(value?: number | null, suffix = ""): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A"
  }
  return `${new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)}${suffix}`
}

function formatPercent(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A"
  }
  return `${(value * 100).toFixed(1)}%`
}

function toTitleCase(value?: string | null): string {
  if (!value) return "N/A"
  return value
    .split(/[_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}

function normalizeFileName(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return slug || "analysis-report"
}

function formatDriverEffect(effect?: number): string {
  if (typeof effect !== "number" || Number.isNaN(effect)) {
    return "N/A"
  }
  const percent = (effect * 100).toFixed(1)
  return `${effect >= 0 ? "+" : ""}${percent}%`
}

const DRIVER_DESCRIPTIONS: Record<string, string> = {
  projected_uplift_pct: "Projected uplift versus purchase",
  market_greix_index: "Local GREIX momentum",
  market_hpi_index: "House price index trend",
  renovation_cost_intensity: "Renovation cost intensity",
}

function formatAssumptions(assumptions: Record<string, any>, horizonYears: number, holdingYears: number): string[] {
  const lines: string[] = []
  const friendly: Record<string, string> = {
    annual_appreciation_rate: "Annual appreciation rate",
    roi_threshold: "ROI threshold",
    supported_cities: "Supported cities",
    mortgage_rate_10y: "10y mortgage rate",
  }
  const skip = new Set(["target", "features", "target_metric"])

  const pushIf = (label: string, val?: string) => {
    if (val) lines.push(`${label}: ${val}`)
  }

  pushIf("Holding period", `${holdingYears.toFixed(1)} years`)
  pushIf("Projection horizon", `${horizonYears} year${horizonYears === 1 ? "" : "s"}`)

  Object.entries(assumptions).forEach(([key, value]) => {
    if (skip.has(key)) return
    const label = friendly[key] ?? toTitleCase(key.replace(/_/g, " "))
    if (typeof value === "number") {
      pushIf(label, key.includes("rate") || key.includes("roi") ? formatPercent(value) : value.toString())
    } else if (Array.isArray(value)) {
      pushIf(label, value.join(", "))
    } else if (typeof value === "string" && value.trim().length > 0) {
      pushIf(label, value)
    }
  })

  return lines.length ? lines : ["No additional assumptions recorded."]
}

export async function generateAnalysisPdf(analysis: Analysis, prediction: PredictionResponse) {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()
  const property = analysis.payload
  const assumptions = prediction.assumptions ?? {}

  const fees = property.fees ?? {}
  const feesTotal =
    (property.price_buy ?? 0) *
      ((fees.grunderwerb_pct ?? 0) / 100 + (fees.notary_pct ?? 0) / 100 + (fees.agent_pct ?? 0) / 100) +
    (fees.other ?? 0)
  const totalInvested = (property.price_buy ?? 0) + (property.reno_cost ?? 0) + feesTotal

  const holdingYears = Math.max(1, (property.holding_months ?? 12) / 12)
  const appreciation =
    (prediction.assumptions as any)?.annual_appreciation_rate ?? property.annual_appreciation_rate ?? 0.015
  const postRenoValue =
    prediction.post_reno_value_today ??
    (prediction.price_post_reno_per_m2 && property.surface_m2 ? prediction.price_post_reno_per_m2 * property.surface_m2 : 0)

  const projectionHorizons = Array.from(new Set([1, 3, 5, 10, Math.round(holdingYears)])).filter((v) => v > 0)
  projectionHorizons.sort((a, b) => a - b)
  const maxProjectionYear = projectionHorizons[projectionHorizons.length - 1] || 1

  const yearlyProjectionLimit = Math.min(12, Math.max(maxProjectionYear, Math.ceil(holdingYears)))
  const projectionTable = Array.from({ length: yearlyProjectionLimit + 1 }, (_, i) => ({
    year: i,
    value: postRenoValue * Math.pow(1 + appreciation, i),
  }))

  const roiScenario = (rate: number) => {
    const future = postRenoValue * Math.pow(1 + rate, maxProjectionYear)
    return totalInvested ? (future - totalInvested) / totalInvested : 0
  }
  const roiScenarios = [
    { label: "Pessimistic", value: roiScenario(appreciation - 0.01) },
    { label: "Base", value: roiScenario(appreciation) },
    { label: "Optimistic", value: roiScenario(appreciation + 0.01) },
  ]

  const drivers =
    prediction.drivers && prediction.drivers.length > 0
      ? prediction.drivers.map((driver) => {
          const desc = DRIVER_DESCRIPTIONS[driver.feature] ?? toTitleCase(driver.feature.replace(/_/g, " "))
          return `${desc}: ${formatDriverEffect(driver.effect)}`
        })
      : ["No driver data provided."]

  const propertyLines = [
    `Location: ${property.city}, ${property.plz}`,
    `Type: ${property.property_type}`,
    `Surface: ${property.surface_m2} sqm`,
    `Rooms: ${property.rooms}`,
    `Year and condition: ${property.year_built ?? "N/A"}, ${toTitleCase(property.condition ?? "")}`,
  ]

  const financialLines = [
    `Purchase price: ${formatCurrency(property.price_buy)}`,
    `Renovation: ${formatCurrency(property.reno_cost)}`,
    `Acquisition fees: ${formatCurrency(feesTotal)}`,
    `Total invested: ${formatCurrency(totalInvested)}`,
    `Holding period: ${holdingYears.toFixed(1)} years`,
    `Expected rent: ${formatCurrency(property.expected_rent_month ?? 0, " / month")}`,
  ]

  const kpiLines = [
    `Decision: ${prediction.decision}`,
    `Confidence level: ${formatPercent(prediction.confidence)}`,
    `Estimated ROI: ${formatPercent(prediction.roi_estimated)}`,
    `Cap rate: ${formatPercent(prediction.cap_rate)}`,
    `Price per sqm (post-reno): ${formatCurrency(prediction.price_post_reno_per_m2)}`,
    `Post-renovation value today: ${formatCurrency(prediction.post_reno_value_today ?? 0)}`,
  ]

  const assumptionLines = formatAssumptions(assumptions as Record<string, any>, maxProjectionYear, holdingYears)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(analysis.title || "Analysis", 14, 16)
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text(`Created ${new Date(analysis.created_at).toLocaleDateString()}`, 14, 22)
  let cursorY = 30

  const ensureSpace = (padding = 0) => {
    if (cursorY + padding > 280) {
      doc.addPage()
      cursorY = 20
    }
  }

  const addWrappedLine = (line: string) => {
    const wrapped = doc.splitTextToSize(line, 180)
    wrapped.forEach((subline) => {
      ensureSpace(6)
      doc.text(subline, 14, cursorY)
      cursorY += 5
    })
  }

  const addSection = (title: string, lines: string[]) => {
    if (!lines.length) return
    ensureSpace(10)
    doc.setFont("helvetica", "bold")
    doc.text(title, 14, cursorY)
    cursorY += 6
    doc.setFont("helvetica", "normal")
    lines.forEach((line) => addWrappedLine(line))
    cursorY += 2
  }

  addSection("Investment decision", kpiLines.slice(0, 3))
  addSection("Key metrics", kpiLines.slice(3))

  const horizonLines = [
    `Holding period: ${holdingYears.toFixed(1)} years`,
    "Extend charts beyond your holding period.",
    `Options: ${projectionHorizons.map((y) => `${y}y`).join(" | ")}`,
  ]
  addSection("Projection horizon", horizonLines)

  const projectionLines = projectionTable.map((p) => `${p.year} yr: ${formatCurrency(p.value)}`)
  addSection("Projected value over holding period", projectionLines)

  addSection("Investment breakdown", financialLines.slice(0, 4))

  const roiLines = roiScenarios.map((s) => `${s.label}: ${formatPercent(s.value)}`)
  addSection("ROI scenarios", roiLines)

  addSection("Key value drivers", drivers)
  addSection("Property details", propertyLines)
  addSection("Financial summary", financialLines)
  addSection("Summary and assumptions", assumptionLines)

  if (analysis.notes) {
    addSection("Notes", [analysis.notes])
  }

  const filename = `${normalizeFileName(analysis.title)}.pdf`
  doc.save(filename)
}
