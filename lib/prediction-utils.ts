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
const DEFAULT_PURCHASE_COSTS_RATE = 0.1
const DEFAULT_OPERATING_COST_RATE = 0.22
const DEFAULT_RENT_GROWTH = 0.02

export function normalizePrediction(
  payload: PropertyPayload,
  response?: Partial<PredictionResponse>,
): PredictionResponse {
  const predictedPricePerM2 =
    response?.price_post_reno_per_m2 ?? response?.predicted_price_post_reno_per_m2 ?? 0

  const purchasePrice = payload.purchase_price ?? payload.price_buy ?? 0
  const purchaseCostsRate = payload.purchase_costs_rate ?? DEFAULT_PURCHASE_COSTS_RATE
  const capexOneTime = payload.capex_one_time ?? payload.reno_cost ?? 0
  const totalInitialInvestment = purchasePrice + purchasePrice * purchaseCostsRate + capexOneTime

  const holdingYears = Math.max(
    1,
    (payload.holding_years ?? (payload.holding_months ?? 0) / 12) || 1,
  )
  const appreciation =
    (response?.assumptions as any)?.annual_appreciation_rate ?? payload.annual_appreciation_rate ?? 0.015

  const marketRentPa = payload.market_rent_pa ?? (payload.expected_rent_month ?? 0) * 12
  const operatingCostRate = payload.operating_cost_rate ?? DEFAULT_OPERATING_COST_RATE
  const rentGrowthRate = payload.rent_growth_rate ?? DEFAULT_RENT_GROWTH
  const capexPerYear = payload.capex_per_year ?? 0
  const { cashflows, total: totalCashflow, netRentYear1 } = calculateCashflows(
    marketRentPa,
    operatingCostRate,
    capexPerYear,
    rentGrowthRate,
    holdingYears,
    response?.cashflow_per_year,
  )

  const postRenoValue = predictedPricePerM2 * (payload.surface_m2 ?? 0)
  const futureSalePrice =
    response?.future_sale_price ?? postRenoValue * Math.pow(1 + appreciation, holdingYears)

  const roiTotalRaw = totalInitialInvestment
    ? (futureSalePrice + totalCashflow - totalInitialInvestment) / totalInitialInvestment
    : 0
  const roiTotal = response?.roi_total ?? roiTotalRaw
  const annualRoi = clampValue(
    response?.annual_roi ?? response?.roi_estimated ?? (holdingYears > 0 ? (1 + roiTotal) ** (1 / holdingYears) - 1 : roiTotal),
    ROI_MIN,
    ROI_MAX,
  )

  const capRateRaw =
    response?.cap_rate ?? (totalInitialInvestment ? netRentYear1 / totalInitialInvestment : undefined)
  const capRate =
    capRateRaw !== undefined && Number.isFinite(capRateRaw)
      ? clampValue(capRateRaw, CAP_RATE_MIN, CAP_RATE_MAX)
      : undefined

  const vacancyScore = response?.vacancy_risk_score ?? payload.vacancy_risk_score
  const locationScores =
    response?.location_scores ??
    ({
      macro: payload.macro_location_score,
      micro: payload.micro_location_score,
    } as any)

  const marketPricePerM2 = payload.market_price_per_m2 ?? getPricePerM2(payload)
  const renovationUplift =
    response?.renovation_uplift ?? (marketPricePerM2 ? predictedPricePerM2 / marketPricePerM2 - 1 : undefined)

  const loanAmount = Math.max(
    0,
    purchasePrice - (payload.equity ?? purchasePrice * Math.max(0, 1 - (payload.financing?.ltv ?? 0.75))),
  )
  const interestRate = payload.interest_rate ?? payload.mortgage_rate_10y ?? 0
  const principalRate = payload.principal_rate ?? 0.02
  const financingImpact =
    response?.financing_impact ??
    ({ interest_cost_pa: loanAmount * interestRate, principal_paydown_pa: loanAmount * principalRate } as any)

  const decision = response?.decision ?? (annualRoi >= ROI_THRESHOLD ? "Buy" : "Don't buy")
  const confidence = clampConfidence(
    response?.confidence ?? 0.55 + annualRoi * 1.3 + ((locationScores?.macro ?? 3) - 3) * 0.05 -
      (vacancyScore ? Math.max(0, 3 - vacancyScore) * 0.03 : 0),
  )

  const drivers = buildDrivers(payload, predictedPricePerM2, response?.drivers, vacancyScore, locationScores)
  const assumptions = buildAssumptions(response?.assumptions, {
    annual_appreciation_rate: appreciation,
    holding_years: holdingYears,
    purchase_costs_rate: purchaseCostsRate,
    operating_cost_rate: operatingCostRate,
    rent_growth_rate: rentGrowthRate,
  })

  return {
    ...response,
    decision,
    confidence,
    roi_estimated: annualRoi,
    roi_total: roiTotal,
    annual_roi: annualRoi,
    cap_rate: capRate,
    price_post_reno_per_m2: predictedPricePerM2,
    predicted_price_post_reno_per_m2: predictedPricePerM2,
    post_reno_value_today: response?.post_reno_value_today ?? postRenoValue,
    future_sale_price: futureSalePrice,
    total_initial_investment: totalInitialInvestment,
    cashflow_per_year: cashflows,
    vacancy_risk_score: vacancyScore,
    location_scores: locationScores,
    renovation_uplift: renovationUplift,
    financing_impact: financingImpact,
    summary_text:
      response?.summary_text ??
      buildSummaryText({
        annualRoi,
        roiTotal,
        futureSalePrice,
        totalCashflow,
        vacancyScore,
        macroScore: locationScores?.macro,
        microScore: locationScores?.micro,
      }),
    drivers,
    assumptions,
    warnings: response?.warnings,
    explanations: response?.explanations,
    request_id: response?.request_id ?? generateRequestId(),
    timestamp: response?.timestamp ?? new Date().toISOString(),
  }
}

function calculateCashflows(
  marketRentPa: number,
  operatingCostRate: number,
  capexPerYear: number,
  rentGrowthRate: number,
  holdingYears: number,
  provided?: number[],
) {
  if (provided && provided.length > 0) {
    const total = provided.reduce((sum, v) => sum + (Number.isFinite(v) ? Number(v) : 0), 0)
    return { cashflows: provided, total, netRentYear1: marketRentPa * (1 - operatingCostRate) }
  }
  const years = Math.max(1, Math.round(Math.ceil(holdingYears || 1)))
  const netRentYear1 = marketRentPa * (1 - operatingCostRate)
  const cashflows: number[] = []
  let total = 0
  for (let t = 0; t < years; t += 1) {
    const rentT = netRentYear1 * Math.pow(1 + rentGrowthRate, t)
    const cf = rentT - capexPerYear
    cashflows.push(Number(cf.toFixed(2)))
    total += cf
  }
  return { cashflows, total, netRentYear1 }
}

function getPricePerM2(payload: PropertyPayload): number {
  if (payload.price_per_m2) return payload.price_per_m2
  if (payload.surface_m2) {
    return (payload.purchase_price ?? payload.price_buy ?? 0) / payload.surface_m2
  }
  return 0
}

function getRenoCostPerM2(payload: PropertyPayload): number {
  if (payload.reno_cost_per_m2) return payload.reno_cost_per_m2
  if (payload.surface_m2) {
    return (payload.capex_one_time ?? payload.reno_cost ?? 0) / payload.surface_m2
  }
  return 0
}

function buildDrivers(
  payload: PropertyPayload,
  predictedPricePerM2: number,
  existing?: Driver[],
  vacancyScore?: number | null,
  locationScores?: { macro?: number | null; micro?: number | null },
): Driver[] {
  if (existing && existing.length > 0) {
    return existing
  }

  const purchasePricePerM2 = getPricePerM2(payload)
  const renoCostPerM2 = getRenoCostPerM2(payload)
  const upliftRatio =
    purchasePricePerM2 > 0 ? (predictedPricePerM2 - purchasePricePerM2) / purchasePricePerM2 : 0

  const drivers: Driver[] = [
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

  if (typeof vacancyScore === "number") {
    drivers.push({ feature: "vacancy_risk_score", effect: clampEffect((vacancyScore - 3) / 5) })
  }
  if (locationScores?.macro !== undefined) {
    drivers.push({ feature: "macro_location_score", effect: clampEffect(((locationScores.macro ?? 3) - 3) / 5) })
  }
  if (locationScores?.micro !== undefined) {
    drivers.push({ feature: "micro_location_score", effect: clampEffect(((locationScores.micro ?? 3) - 3) / 5) })
  }

  return drivers
}

function buildAssumptions(
  existing?: Record<string, any>,
  extras?: Record<string, any>,
): Record<string, any> {
  const assumptions: Record<string, any> = {}

  if (existing) {
    Object.entries(existing).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        assumptions[key] = value
      }
    })
  }

  if (extras) {
    Object.entries(extras).forEach(([key, value]) => {
      assumptions[key] = value
    })
  }

  assumptions["roi_threshold"] = `${(ROI_THRESHOLD * 100).toFixed(1)}%`
  assumptions["target_metric"] = TARGET_METRIC

  return assumptions
}

function buildSummaryText(params: {
  annualRoi: number
  roiTotal: number
  futureSalePrice: number
  totalCashflow: number
  vacancyScore?: number | null
  macroScore?: number | null
  microScore?: number | null
}) {
  const { annualRoi, roiTotal, futureSalePrice, totalCashflow, vacancyScore, macroScore, microScore } = params
  const vacancy =
    vacancyScore !== undefined && vacancyScore !== null ? ` Vacancy risk score ${vacancyScore.toFixed(1)}/5.` : ""
  const location =
    macroScore !== undefined || microScore !== undefined
      ? ` Location: macro ${(macroScore ?? 0).toFixed(1)}/5, micro ${(microScore ?? 0).toFixed(1)}/5.`
      : ""
  const saleText = `Expected sale value about EUR ${Math.round(futureSalePrice).toLocaleString("de-DE")}`
  const cashflowText = `Cumulative cashflow around EUR ${Math.round(totalCashflow).toLocaleString("de-DE")}`
  return `Annual ROI ${(annualRoi * 100).toFixed(1)}% and total ROI ${(roiTotal * 100).toFixed(1)}%. ${saleText}, ${cashflowText}.${vacancy}${location}`
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
