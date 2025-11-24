import type { PredictionResponse, PropertyPayload, Driver } from "./schemas"

const ROI_THRESHOLD = 0.05
const MIN_CONFIDENCE = 0.2
const MAX_CONFIDENCE = 0.95
const TARGET_METRIC = "price_post_reno_per_m2"
const ROI_MIN = -1
const ROI_MAX = 2
const CAP_RATE_MIN = 0
const CAP_RATE_MAX = 0.5
const DRIVER_EFFECT_MIN = -2
const DRIVER_EFFECT_MAX = 2

export function normalizePrediction(
  payload: PropertyPayload,
  response?: Partial<PredictionResponse>,
): PredictionResponse {
  const predictedPricePerM2 = response?.price_post_reno_per_m2 ?? 0
  const investment = calculateInvestment(payload)
  const rent = payload.expected_rent_month ?? 0
  const holdingYears = Math.max(0, (payload.holding_months ?? 0) / 12)
  const appreciation =
    (response?.assumptions as any)?.annual_appreciation_rate ??
    payload.annual_appreciation_rate ??
    0

  // Respect backend ROI when provided; otherwise compute with appreciation & holding period
  const roiFromBackend = response?.roi_estimated
  const capRateFromBackend = response?.cap_rate

  const postRenoValue = predictedPricePerM2 * payload.surface_m2
  const futureSalePrice =
    postRenoValue * Math.pow(1 + appreciation, holdingYears || 0)

  const roiTotalRaw = investment ? (futureSalePrice - investment) / investment : 0
  const roiAnnualRaw =
    holdingYears > 0 ? Math.pow(1 + roiTotalRaw, 1 / holdingYears) - 1 : roiTotalRaw

  const roi = Number.isFinite(roiFromBackend ?? roiAnnualRaw)
    ? clampValue(roiFromBackend ?? roiAnnualRaw, ROI_MIN, ROI_MAX)
    : 0

  const capRateRaw =
    capRateFromBackend !== undefined
      ? capRateFromBackend
      : investment
        ? (rent * 12) / investment
        : undefined
  const capRate =
    capRateRaw !== undefined && Number.isFinite(capRateRaw)
      ? clampValue(capRateRaw, CAP_RATE_MIN, CAP_RATE_MAX)
      : undefined

  const decision = roi >= ROI_THRESHOLD ? "Buy" : "Don't buy"
  const confidence = clampConfidence(0.55 + roi * 1.5)
  const drivers = buildDrivers(payload, predictedPricePerM2, response?.drivers)
  const assumptions = buildAssumptions(response?.assumptions)

  return {
    ...response,
    decision,
    confidence,
    roi_estimated: roi,
    cap_rate: capRate,
    price_post_reno_per_m2: predictedPricePerM2,
    drivers,
    assumptions,
    warnings: response?.warnings,
    explanations: response?.explanations,
    request_id: response?.request_id ?? generateRequestId(),
    timestamp: response?.timestamp ?? new Date().toISOString(),
  }
}

function calculateInvestment(payload: PropertyPayload): number {
  const { price_buy, reno_cost, fees } = payload
  const pctSum =
    (fees.grunderwerb_pct ?? 0) + (fees.notary_pct ?? 0) + (fees.agent_pct ?? 0)
  const otherFees = fees.other ?? 0
  return price_buy + reno_cost + (price_buy * pctSum) / 100 + otherFees
}

function getPricePerM2(payload: PropertyPayload): number {
  if (payload.price_per_m2) return payload.price_per_m2
  if (payload.surface_m2) {
    return payload.price_buy / payload.surface_m2
  }
  return 0
}

function getRenoCostPerM2(payload: PropertyPayload): number {
  if (payload.reno_cost_per_m2) return payload.reno_cost_per_m2
  if (payload.surface_m2) {
    return payload.reno_cost / payload.surface_m2
  }
  return 0
}

function buildDrivers(
  payload: PropertyPayload,
  predictedPricePerM2: number,
  existing?: Driver[],
): Driver[] {
  if (existing && existing.length > 0) {
    return existing
  }

  const purchasePricePerM2 = getPricePerM2(payload)
  const renoCostPerM2 = getRenoCostPerM2(payload)
  const upliftRatio =
    purchasePricePerM2 > 0 ? (predictedPricePerM2 - purchasePricePerM2) / purchasePricePerM2 : 0

  return [
    { feature: "projected_uplift_pct", effect: clampEffect(upliftRatio) },
    {
      feature: "market_greix_index",
      effect: clampEffect((payload.greix_index ?? 0) / 100),
    },
    {
      feature: "market_hpi_index",
      effect: clampEffect((payload.hpi_index ?? 0) / 100),
    },
    {
      feature: "renovation_cost_intensity",
      effect: clampEffect(purchasePricePerM2 ? -renoCostPerM2 / (purchasePricePerM2 || 1) : 0),
    },
  ]
}

function buildAssumptions(existing?: Record<string, string>): Record<string, string> {
  const assumptions: Record<string, string> = {}

  if (existing) {
    Object.entries(existing).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        assumptions[key] = value
      }
    })
  }

  assumptions["roi_threshold"] = `${(ROI_THRESHOLD * 100).toFixed(1)}%`
  assumptions["target_metric"] = TARGET_METRIC

  return assumptions
}

function clampConfidence(value: number): number {
  if (value < MIN_CONFIDENCE) return MIN_CONFIDENCE
  if (value > MAX_CONFIDENCE) return MAX_CONFIDENCE
  return Number(value.toFixed(4))
}

function clampEffect(value: number): number {
  return clampValue(value, DRIVER_EFFECT_MIN, DRIVER_EFFECT_MAX)
}

function clampValue(value: number, min: number, max: number): number {
  if (value < min) return Number(min.toFixed(4))
  if (value > max) return Number(max.toFixed(4))
  return Number(value.toFixed(4))
}

function generateRequestId(): string {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  }
  return Math.random().toString(36).slice(2)
}
