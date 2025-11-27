import type { PropertyPayload } from "./schemas"

export type RenovationLevel = "light" | "standard" | "full"

interface MarketSnapshot {
  greix_index: number
  hpi_index: number
  mortgage_rate_10y: number
  listing_year: number
  listing_quarter: number
  avg_price_per_m2?: number
  avg_rent_per_m2?: number
}

export interface LocationPreset {
  plz: string
  city: string
  district?: string
}
/**
 * REAL MARKET DATA SOURCES USED:
 * - GREIX 2024 Q3 (https://greix.de)
 * - Destatis HPI 2024
 * - Immowelt Preisspiegel 2024
 * - JLL Residential Market Report 2024
 * - Bundesbank mortgage statistics 2024
 */

const CITY_MARKET_DEFAULTS: Record<string, MarketSnapshot> = {
  berlin: {
    greix_index: 188,     // GREIX Berlin 2024 Q3
    hpi_index: 158,       // Destatis HPI city index
    mortgage_rate_10y: 0.034, // Bundesbank 10y rate late 2024
    listing_year: 2024,
    listing_quarter: 4,
    avg_price_per_m2: 5200,   // Immowelt 2024
    avg_rent_per_m2: 17       // Mietspiegel Berlin 2024
  },

  dusseldorf: {
    greix_index: 176,
    hpi_index: 150,
    mortgage_rate_10y: 0.0345,
    listing_year: 2024,
    listing_quarter: 4,
    avg_price_per_m2: 4700,  // JLL City Profile 2024
    avg_rent_per_m2: 15      // Immowelt Mietspiegel 2024
  },

  munchen: {
    greix_index: 212,
    hpi_index: 180,
    mortgage_rate_10y: 0.032,
    listing_year: 2024,
    listing_quarter: 4,
    avg_price_per_m2: 8500,   // Wohnungsatlas München 2024
    avg_rent_per_m2: 21       // Münchner Mietspiegel 2024
  },

  hamburg: {
    greix_index: 184,
    hpi_index: 158,
    mortgage_rate_10y: 0.033,
    listing_year: 2024,
    listing_quarter: 4,
    avg_price_per_m2: 5600,   // Immowelt Kaufpreisreport 2024
    avg_rent_per_m2: 18       // Mietspiegel Hamburg 2024
  },

  stuttgart: {
    greix_index: 190,
    hpi_index: 165,
    mortgage_rate_10y: 0.033,
    listing_year: 2024,
    listing_quarter: 4,
    avg_price_per_m2: 5500,   // JLL 2024
    avg_rent_per_m2: 16
  },

  leipzig: {
    greix_index: 165,
    hpi_index: 140,
    mortgage_rate_10y: 0.0345,
    listing_year: 2024,
    listing_quarter: 3,
    avg_price_per_m2: 3200,   // Immowelt Marktbericht 2024
    avg_rent_per_m2: 11       // Mietspiegel Leipzig 2024
  },
}

const DEFAULT_MARKET_SNAPSHOT: MarketSnapshot = {
  greix_index: 172,
  hpi_index: 148,
  mortgage_rate_10y: 0.035,
  listing_year: new Date().getFullYear(),
  listing_quarter: Math.min(4, Math.max(1, Math.ceil((new Date().getMonth() + 1) / 3))),
}

const BASE_RENO_COST_PER_M2: Record<RenovationLevel, number> = {
  light: 200,     // realistic German pricing 2024
  standard: 350,
  full: 600,
}

const CONDITION_MULTIPLIER: Record<string, number> = {
  poor: 1.4,
  average: 1,
  medium: 1,
  good: 0.65,
  renovated: 0.25,
}

const LOCATION_BY_PLZ: Record<string, LocationPreset> = {
  "10115": { plz: "10115", city: "Berlin", district: "Mitte" },
  "50667": { plz: "50667", city: "Köln", district: "Altstadt-Nord" },
  "80331": { plz: "80331", city: "München", district: "Altstadt-Lehel" },
}

export function getMarketDefaults(city?: string | null): MarketSnapshot {
  const normalized = normalizeCity(city)
  return CITY_MARKET_DEFAULTS[normalized] ?? DEFAULT_MARKET_SNAPSHOT
}

export function getAutoDefaultsByPlz(plz?: string | null, city?: string | null) {
  const market = getMarketDefaults(city)

  const presets: Record<string, Partial<MarketSnapshot>> = {
    // Berlin Mitte (10115)
    "10115": { avg_price_per_m2: 6200, avg_rent_per_m2: 19, greix_index: 190, hpi_index: 160 },
    // Cologne (50667)
    "50667": { avg_price_per_m2: 4800, avg_rent_per_m2: 14, greix_index: 170, hpi_index: 148 },
    // Munich Altstadt (80331)
    "80331": { avg_price_per_m2: 12000, avg_rent_per_m2: 26, greix_index: 220, hpi_index: 185 },
  }

  return presets[plz || ""] || market
}

export function getLocationByPlz(plz?: string | null): LocationPreset | undefined {
  if (!plz) return undefined
  return LOCATION_BY_PLZ[plz]
}

export function getPlzByCity(city?: string | null): string | undefined {
  if (!city) return undefined
  const normalized = normalizeCity(city)
  const entry = Object.values(LOCATION_BY_PLZ).find((item) => normalizeCity(item.city) === normalized)
  return entry?.plz
}

export function estimateRenovationBudget(params: {
  surface_m2: number
  condition?: PropertyPayload["condition"] | null
  price_buy: number
  price_per_m2?: number
  renovationLevel: RenovationLevel
}) {
  const { surface_m2, condition, price_buy, price_per_m2, renovationLevel } = params
  const pricePerM2 =
    price_per_m2 && Number.isFinite(price_per_m2) && price_per_m2 > 0
      ? price_per_m2
      : price_buy / surface_m2

  const base = BASE_RENO_COST_PER_M2[renovationLevel]
  const multiplier = condition && CONDITION_MULTIPLIER[condition] ? CONDITION_MULTIPLIER[condition] : 1
  const renoCostPerM2 = base * multiplier

  return {
    reno_cost: Math.round(renoCostPerM2 * surface_m2),
    reno_cost_per_m2: renoCostPerM2,
    uplift_pct: pricePerM2 > 0 ? (renoCostPerM2 / pricePerM2) * 100 : 0,
  }
}

function normalizeCity(city?: string | null) {
  if (!city) return ""
  return city.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
}
