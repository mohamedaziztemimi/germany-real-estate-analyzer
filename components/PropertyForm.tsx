"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertyPayloadSchema, type PropertyPayload, type PredictionResponse } from "@/lib/schemas"
import { normalizePrediction } from "@/lib/prediction-utils"
import {
  getMarketDefaults,
  estimateRenovationBudget,
  type RenovationLevel,
  getAutoDefaultsByPlz,
  getLocationByPlz,
  getPlzByCity,
} from "@/lib/market-data"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePredictMutation } from "@/lib/hooks"
import { useLanguage } from "@/lib/language-context"

const initialMarket = getMarketDefaults()

const CONDITION_UPLIFT: Record<string, number> = { good: 0.02, medium: 0.1, poor: 0.22 }

interface PropertyFormProps {
  onSuccess?: (data: PropertyPayload, result: PredictionResponse) => void
}

export function PropertyForm({ onSuccess }: PropertyFormProps) {
  const { strings, language } = useLanguage()
  const steps = [
    {
      id: 1,
      name: strings.stepLocation,
      fields: [
        "country",
        "plz",
        "city",
        "district",
        "property_type",
        "surface_m2",
        "rooms",
        "year_built",
        "floor",
        "condition",
        "condition_score",
        "macro_location_score",
        "micro_location_score",
        "vacancy_risk_score",
        "energy_efficiency_class",
        "has_elevator",
        "has_balcony",
      ],
    },
    {
      id: 2,
      name: "Acquisition & Works",
      fields: [
        "renovation_planned",
        "purchase_price",
        "purchase_costs_rate",
        "capex_one_time",
        "capex_per_year",
        "operating_cost_rate",
      ],
    },
    {
      id: 3,
      name: "Rental & Market",
      fields: [
        "current_rent_pa",
        "market_rent_pa",
        "rent_growth_rate",
        "market_price_per_m2",
        "strategy_score",
        "greix_index",
        "hpi_index",
        "mortgage_rate_10y",
        "listing_year",
        "listing_quarter",
      ],
    },
    {
      id: 4,
      name: strings.stepFinancing,
      fields: [
        "interest_rate",
        "principal_rate",
        "equity",
        "annual_appreciation_rate",
        "holding_years",
        "financing.ltv",
        "financing.fix_years",
        "fees.grunderwerb_pct",
        "fees.notary_pct",
        "fees.agent_pct",
        "fees.other",
      ],
    },
  ]
  const [currentStep, setCurrentStep] = useState(1)
  const renovationLevel: RenovationLevel = "standard"
  const { mutate, isPending, error } = usePredictMutation()
  const parseOptionalNumber = (value: unknown) => {
    if (value === "" || value === null || typeof value === "undefined") {
      return undefined
    }
    const normalized = typeof value === "string" ? value.replace(",", ".") : value
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  const parseNumber = (value: unknown) => {
    if (value === "" || value === null || typeof value === "undefined") return undefined
    const normalized = typeof value === "string" ? value.replace(",", ".") : value
    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
    setValue,
    trigger,
  } = useForm<PropertyPayload>({
    resolver: zodResolver(propertyPayloadSchema),
    mode: "onChange",
    defaultValues: {
      country: "DE",
      district: "Mitte",
      property_type: "apartment",
      condition: "medium",
      condition_score: 3,
      macro_location_score: 3.5,
      micro_location_score: 3.5,
      vacancy_risk_score: undefined,
      energy_efficiency_class: "C",
      year_built: undefined,
      floor: 0,
      has_elevator: 0,
      has_balcony: 0,
      surface_m2: undefined,
      rooms: undefined,
      holding_months: 60,
      holding_years: 5,
      listing_year: initialMarket.listing_year,
      listing_quarter: initialMarket.listing_quarter,
      greix_index: initialMarket.greix_index,
      hpi_index: initialMarket.hpi_index,
      mortgage_rate_10y: initialMarket.mortgage_rate_10y,
      purchase_price: undefined,
      price_buy: undefined,
      purchase_costs_rate: 0.1,
      capex_one_time: undefined,
      capex_per_year: 0,
      operating_cost_rate: 0.22,
      reno_cost: undefined,
      price_per_m2: 0,
      reno_cost_per_m2: 0,
      uplift_pct: CONDITION_UPLIFT.medium,
      current_rent_pa: undefined,
      market_rent_pa: undefined,
      rent_growth_rate: 0.02,
      expected_rent_month: undefined,
      interest_rate: undefined,
      principal_rate: undefined,
      equity: undefined,
      market_price_per_m2: undefined,
      strategy_score: 0.5,
      annual_appreciation_rate: 0.015,
      renovation_planned: true,
      financing: { ltv: 0.8, fix_years: 10 },
      fees: { grunderwerb_pct: 6, notary_pct: 1.5, agent_pct: 3, other: 1500 },
    },
  })

  const values = watch()
  const cityValue = watch("city")
  const surfaceValue = watch("surface_m2")
  const purchasePriceValue = watch("purchase_price")
  const capexOneTimeValue = watch("capex_one_time")
  const conditionValue = watch("condition")
  const marketRentValue = watch("market_rent_pa")
  const hasElevatorValue = watch("has_elevator")
  const hasBalconyValue = watch("has_balcony")
  const renovationPlanned = watch("renovation_planned") ?? true
  const plzValue = watch("plz")
  const cityWatch = watch("city")
  const districtWatch = watch("district")
  const capexDirty = dirtyFields?.capex_one_time ?? false
  const pricePerM2Display = surfaceValue && purchasePriceValue ? purchasePriceValue / surfaceValue : 0
  const renoCostPerM2Display = surfaceValue ? (capexOneTimeValue ?? 0) / surfaceValue : 0
  const propertyTypeOptions = [
    { value: "apartment", label: language === "de" ? "Wohnung" : "Apartment" },
    { value: "haus", label: language === "de" ? "Haus" : "House" },
    { value: "gewerbe", label: language === "de" ? "Gewerbe" : "Commercial" },
  ]

  const normalizeConditionValue = (value?: PropertyPayload["condition"] | null) => {
    if (!value) return undefined
    const normalized = String(value).toLowerCase()
    if (normalized === "average") return "medium"
    if (normalized === "renovated") return "good"
    return normalized as PropertyPayload["condition"]
  }

  useEffect(() => {
    const market = getMarketDefaults(cityValue)
    setValue("greix_index", market.greix_index, { shouldValidate: true, shouldDirty: false })
    setValue("hpi_index", market.hpi_index, { shouldValidate: true, shouldDirty: false })
    setValue("mortgage_rate_10y", market.mortgage_rate_10y, { shouldValidate: true, shouldDirty: false })
    setValue("listing_year", market.listing_year, { shouldValidate: true, shouldDirty: false })
    setValue("listing_quarter", market.listing_quarter, { shouldValidate: true, shouldDirty: false })
  }, [cityValue, setValue])

  useEffect(() => {
    const normalizedCondition = normalizeConditionValue(conditionValue)
    if (normalizedCondition) {
      setValue("condition", normalizedCondition, { shouldValidate: true })
      const uplift = CONDITION_UPLIFT[normalizedCondition]
      if (uplift !== undefined) {
        setValue("uplift_pct", uplift, { shouldValidate: true })
      }
    }
  }, [conditionValue, setValue])

  useEffect(() => {
    if (!surfaceValue || surfaceValue <= 0 || !purchasePriceValue || purchasePriceValue <= 0) {
      return
    }
    const pricePerM2 = purchasePriceValue / surfaceValue
    setValue("price_per_m2", pricePerM2, { shouldValidate: true })
    setValue("price_buy", purchasePriceValue, { shouldValidate: true })
  }, [surfaceValue, purchasePriceValue, setValue])

  useEffect(() => {
    if (!surfaceValue || surfaceValue <= 0) {
      return
    }
    const renoCost = typeof capexOneTimeValue === "number" ? capexOneTimeValue : 0
    setValue("reno_cost_per_m2", surfaceValue ? renoCost / surfaceValue : 0, { shouldValidate: true })
    setValue("reno_cost", renoCost, { shouldValidate: true })
  }, [surfaceValue, capexOneTimeValue, setValue])

  useEffect(() => {
    const rentPerMonth = marketRentValue ? marketRentValue / 12 : 0
    setValue("expected_rent_month", rentPerMonth, { shouldValidate: true })
  }, [marketRentValue, setValue])

  useEffect(() => {
    if (!plzValue && !cityValue) return
    const defaults = getAutoDefaultsByPlz(plzValue, cityValue)
    const location = getLocationByPlz(plzValue)
    if (location) {
      if (!cityWatch) setValue("city", location.city, { shouldValidate: true })
      if (!districtWatch && location.district) setValue("district", location.district, { shouldValidate: true })
    } else if (cityWatch && !plzValue) {
      const inferredPlz = getPlzByCity(cityWatch)
      if (inferredPlz) setValue("plz", inferredPlz, { shouldValidate: true })
    }
    if (defaults.avg_price_per_m2 && surfaceValue && purchasePriceValue === undefined) {
      setValue("market_price_per_m2", defaults.avg_price_per_m2, { shouldValidate: true })
    }
    if (defaults.avg_rent_per_m2 && surfaceValue && !marketRentValue) {
      setValue("market_rent_pa", defaults.avg_rent_per_m2 * surfaceValue, { shouldValidate: true })
    }
    if (defaults.greix_index) setValue("greix_index", defaults.greix_index, { shouldValidate: true })
    if (defaults.hpi_index) setValue("hpi_index", defaults.hpi_index, { shouldValidate: true })
    setValue("purchase_costs_rate", 0.1, { shouldValidate: true })
    setValue("operating_cost_rate", 0.22, { shouldValidate: true })
    setValue("rent_growth_rate", 0.01, { shouldValidate: true })
    setValue("strategy_score", 3, { shouldValidate: true })
    if (surfaceValue && renovationPlanned) {
      setValue("capex_per_year", surfaceValue * 17, { shouldValidate: true })
    }
    setValue("condition_score", 3, { shouldValidate: true })
    setValue("macro_location_score", defaults.greix_index ? Math.min(5, Math.max(1, defaults.greix_index / 50)) : 3.5, {
      shouldValidate: true,
    })
    if (defaults.avg_rent_per_m2) {
      setValue("micro_location_score", Math.min(5, Math.max(1, defaults.avg_rent_per_m2 / 5)), { shouldValidate: true })
    }
    setValue("vacancy_risk_score", 3.0, { shouldValidate: true })
    setValue("interest_rate", defaults.mortgage_rate_10y ?? 0.035, { shouldValidate: true })
    setValue("principal_rate", 0.025, { shouldValidate: true })
    if (purchasePriceValue) {
      setValue("equity", purchasePriceValue * 0.2, { shouldValidate: true })
    }
  }, [plzValue, cityValue, surfaceValue, purchasePriceValue, marketRentValue, setValue])

  useEffect(() => {
    if (values.holding_years && values.holding_years > 0) {
      setValue("holding_months", Math.round(values.holding_years * 12), { shouldValidate: true })
    }
  }, [values.holding_years, setValue])

  useEffect(() => {
    if (!renovationPlanned) {
      setValue("capex_one_time", 0, { shouldValidate: true })
      setValue("capex_per_year", 0, { shouldValidate: true })
      setValue("reno_cost", 0, { shouldValidate: true })
      setValue("reno_cost_per_m2", 0, { shouldValidate: true })
      setValue("uplift_pct", 0, { shouldValidate: true })
      return
    }
    // Re-enable sensible defaults when turning renovation back on
    if (renovationPlanned && surfaceValue && purchasePriceValue && !dirtyFields?.capex_one_time) {
      const pricePerM2 = purchasePriceValue / surfaceValue
      const normalizedCondition = normalizeConditionValue(conditionValue) || "medium"
      const estimate = estimateRenovationBudget({
        surface_m2: surfaceValue,
        condition: normalizedCondition,
        price_buy: purchasePriceValue,
        price_per_m2: pricePerM2,
        renovationLevel,
      })
      if (!capexOneTimeValue) {
        setValue("capex_one_time", estimate.reno_cost, { shouldValidate: true })
        setValue("reno_cost", estimate.reno_cost, { shouldValidate: true })
        setValue("reno_cost_per_m2", estimate.reno_cost_per_m2, { shouldValidate: true })
      }
      setValue("uplift_pct", CONDITION_UPLIFT[normalizedCondition] ?? estimate.uplift_pct, { shouldValidate: true })
    }
  }, [renovationPlanned, setValue, surfaceValue, purchasePriceValue, conditionValue, capexDirty, capexOneTimeValue, renovationLevel])

  useEffect(() => {
    if (!renovationPlanned) return
    if (!surfaceValue || surfaceValue <= 0 || !purchasePriceValue || purchasePriceValue <= 0) {
      return
    }
    if (dirtyFields?.capex_one_time) {
      return
    }
    if (capexOneTimeValue && capexOneTimeValue > 0) {
      return
    }
    const normalizedCondition = normalizeConditionValue(conditionValue)
    const pricePerM2 = purchasePriceValue / surfaceValue
    const estimate = estimateRenovationBudget({
      surface_m2: surfaceValue,
      condition: normalizedCondition || conditionValue,
      price_buy: purchasePriceValue,
      price_per_m2: pricePerM2,
      renovationLevel,
    })
    setValue("capex_one_time", estimate.reno_cost, { shouldValidate: true })
    setValue("reno_cost", estimate.reno_cost, { shouldValidate: true })
    setValue("reno_cost_per_m2", estimate.reno_cost_per_m2, { shouldValidate: true })
  }, [
    renovationPlanned,
    surfaceValue,
    purchasePriceValue,
    conditionValue,
    renovationLevel,
    capexOneTimeValue,
    dirtyFields?.capex_one_time,
    setValue,
  ])

  const currentStepConfig = steps[currentStep - 1]
  const validateAndAdvance = async () => {
    const fields = currentStepConfig?.fields || []
    const valid = await trigger(fields as any, { shouldFocus: true })
    if (!valid) {
      return
    }
    setCurrentStep((prev) => Math.min(steps.length, prev + 1))
  }

  const onSubmit = (data: PropertyPayload) => {
    // Safety guard: never run analysis until user is on the final step
    if (currentStep < steps.length) {
      setCurrentStep((prev) => Math.min(steps.length, prev + 1))
      return
    }

    const normalizedCondition = normalizeConditionValue(data.condition) || "medium"
    const purchasePrice = data.purchase_price || data.price_buy || 0
    const pricePerM2 = data.surface_m2 ? purchasePrice / data.surface_m2 : 0
    const renoCost = data.capex_one_time ?? data.reno_cost ?? 0
    const renoCostPerM2 = data.surface_m2 ? renoCost / data.surface_m2 : 0
    const uplift = CONDITION_UPLIFT[normalizedCondition] ?? CONDITION_UPLIFT.medium
    const holdingYears = data.holding_years ?? (data.holding_months ?? 0) / 12
    const holdingMonths = data.holding_months ?? Math.max(1, Math.round(holdingYears * 12))

    if (!Number.isFinite(pricePerM2) || pricePerM2 <= 0) {
      return
    }

    const equity =
      data.equity ??
      purchasePrice * Math.max(0, 1 - (data.financing?.ltv ?? 0.8)) +
        (data.capex_one_time ?? data.reno_cost ?? 0)
    const interestRate = data.interest_rate ?? data.mortgage_rate_10y ?? 0
    const marketRentPa = data.market_rent_pa ?? (data.expected_rent_month ? data.expected_rent_month * 12 : 0)
    const expectedRentMonth = marketRentPa ? marketRentPa / 12 : data.expected_rent_month ?? 0
    const resolvedVacancy = data.vacancy_risk_score ?? undefined

    const payload: PropertyPayload = {
      ...data,
      purchase_price: purchasePrice,
      price_buy: purchasePrice,
      condition: normalizedCondition,
      has_elevator: data.has_elevator ?? 0,
      has_balcony: data.has_balcony ?? 0,
      price_per_m2: pricePerM2,
      market_price_per_m2: data.market_price_per_m2 && data.market_price_per_m2 > 0 ? data.market_price_per_m2 : pricePerM2,
      purchase_costs_rate: data.purchase_costs_rate ?? 0.1,
      capex_one_time: renoCost,
      reno_cost: renoCost,
      reno_cost_per_m2: renoCostPerM2,
      uplift_pct: uplift,
      holding_months: holdingMonths,
      holding_years: holdingYears,
      current_rent_pa: data.current_rent_pa ?? 0,
      market_rent_pa: marketRentPa,
      rent_growth_rate: data.rent_growth_rate ?? 0.02,
      operating_cost_rate: data.operating_cost_rate ?? 0.22,
      expected_rent_month: expectedRentMonth,
      interest_rate: interestRate,
      principal_rate: data.principal_rate ?? 0.02,
      equity,
      strategy_score: data.strategy_score ?? 0.5,
      vacancy_risk_score: resolvedVacancy,
      financing: {
        ltv: data.financing?.ltv ?? 0,
        fix_years: data.financing?.fix_years ?? 0,
      },
      fees: {
        grunderwerb_pct: data.fees?.grunderwerb_pct ?? 0,
        notary_pct: data.fees?.notary_pct ?? 0,
        agent_pct: data.fees?.agent_pct ?? 0,
        other: data.fees?.other ?? 0,
      },
    }

    mutate(payload, {
      onSuccess: (result) => {
        localStorage.setItem("payload:last", JSON.stringify(payload))
        onSuccess?.(payload, normalizePrediction(payload, result))
      },
    })
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      {/* Step indicator */}
      <div className="flex justify-between gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
              currentStep >= step.id
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white text-gray-600"
            }`}
          >
            {step.id}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
          }
        }}
      >
        {/* Hidden inputs for derived fields to keep validation in sync */}
        <input type="hidden" {...register("price_per_m2", { valueAsNumber: true })} />
        <input type="hidden" {...register("reno_cost_per_m2", { valueAsNumber: true })} />
        <input type="hidden" {...register("uplift_pct", { valueAsNumber: true })} />
        <input type="hidden" {...register("has_elevator", { valueAsNumber: true })} />
        <input type="hidden" {...register("has_balcony", { valueAsNumber: true })} />
        <input type="hidden" {...register("property_type")} />
        <input type="hidden" {...register("condition")} />
        <input type="hidden" {...register("energy_efficiency_class")} />
        <input type="hidden" {...register("renovation_planned")} />
        <Card className="mb-6 p-6 space-y-6">
          <h2 className="mb-6 text-lg font-semibold">{currentStepConfig.name}</h2>

          {/* Step 1: Property & Location */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plz">{strings.plz}</Label>
                  <Input
                    id="plz"
                    {...register("plz", { required: true })}
                    placeholder="10115"
                    maxLength={5}
                    className={errors.plz ? "border-red-500" : ""}
                  />
                  {errors.plz && <span className="text-sm text-red-500">{errors.plz.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{strings.city}</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Berlin"
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && <span className="text-sm text-red-500">{errors.city.message}</span>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="district">{strings.district}</Label>
                  <Select
                    value={values.district || "Mitte"}
                    onValueChange={(value) => setValue("district", value, { shouldValidate: true })}
                  >
                    <SelectTrigger id="district" className={errors.district ? "border-red-500" : ""}>
                      <SelectValue placeholder={strings.selectDistrict} />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Altona",
                        "Anger-Crottendorf",
                        "Bad Cannstatt",
                        "Barmbek",
                        "Benrath",
                        "Bilk",
                        "Bogenhausen",
                        "Charlottenburg",
                        "Derendorf",
                        "Dusseltal",
                        "Eimsbuettel",
                        "Flingern",
                        "Friedrichshain",
                        "Giesing",
                        "Gohlis",
                        "Harlaching",
                        "Harvestehude",
                        "Lindenau",
                        "Mitte",
                        "Neuhausen",
                        "Neukoelln",
                        "Oberkassel",
                        "Plagwitz",
                        "Prenzlauer Berg",
                        "Reudnitz",
                        "Schwabing",
                        "Sendling",
                        "Sued",
                        "Vaihingen",
                        "Wahren",
                        "Wandsbek",
                        "West",
                        "Wilmersdorf",
                        "Winterhude",
                        "Zuffenhausen",
                      ].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.district && <span className="text-sm text-red-500">{errors.district.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_type">{strings.propertyType}</Label>
                  <Select value={values.property_type} onValueChange={(value) => setValue("property_type", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder={strings.selectPropertyType} />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="surface_m2">{strings.surface}</Label>
                  <Input
                    id="surface_m2"
                    type="number"
                    step="0.1"
                    {...register("surface_m2", { setValueAs: parseNumber, required: true, min: 1 })}
                    placeholder="58"
                    className={errors.surface_m2 ? "border-red-500" : ""}
                  />
                  {errors.surface_m2 && <span className="text-sm text-red-500">{errors.surface_m2.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">{strings.rooms}</Label>
                  <Input
                    id="rooms"
                    type="number"
                    step="0.5"
                    {...register("rooms", { setValueAs: parseNumber })}
                    placeholder="2.5"
                    className={errors.rooms ? "border-red-500" : ""}
                  />
                  {errors.rooms && <span className="text-sm text-red-500">{errors.rooms.message}</span>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="year_built">{strings.yearBuilt}</Label>
                  <Input
                    id="year_built"
                    type="number"
                    min="1800"
                    max="2100"
                    {...register("year_built", { setValueAs: parseNumber })}
                    placeholder="1990"
                    className={errors.year_built ? "border-red-500" : ""}
                  />
                  {errors.year_built && <span className="text-sm text-red-500">{errors.year_built.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">{strings.floor}</Label>
                  <Input
                    id="floor"
                    type="number"
                    min="-5"
                    {...register("floor", { setValueAs: parseNumber })}
                    placeholder="3"
                    className={errors.floor ? "border-red-500" : ""}
                  />
                  {errors.floor && <span className="text-sm text-red-500">{errors.floor.message}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">{strings.condition}</Label>
                  <Select value={values.condition || ""} onValueChange={(value) => setValue("condition", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder={strings.selectCondition} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">{language === "de" ? "Gut / Renoviert" : "Good / Renovated"}</SelectItem>
                      <SelectItem value="medium">{language === "de" ? "Mittel / Durchschnitt" : "Medium / Average"}</SelectItem>
                      <SelectItem value="poor">{language === "de" ? "Schlecht" : "Poor"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="condition_score">{strings.conditionScoreLabel}</Label>
                  <Input
                    id="condition_score"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="1-5"
                    {...register("condition_score", { setValueAs: parseNumber, min: 1, max: 5 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macro_location_score">{strings.macroLocationScoreLabel}</Label>
                  <Input
                    id="macro_location_score"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="1-5"
                    {...register("macro_location_score", { setValueAs: parseNumber, min: 1, max: 5 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="micro_location_score">{strings.microLocationScoreLabel}</Label>
                  <Input
                    id="micro_location_score"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="1-5"
                    {...register("micro_location_score", { setValueAs: parseNumber, min: 1, max: 5 })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="energy_efficiency_class">{strings.energyClass}</Label>
                  <Select
                    value={values.energy_efficiency_class || ""}
                    onValueChange={(value) => setValue("energy_efficiency_class", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={strings.selectEnergy} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                      <SelectItem value="F">F</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vacancy_risk_score">{strings.vacancyRiskLabel}</Label>
                  <Input
                    id="vacancy_risk_score"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    {...register("vacancy_risk_score", { setValueAs: parseNumber })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <input
                    id="has_elevator"
                    type="checkbox"
                    checked={Boolean(hasElevatorValue)}
                    onChange={(e) => setValue("has_elevator", e.target.checked ? 1 : 0, { shouldValidate: true })}
                  />
                  <Label htmlFor="has_elevator" className="mb-0 cursor-pointer">
                    {strings.elevator}
                  </Label>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <input
                    id="has_balcony"
                    type="checkbox"
                    checked={Boolean(hasBalconyValue)}
                    onChange={(e) => setValue("has_balcony", e.target.checked ? 1 : 0, { shouldValidate: true })}
                  />
                  <Label htmlFor="has_balcony" className="mb-0 cursor-pointer">
                    {strings.balcony}
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Acquisition & Works */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">{strings.renovationToggleTitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={renovationPlanned ? "default" : "outline"}
                    onClick={() => setValue("renovation_planned", true, { shouldValidate: true })}
                  >
                    {strings.renovationToggleYes}
                  </Button>
                  <Button
                    size="sm"
                    variant={!renovationPlanned ? "default" : "outline"}
                    onClick={() => setValue("renovation_planned", false, { shouldValidate: true })}
                  >
                    {strings.renovationToggleNo}
                  </Button>
                </div>
              </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="purchase_price">{strings.priceBuy}</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    {...register("purchase_price", { setValueAs: parseNumber, required: true, min: 1 })}
                    placeholder="295000"
                    className={errors.purchase_price ? "border-red-500" : ""}
                  />
                  {errors.purchase_price && <span className="text-sm text-red-500">{errors.purchase_price.message}</span>}
                </div>
                <div>
                  <Label htmlFor="purchase_costs_rate">{strings.purchaseCosts}</Label>
                  <Input
                    id="purchase_costs_rate"
                    type="number"
                    step="0.001"
                    {...register("purchase_costs_rate", { setValueAs: parseNumber })}
                    placeholder="0.10"
                  />
                </div>
              </div>

              {renovationPlanned ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="capex_one_time">{strings.oneTimeCapexLabel}</Label>
                    <Input
                      id="capex_one_time"
                      type="number"
                      step="1000"
                      {...register("capex_one_time", { setValueAs: parseNumber, required: renovationPlanned })}
                      placeholder="50000"
                      className={errors.capex_one_time ? "border-red-500" : ""}
                    />
                    {errors.capex_one_time && <span className="text-sm text-red-500">{errors.capex_one_time.message}</span>}
                  </div>
                  <div>
                    <Label htmlFor="capex_per_year">{strings.capexPerYearLabel}</Label>
                    <Input
                      id="capex_per_year"
                      type="number"
                      step="500"
                      {...register("capex_per_year", { setValueAs: parseNumber })}
                      placeholder="2000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operating_cost_rate">{strings.operatingCostLabel}</Label>
                  <Input
                    id="operating_cost_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...register("operating_cost_rate", { setValueAs: parseNumber })}
                    placeholder="0.22 = 22%"
                  />
                </div>
              </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="operating_cost_rate">{strings.operatingCostLabel}</Label>
                  <Input
                    id="operating_cost_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    {...register("operating_cost_rate", { setValueAs: parseNumber })}
                    placeholder="0.22 = 22%"
                  />
                </div>
              </div>
              )}

              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-600 space-y-1">
                <p>
                  {strings.pricePerM2}: <strong>{pricePerM2Display > 0 ? pricePerM2Display.toFixed(0) : "-"}</strong>
                </p>
                {renovationPlanned && (
                  <p>
                    {strings.renoPerM2}: <strong>{surfaceValue ? renoCostPerM2Display.toFixed(0) : "-"}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Rental & Market */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="current_rent_pa">{strings.currentRentLabel}</Label>
                  <Input
                    id="current_rent_pa"
                    type="number"
                    {...register("current_rent_pa", { setValueAs: parseNumber })}
                    placeholder="14000"
                  />
                </div>
                <div>
                  <Label htmlFor="market_rent_pa">{strings.marketRentLabel}</Label>
                  <Input
                    id="market_rent_pa"
                    type="number"
                    {...register("market_rent_pa", { setValueAs: parseNumber })}
                    placeholder="18000"
                    className={errors.market_rent_pa ? "border-red-500" : ""}
                  />
                  {errors.market_rent_pa && <span className="text-sm text-red-500">{errors.market_rent_pa.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="rent_growth_rate">{strings.rentGrowthLabel}</Label>
                  <Input
                    id="rent_growth_rate"
                    type="number"
                    step="0.005"
                    {...register("rent_growth_rate", { setValueAs: parseNumber })}
                    placeholder="0.02"
                  />
                </div>
                <div>
                  <Label htmlFor="market_price_per_m2">{strings.marketPriceLabel}</Label>
                  <Input
                    id="market_price_per_m2"
                    type="number"
                    step="100"
                    {...register("market_price_per_m2", { setValueAs: parseNumber })}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="strategy_score">{strings.strategyScoreLabel}</Label>
                  <Input
                    id="strategy_score"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    {...register("strategy_score", { setValueAs: parseNumber, min: 1, max: 5 })}
                    placeholder="1-5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="greix_index">{strings.greixIndex}</Label>
                  <Input
                    id="greix_index"
                    type="number"
                    step="0.01"
                    {...register("greix_index", { setValueAs: parseNumber })}
                    className={errors.greix_index ? "border-red-500" : ""}
                  />
                  {errors.greix_index && <span className="text-sm text-red-500">{errors.greix_index.message}</span>}
                </div>
                <div>
                  <Label htmlFor="hpi_index">{strings.hpiIndex}</Label>
                  <Input
                    id="hpi_index"
                    type="number"
                    step="0.01"
                    {...register("hpi_index", { setValueAs: parseNumber })}
                    className={errors.hpi_index ? "border-red-500" : ""}
                  />
                  {errors.hpi_index && <span className="text-sm text-red-500">{errors.hpi_index.message}</span>}
                </div>
                <div>
                  <Label htmlFor="mortgage_rate_10y">{strings.mortgageRate}</Label>
                  <Input
                    id="mortgage_rate_10y"
                    type="number"
                    step="0.0001"
                    {...register("mortgage_rate_10y", { setValueAs: parseNumber })}
                    className={errors.mortgage_rate_10y ? "border-red-500" : ""}
                  />
                  {errors.mortgage_rate_10y && (
                    <span className="text-sm text-red-500">{errors.mortgage_rate_10y.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="listing_year">{strings.listingYear}</Label>
                  <Input
                    id="listing_year"
                    type="number"
                    min="1900"
                    max="2100"
                    {...register("listing_year", { setValueAs: parseNumber })}
                    className={errors.listing_year ? "border-red-500" : ""}
                  />
                  {errors.listing_year && <span className="text-sm text-red-500">{errors.listing_year.message}</span>}
                </div>
                <div>
                  <Label htmlFor="listing_quarter">{strings.listingQuarter}</Label>
                  <Input
                    id="listing_quarter"
                    type="number"
                    min="1"
                    max="4"
                    {...register("listing_quarter", { setValueAs: parseNumber })}
                    className={errors.listing_quarter ? "border-red-500" : ""}
                  />
                  {errors.listing_quarter && (
                    <span className="text-sm text-red-500">{errors.listing_quarter.message}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Financing & Horizon */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="interest_rate">{strings.interestRateLabel}</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    {...register("interest_rate", { setValueAs: parseNumber })}
                    placeholder="0.03"
                  />
                </div>
                <div>
                  <Label htmlFor="principal_rate">{strings.principalRateLabel}</Label>
                  <Input
                    id="principal_rate"
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    {...register("principal_rate", { setValueAs: parseNumber })}
                    placeholder="0.02"
                  />
                </div>
                <div>
                  <Label htmlFor="equity">{strings.equityLabel}</Label>
                  <Input id="equity" type="number" {...register("equity", { setValueAs: parseNumber })} placeholder="80000" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="annual_appreciation_rate">{strings.annualAppreciationLabel}</Label>
                  <Input
                    id="annual_appreciation_rate"
                    type="number"
                    step="0.001"
                    {...register("annual_appreciation_rate", { setValueAs: parseNumber })}
                    placeholder="0.015"
                  />
                </div>
                <div>
                  <Label htmlFor="holding_years">{strings.holdingYearsLabel}</Label>
                  <Input
                    id="holding_years"
                    type="number"
                    step="0.5"
                    min="1"
                    {...register("holding_years", { setValueAs: parseNumber })}
                    placeholder="5"
                    className={errors.holding_years ? "border-red-500" : ""}
                  />
                  {errors.holding_years && <span className="text-sm text-red-500">{errors.holding_years.message}</span>}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 font-semibold">{strings.financingTitle}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ltv">{strings.ltv}</Label>
                    <Input
                      id="ltv"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      {...register("financing.ltv", { setValueAs: parseNumber })}
                      placeholder="0.80"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fix_years">{strings.fixYears}</Label>
                    <Select
                      value={values.financing?.fix_years ? String(values.financing?.fix_years) : ""}
                      onValueChange={(value) => setValue("financing.fix_years", Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="10">10 years</SelectItem>
                        <SelectItem value="15">15 years</SelectItem>
                        <SelectItem value="20">20 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 font-semibold">{strings.feesTitle}</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="grunderwerb_pct">{strings.grunderwerb}</Label>
                    <Input
                      id="grunderwerb_pct"
                      type="number"
                      step="0.1"
                      {...register("fees.grunderwerb_pct", { setValueAs: parseNumber })}
                      placeholder="6"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notary_pct">{strings.notaryFee}</Label>
                    <Input
                      id="notary_pct"
                      type="number"
                      step="0.1"
                      {...register("fees.notary_pct", { setValueAs: parseNumber })}
                      placeholder="1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agent_pct">{strings.agentFee}</Label>
                    <Input
                      id="agent_pct"
                      type="number"
                      step="0.1"
                      {...register("fees.agent_pct", { valueAsNumber: true, setValueAs: parseOptionalNumber })}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="other">{strings.otherFees}</Label>
                    <Input
                      id="other"
                      type="number"
                      {...register("fees.other", { valueAsNumber: true, setValueAs: parseOptionalNumber })}
                      placeholder="1500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error.message}</AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            {strings.back}
          </Button>

          {currentStep < steps.length ? (
            <Button type="button" onClick={validateAndAdvance}>
              {strings.next}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={!isValid || isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Analyzing..." : strings.runAnalysis}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
