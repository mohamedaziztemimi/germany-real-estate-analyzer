import { z } from "zod"

// Financing schema
export const financingSchema = z.object({
  ltv: z.number().min(0).max(1).describe("Loan to value ratio"),
  fix_years: z.number().int().min(1).describe("Fixed rate years"),
})

// Fees schema
export const feesSchema = z.object({
  grunderwerb_pct: z.number().min(0).max(100).describe("Ground acquisition tax %"),
  notary_pct: z.number().min(0).max(100).describe("Notary fee %"),
  agent_pct: z.number().min(0).max(100).nullable().optional().describe("Agent fee %"),
  other: z.number().min(0).nullable().optional().describe("Other fees in EUR"),
})

// Property payload schema - matches backend Pydantic
export const propertyPayloadSchema = z.object({
  country: z.literal("DE"),
  plz: z.string().regex(/^\d{5}$/, "PLZ must be 5 digits"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required").optional(),
  lat: z.number().nullable().optional(),
  lon: z.number().nullable().optional(),
  property_type: z.enum(["wohnung", "haus", "apartment", "gewerbe"]),
  surface_m2: z.number().positive("Surface must be positive"),
  rooms: z.number().positive("Rooms must be positive"),
  year_built: z.number().int().min(1800, "Year built is required"),
  floor: z.number().int().optional(),
  condition: z.enum(["poor", "medium", "good", "average", "renovated"]).nullable().optional(),
  condition_score: z.number().min(1).max(5).nullable().optional(),
  macro_location_score: z.number().min(0).max(5).nullable().optional(),
  micro_location_score: z.number().min(0).max(5).nullable().optional(),
  has_elevator: z.number().int().min(0).max(1).optional(),
  has_balcony: z.number().int().min(0).max(1).optional(),
  energy_efficiency_class: z.enum(["A+", "A", "B", "C", "D", "E", "F"]).optional(),
  purchase_price: z.number().positive("Purchase price is required").optional(),
  price_buy: z.number().positive("Purchase price is required").optional(),
  purchase_costs_rate: z.number().min(0).max(1).default(0.1),
  reno_cost: z.number().min(0).default(0),
  capex_one_time: z.number().min(0).default(0),
  capex_per_year: z.number().min(0).default(0),
  price_per_m2: z.number().positive().optional(),
  reno_cost_per_m2: z.number().min(0).optional(),
  uplift_pct: z.number().optional(),
  vacancy_risk_score: z.number().min(1).max(5).nullable().optional(),
  current_rent_pa: z.number().min(0).optional(),
  market_rent_pa: z.number().min(0, "Market rent is required").default(0),
  rent_growth_rate: z.number().default(0.02),
  operating_cost_rate: z.number().min(0).max(1).default(0.22),
  interest_rate: z.number().min(0).max(1).optional(),
  principal_rate: z.number().min(0).max(1).default(0.02),
  equity: z.number().min(0).optional(),
  market_price_per_m2: z.number().positive().optional(),
  strategy_score: z.number().min(1).max(5).default(3),
  greix_index: z.number().describe("GREIX market index level"),
  hpi_index: z.number().describe("House price index level"),
  mortgage_rate_10y: z.number().min(0),
  listing_year: z.number().int().min(1900).max(2100),
  listing_quarter: z.number().int().min(1).max(4),
  holding_years: z.number().positive("Holding period in years is required").default(1),
  renovation_planned: z.boolean().default(true),
  holding_months: z.number().int().min(1).max(120).optional(),
  annual_appreciation_rate: z.number().default(0.015),
  expected_rent_month: z.number().min(0).nullable().optional(),
  financing: financingSchema,
  fees: feesSchema,
})

// Driver schema
export const driverSchema = z.object({
  feature: z.string(),
  effect: z.number(),
})

const locationScoresSchema = z.object({
  macro: z.number().nullable().optional(),
  micro: z.number().nullable().optional(),
})

const financingImpactSchema = z.object({
  interest_cost_pa: z.number(),
  principal_paydown_pa: z.number(),
})

// Prediction response schema
export const predictionResponseSchema = z.object({
  decision: z.enum(["Buy", "Don't buy"]),
  confidence: z.number().min(0).max(1),
  roi_estimated: z.number(),
  roi_total: z.number().optional(),
  annual_roi: z.number().optional(),
  cap_rate: z.number().optional(),
  price_post_reno_per_m2: z.number().optional(),
  predicted_price_post_reno_per_m2: z.number().optional(),
  post_reno_value_today: z.number().optional(),
  future_sale_price: z.number().optional(),
  total_initial_investment: z.number().optional(),
  cashflow_per_year: z.array(z.number()).optional(),
  vacancy_risk_score: z.number().optional(),
  location_scores: locationScoresSchema.optional(),
  renovation_uplift: z.number().optional(),
  financing_impact: financingImpactSchema.optional(),
  summary_text: z.string().optional(),
  assumptions: z.record(z.any()).optional(),
  drivers: z.array(driverSchema),
  explanations: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  request_id: z.string(),
  timestamp: z.string(),
})

// Error schema
export const errorSchema = z.object({
  error: z.object({
    code: z.enum(["VALIDATION_ERROR", "MODEL_UNAVAILABLE", "INTERNAL_ERROR"]),
    message: z.string(),
    details: z.record(z.any()).optional(),
    request_id: z.string().optional(),
  }),
})

// TypeScript types
export type Financing = z.infer<typeof financingSchema>
export type Fees = z.infer<typeof feesSchema>
export type PropertyPayload = z.infer<typeof propertyPayloadSchema>
export type Driver = z.infer<typeof driverSchema>
export type PredictionResponse = z.infer<typeof predictionResponseSchema>
export type APIError = z.infer<typeof errorSchema>
export type LocationScores = z.infer<typeof locationScoresSchema>
export type FinancingImpact = z.infer<typeof financingImpactSchema>
