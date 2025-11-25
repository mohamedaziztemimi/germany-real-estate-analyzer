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

  const driverLines =
    prediction.drivers && prediction.drivers.length > 0
      ? prediction.drivers.map((driver) => `${toTitleCase(driver.feature)}: ${formatDriverEffect(driver.effect)}`)
      : ["No driver data provided."]

  const propertyLines = [
    `Location: ${property.city}, ${property.plz} (${property.property_type})`,
    `Size and layout: ${property.surface_m2} m2, ${property.rooms} rooms`,
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
    `Decision: ${prediction.decision}`,
    `Confidence: ${formatPercent(prediction.confidence)}`,
    `Estimated ROI: ${formatPercent(prediction.roi_estimated)}`,
    `Cap rate: ${formatPercent(prediction.cap_rate)}`,
    `Post-renovation price per m2: ${formatCurrency(prediction.price_post_reno_per_m2)}`,
    `Post-renovation value: ${formatCurrency(prediction.post_reno_value_today ?? 0)}`,
  ]

  const assumptionLines =
    Object.keys(assumptions).length > 0
      ? Object.entries(assumptions).map(([key, value]) => `${toTitleCase(key)}: ${value}`)
      : ["No additional assumptions recorded."]

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text("Investment Analysis Summary", 14, 18)
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  let cursorY = 28

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

  addSection("Property overview", propertyLines)
  addSection("Financials", financialLines)
  addSection("Model highlights", modelLines)
  addSection("Drivers", driverLines)
  addSection("Assumptions", assumptionLines)
  if (analysis.notes) {
    addSection("Notes", [analysis.notes])
  }

  const filename = `${normalizeFileName(analysis.title)}.pdf`
  doc.save(filename)
}
