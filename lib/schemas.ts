import { z } from "zod"

// Financing schema
export const financingSchema = z.object({
  ltv: z.number().min(0).max(1).describe("Loan to value ratio"),
  fix_years: z.enum(["1", "5", "10", "15", "20"]).transform(Number).describe("Fixed rate years"),
})

// Fees schema
export const feesSchema = z.object({
  grunderwerb_pct: z.number().min(0).max(1).describe("Ground acquisition tax %"),
  notary_pct: z.number().min(0).max(1).describe("Notary fee %"),
  agent_pct: z.number().min(0).max(1).optional().describe("Agent fee %"),
  other: z.number().min(0).optional().describe("Other fees in €"),
})

// Property payload schema - matches backend Pydantic
export const propertyPayloadSchema = z.object({
  country: z.literal("DE"),
  plz: z.string().regex(/^\d{5}$/, "PLZ must be 5 digits"),
  city: z.string().min(1, "City is required"),
  lat: z.number().optional(),
  lon: z.number().optional(),
  property_type: z.enum(["wohnung", "haus", "apartment", "gewerbe"]),
  surface_m2: z.number().positive("Surface must be positive"),
  rooms: z.number().positive("Rooms must be positive"),
  year_built: z.number().int().optional(),
  condition: z.enum(["poor", "average", "good", "renovated"]).optional(),
  price_buy: z.number().positive("Purchase price must be positive"),
  reno_cost: z.number().min(0),
  holding_months: z.number().int().min(1).max(120),
  expected_rent_month: z.number().min(0).optional(),
  financing: financingSchema,
  fees: feesSchema,
})

// Driver schema
export const driverSchema = z.object({
  feature: z.string(),
  effect: z.number(),
})

// Prediction response schema
export const predictionResponseSchema = z.object({
  decision: z.enum(["Buy", "Don't buy"]),
  confidence: z.number().min(0).max(1),
  roi_estimated: z.number(),
  cap_rate: z.number().optional(),
  price_post_reno_per_m2: z.number().optional(),
  assumptions: z.record(z.string()).optional(),
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
