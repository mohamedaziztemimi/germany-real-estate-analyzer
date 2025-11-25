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

  const horizonYears = Math.max(1, Math.round((property.holding_months ?? 12) / 12))
  const appreciation = (prediction.assumptions as any)?.annual_appreciation_rate ?? property.annual_appreciation_rate ?? 0.015
  const postRenoValue =
    prediction.post_reno_value_today ??
    (prediction.price_post_reno_per_m2 && property.surface_m2 ? prediction.price_post_reno_per_m2 * property.surface_m2 : 0)
  const projections = Array.from({ length: horizonYears + 1 }, (_, i) => ({
    year: i,
    value: postRenoValue * Math.pow(1 + appreciation, i),
  }))

  const roiScenario = (rate: number) => {
    const future = postRenoValue * Math.pow(1 + rate, horizonYears)
    return totalInvested ? (future - totalInvested) / totalInvested : 0
  }
  const roiScenarios = [
    { label: "Pessimistic", value: roiScenario(appreciation - 0.01) },
    { label: "Base", value: roiScenario(appreciation) },
    { label: "Optimistic", value: roiScenario(appreciation + 0.01) },
  ]

  const driverLines =
    prediction.drivers && prediction.drivers.length > 0
      ? prediction.drivers.map((driver) => {
          const desc = DRIVER_DESCRIPTIONS[driver.feature] ?? toTitleCase(driver.feature)
          return `${desc}: ${formatDriverEffect(driver.effect)}`
        })
      : ["No driver data provided."]

  const propertyLines = [
    `Location: ${property.city}, ${property.plz}`,
    `Type: ${property.property_type}`,
    `Surface: ${property.surface_m2} m²`,
    `Rooms: ${property.rooms}`,
    `Year and condition: ${property.year_built ?? "N/A"}, ${toTitleCase(property.condition ?? "")}`,
  ]

  const financialLines = [
    `Purchase price: ${formatCurrency(property.price_buy)}`,
    `Renovation: ${formatCurrency(property.reno_cost)}`,
    `Acquisition fees: ${formatCurrency(feesTotal)}`,
    `Total invested: ${formatCurrency(totalInvested)}`,
    `Holding period: ${property.holding_months} months`,
    `Expected rent: ${formatCurrency(property.expected_rent_month ?? 0, " / month")}`,
  ]

  const modelLines = [
    `Investment decision: ${prediction.decision}`,
    `Confidence level: ${formatPercent(prediction.confidence)}`,
    `Estimated ROI: ${formatPercent(prediction.roi_estimated)}`,
    `Cap rate: ${formatPercent(prediction.cap_rate)}`,
    `Price per m² (post-reno): ${formatCurrency(prediction.price_post_reno_per_m2)}`,
    `Post-renovation value today: ${formatCurrency(prediction.post_reno_value_today ?? 0)}`,
  ]

  const assumptionLines =
    Object.keys(assumptions).length > 0
      ? Object.entries(assumptions).map(([key, value]) => `${toTitleCase(key)}: ${value}`)
      : ["No additional assumptions recorded."]

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(analysis.title || "Analysis", 14, 18)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`Created ${new Date(analysis.created_at).toLocaleDateString()}`, 14, 24)
  let cursorY = 32

  const addSection = (title: string, lines: string[]) => {
    if (!lines.length) return
    ensureSpace(8)
    doc.setFont("helvetica", "bold")
    doc.text(title, 14, cursorY)
    cursorY += 6
    doc.setFont("helvetica", "normal")
    lines.forEach((line) => addWrappedLine(line))
    cursorY += 2
  }

  const addWrappedLine = (line: string) => {
    const wrapped = doc.splitTextToSize(line, 180)
    wrapped.forEach((subline) => {
      ensureSpace(6)
      doc.text(subline, 14, cursorY)
      cursorY += 5
    })
  }

  const ensureSpace = (padding = 0) => {
    if (cursorY + padding > 280) {
      doc.addPage()
      cursorY = 20
    }
  }

  addSection("Investment decision", [modelLines[0]])
  addSection("Key metrics", modelLines.slice(1))

  const projectionLines = projections.map((p) => `${p.year} yr: ${formatCurrency(p.value)}`)
  addSection("Projection horizon", [`Holding: ${horizonYears} yr`, "Extend charts beyond your holding period.", "1y | 3y | 5y | 10y"])
  addSection("Projected value over holding period", projectionLines)

  const breakdown = [
    `Purchase price: ${formatCurrency(property.price_buy)}`,
    `Renovation: ${formatCurrency(property.reno_cost)}`,
    `Acquisition fees: ${formatCurrency(feesTotal)}`,
    `Total invested: ${formatCurrency(totalInvested)}`,
  ]
  addSection("Investment breakdown", breakdown)

  const roiLines = roiScenarios.map((s) => `${s.label}: ${formatPercent(s.value)}`)
  addSection("ROI scenarios", roiLines)

  addSection("Key value drivers", driverLines)
  addSection("Summary and assumptions", assumptionLines)
  addSection("Property details", propertyLines)
  addSection("Financial summary", financialLines)
  if (analysis.notes) {
    addSection("Notes", [analysis.notes])
  }

  const filename = `${normalizeFileName(analysis.title)}.pdf`
  doc.save(filename)
}
