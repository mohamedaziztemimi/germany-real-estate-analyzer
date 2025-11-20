import type { PropertyPayload } from "./schemas"

export type RenovationLevel = "light" | "standard" | "full"

interface MarketSnapshot {
  greix_index: number
  hpi_index: number
  mortgage_rate_10y: number
  listing_year: number
  listing_quarter: number
}

const CITY_MARKET_DEFAULTS: Record<string, MarketSnapshot> = {
  berlin: { greix_index: 188, hpi_index: 162, mortgage_rate_10y: 0.0335, listing_year: 2024, listing_quarter: 4 },
  dusseldorf: { greix_index: 176, hpi_index: 150, mortgage_rate_10y: 0.034, listing_year: 2024, listing_quarter: 3 },
  munchen: { greix_index: 212, hpi_index: 180, mortgage_rate_10y: 0.032, listing_year: 2024, listing_quarter: 4 },
  hamburg: { greix_index: 184, hpi_index: 158, mortgage_rate_10y: 0.033, listing_year: 2024, listing_quarter: 3 },
  stuttgart: { greix_index: 190, hpi_index: 165, mortgage_rate_10y: 0.033, listing_year: 2024, listing_quarter: 2 },
  leipzig: { greix_index: 165, hpi_index: 140, mortgage_rate_10y: 0.0345, listing_year: 2024, listing_quarter: 3 },
}

const DEFAULT_MARKET_SNAPSHOT: MarketSnapshot = {
  greix_index: 172,
  hpi_index: 148,
  mortgage_rate_10y: 0.035,
  listing_year: new Date().getFullYear(),
  listing_quarter: Math.min(4, Math.max(1, Math.ceil((new Date().getMonth() + 1) / 3))),
}

const BASE_RENO_COST_PER_M2: Record<RenovationLevel, number> = {
  light: 180,
  standard: 320,
  full: 520,
}

const CONDITION_MULTIPLIER: Record<NonNullable<PropertyPayload["condition"]>, number> = {
  poor: 1.4,
  average: 1,
  good: 0.65,
  renovated: 0.25,
}

export function getMarketDefaults(city?: string | null): MarketSnapshot {
  const normalized = normalizeCity(city)
  return CITY_MARKET_DEFAULTS[normalized] ?? DEFAULT_MARKET_SNAPSHOT
}

export function estimateRenovationBudget(params: {
  surface_m2: number
  condition?: PropertyPayload["condition"] | null
  price_buy: number
  price_per_m2?: number
  renovationLevel: RenovationLevel
}) {
  const { surface_m2, condition, price_buy, price_per_m2, renovationLevel } = params
  const pricePerM2 = price_per_m2 && Number.isFinite(price_per_m2) && price_per_m2 > 0 ? price_per_m2 : price_buy / surface_m2
  const base = BASE_RENO_COST_PER_M2[renovationLevel]
  const multiplier = condition && CONDITION_MULTIPLIER[condition] ? CONDITION_MULTIPLIER[condition] : CONDITION_MULTIPLIER.average
  const renoCostPerM2 = base * multiplier
  const reno_cost = surface_m2 ? Math.round(renoCostPerM2 * surface_m2) : 0
  const uplift_pct = pricePerM2 > 0 ? (renoCostPerM2 / pricePerM2) * 100 : 0
  return {
    reno_cost,
    reno_cost_per_m2: renoCostPerM2,
    uplift_pct,
  }
}

function normalizeCity(city?: string | null) {
  if (!city) return ""
  return city
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}
