"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertyPayloadSchema, type PropertyPayload, type PredictionResponse } from "@/lib/schemas"
import { normalizePrediction } from "@/lib/prediction-utils"
import { getMarketDefaults, estimateRenovationBudget, type RenovationLevel } from "@/lib/market-data"
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
    { id: 1, name: strings.stepLocation, fields: ["country", "plz", "city", "district", "property_type"] },
    {
      id: 2,
      name: strings.stepProperty,
      fields: ["surface_m2", "rooms", "year_built", "floor", "condition", "has_elevator", "has_balcony"],
    },
    {
      id: 3,
      name: strings.stepListing,
      fields: ["price_buy", "reno_cost", "listing_year", "listing_quarter", "greix_index", "hpi_index", "mortgage_rate_10y"],
    },
    { id: 4, name: strings.stepFinancing, fields: ["expected_rent_month", "holding_months", "financing", "fees"] },
  ]
  const [currentStep, setCurrentStep] = useState(1)
  const renovationLevel: RenovationLevel = "standard"
  const { mutate, isPending, error } = usePredictMutation()
  const parseOptionalNumber = (value: unknown) => {
    if (value === "" || value === null || typeof value === "undefined") {
      return undefined
    }
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
    setValue,
  } = useForm<PropertyPayload>({
    resolver: zodResolver(propertyPayloadSchema),
    mode: "onChange",
    defaultValues: {
      country: "DE",
      district: "Mitte",
      property_type: "apartment",
      condition: "medium",
      energy_efficiency_class: "C",
      year_built: 1990,
      floor: 0,
      has_elevator: 0,
      has_balcony: 0,
      holding_months: 12,
      listing_year: initialMarket.listing_year,
      listing_quarter: initialMarket.listing_quarter,
      greix_index: initialMarket.greix_index,
      hpi_index: initialMarket.hpi_index,
      mortgage_rate_10y: initialMarket.mortgage_rate_10y,
      reno_cost: 0,
      price_per_m2: 0,
      reno_cost_per_m2: 0,
      uplift_pct: CONDITION_UPLIFT.medium,
      expected_rent_month: 0,
      financing: { ltv: 0.8, fix_years: 10 },
      fees: { grunderwerb_pct: 6, notary_pct: 1.5, agent_pct: 3, other: 1500 },
    },
  })

  const values = watch()
  const cityValue = watch("city")
  const surfaceValue = watch("surface_m2")
  const priceBuyValue = watch("price_buy")
  const renoCostValue = watch("reno_cost")
  const conditionValue = watch("condition")
  const hasElevatorValue = watch("has_elevator")
  const hasBalconyValue = watch("has_balcony")
  const pricePerM2Display = surfaceValue && priceBuyValue ? priceBuyValue / surfaceValue : 0
  const renoCostPerM2Display = surfaceValue ? (renoCostValue ?? 0) / surfaceValue : 0
  const propertyTypeOptions = [
    { value: "apartment", label: language === "de" ? "Apartment" : "Apartment" },
    { value: "wohnung", label: language === "de" ? "Wohnung" : "Apartment (Wohnung)" },
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
    if (!surfaceValue || surfaceValue <= 0 || !priceBuyValue || priceBuyValue <= 0) {
      return
    }
    const pricePerM2 = priceBuyValue / surfaceValue
    setValue("price_per_m2", pricePerM2, { shouldValidate: true })
  }, [surfaceValue, priceBuyValue, setValue])

  useEffect(() => {
    if (!surfaceValue || surfaceValue <= 0) {
      return
    }
    const renoCost = typeof renoCostValue === "number" ? renoCostValue : 0
    setValue("reno_cost_per_m2", surfaceValue ? renoCost / surfaceValue : 0, { shouldValidate: true })
  }, [surfaceValue, renoCostValue, setValue])

  useEffect(() => {
    if (!surfaceValue || surfaceValue <= 0 || !priceBuyValue || priceBuyValue <= 0) {
      return
    }
    if (dirtyFields?.reno_cost) {
      return
    }
    if (renoCostValue && renoCostValue > 0) {
      return
    }
    const normalizedCondition = normalizeConditionValue(conditionValue)
    const pricePerM2 = priceBuyValue / surfaceValue
    const estimate = estimateRenovationBudget({
      surface_m2: surfaceValue,
      condition: normalizedCondition || conditionValue,
      price_buy: priceBuyValue,
      price_per_m2: pricePerM2,
      renovationLevel,
    })
    setValue("reno_cost", estimate.reno_cost, { shouldValidate: true })
    setValue("reno_cost_per_m2", estimate.reno_cost_per_m2, { shouldValidate: true })
  }, [surfaceValue, priceBuyValue, conditionValue, renovationLevel, renoCostValue, dirtyFields, setValue])

  const currentStepConfig = steps[currentStep - 1]

  const onSubmit = (data: PropertyPayload) => {
    // Safety guard: never run analysis until user is on the final step
    if (currentStep < steps.length) {
      setCurrentStep((prev) => Math.min(steps.length, prev + 1))
      return
    }

    const normalizedCondition = normalizeConditionValue(data.condition) || "medium"
    const pricePerM2 = data.surface_m2 ? data.price_buy / data.surface_m2 : 0
    const renoCost = data.reno_cost ?? 0
    const renoCostPerM2 = data.surface_m2 ? renoCost / data.surface_m2 : 0
    const uplift = CONDITION_UPLIFT[normalizedCondition] ?? CONDITION_UPLIFT.medium
    const holdingMonths = data.holding_months ?? 0
    const holdingYears = holdingMonths / 12

    if (!Number.isFinite(pricePerM2) || pricePerM2 <= 0) {
      return
    }

    const payload: PropertyPayload = {
      ...data,
      condition: normalizedCondition,
      has_elevator: data.has_elevator ?? 0,
      has_balcony: data.has_balcony ?? 0,
      price_per_m2: pricePerM2,
      reno_cost: renoCost,
      reno_cost_per_m2: renoCostPerM2,
      uplift_pct: uplift,
      holding_months: holdingMonths,
      expected_rent_month: data.expected_rent_month ?? 0,
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

    ;(payload as any).holding_years = holdingYears

    mutate(payload, {
      onSuccess: (result) => {
        localStorage.setItem("payload:last", JSON.stringify(payload))
        onSuccess?.(payload, normalizePrediction(payload, result))
      },
    })
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Step indicator */}
      <div className="mb-8 flex justify-between">
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
        <Card className="mb-6 p-6">
          <h2 className="mb-6 text-lg font-semibold">{currentStepConfig.name}</h2>

          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="plz">{strings.plz}</Label>
                <Input
                  id="plz"
                  {...register("plz")}
                  placeholder="10115"
                  maxLength={5}
                  className={errors.plz ? "border-red-500" : ""}
                />
                {errors.plz && <span className="text-sm text-red-500">{errors.plz.message}</span>}
              </div>

              <div>
                <Label htmlFor="city">{strings.city}</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Berlin"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <span className="text-sm text-red-500">{errors.city.message}</span>}
              </div>

              <div>
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
                      "Düsseltal",
                      "Eimsbüttel",
                      "Flingern",
                      "Friedrichshain",
                      "Giesing",
                      "Gohlis",
                      "Harlaching",
                      "Harvestehude",
                      "Lindenau",
                      "Mitte",
                      "Neuhausen",
                      "Neukölln",
                      "Oberkassel",
                      "Plagwitz",
                      "Prenzlauer Berg",
                      "Reudnitz",
                      "Schwabing",
                      "Sendling",
                      "Süd",
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

              <div>
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
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="surface_m2">{strings.surface}</Label>
                <Input
                  id="surface_m2"
                  type="number"
                  step="0.1"
                  {...register("surface_m2", { valueAsNumber: true })}
                  placeholder="58"
                  className={errors.surface_m2 ? "border-red-500" : ""}
                />
                {errors.surface_m2 && <span className="text-sm text-red-500">{errors.surface_m2.message}</span>}
              </div>

              <div>
                <Label htmlFor="rooms">{strings.rooms}</Label>
                <Input
                  id="rooms"
                  type="number"
                  step="0.5"
                  {...register("rooms", { valueAsNumber: true })}
                  placeholder="2.5"
                  className={errors.rooms ? "border-red-500" : ""}
                />
                {errors.rooms && <span className="text-sm text-red-500">{errors.rooms.message}</span>}
              </div>

              <div>
                <Label htmlFor="year_built">{strings.yearBuilt}</Label>
                <Input
                  id="year_built"
                  type="number"
                  min="1800"
                  max="2100"
                  {...register("year_built", { valueAsNumber: true })}
                  placeholder="1990"
                  className={errors.year_built ? "border-red-500" : ""}
                />
                {errors.year_built && <span className="text-sm text-red-500">{errors.year_built.message}</span>}
              </div>

              <div>
                <Label htmlFor="floor">{strings.floor}</Label>
                <Input
                  id="floor"
                  type="number"
                  min="-5"
                  {...register("floor", { valueAsNumber: true })}
                  placeholder="3"
                  className={errors.floor ? "border-red-500" : ""}
                />
                {errors.floor && <span className="text-sm text-red-500">{errors.floor.message}</span>}
              </div>

              <div>
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

              <div>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
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
                <div className="flex items-center gap-3">
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

          {/* Step 3: Listing & Market */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="price_buy">{strings.priceBuy}</Label>
                <Input
                  id="price_buy"
                  type="number"
                  {...register("price_buy", { valueAsNumber: true })}
                  placeholder="295000"
                  className={errors.price_buy ? "border-red-500" : ""}
                />
                {errors.price_buy && <span className="text-sm text-red-500">{errors.price_buy.message}</span>}
              </div>

              <div>
                <Label htmlFor="reno_cost">{strings.renoCost}</Label>
                <Input
                  id="reno_cost"
                  type="number"
                  step="1000"
                  {...register("reno_cost", { valueAsNumber: true })}
                  placeholder="50000"
                  className={errors.reno_cost ? "border-red-500" : ""}
                />
                {errors.reno_cost && <span className="text-sm text-red-500">{errors.reno_cost.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="listing_year">{strings.listingYear}</Label>
                  <Input
                    id="listing_year"
                    type="number"
                    min="1900"
                    max="2100"
                    {...register("listing_year", { valueAsNumber: true })}
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
                    {...register("listing_quarter", { valueAsNumber: true })}
                    className={errors.listing_quarter ? "border-red-500" : ""}
                  />
                  {errors.listing_quarter && (
                    <span className="text-sm text-red-500">{errors.listing_quarter.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="greix_index">{strings.greixIndex}</Label>
                  <Input
                    id="greix_index"
                    type="number"
                    step="0.01"
                    {...register("greix_index", { valueAsNumber: true })}
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
                    {...register("hpi_index", { valueAsNumber: true })}
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
                    {...register("mortgage_rate_10y", { valueAsNumber: true })}
                    className={errors.mortgage_rate_10y ? "border-red-500" : ""}
                  />
                  {errors.mortgage_rate_10y && (
                    <span className="text-sm text-red-500">{errors.mortgage_rate_10y.message}</span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-600 space-y-1">
                <p>
                  {strings.pricePerM2}: <strong>{pricePerM2Display > 0 ? pricePerM2Display.toFixed(0) : "—"}</strong>
                </p>
                <p>
                  {strings.renoPerM2}: <strong>{surfaceValue ? renoCostPerM2Display.toFixed(0) : "—"}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Financing & Fees */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="expected_rent_month">{strings.rentMonth}</Label>
                <Input
                  id="expected_rent_month"
                  type="number"
                  {...register("expected_rent_month", {
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      if (value === "" || value === null || typeof value === "undefined") {
                        return 0
                      }
                      return Number(value)
                    },
                  })}
                  placeholder="1200"
                />
              </div>

              <div>
                <Label htmlFor="holding_months">{strings.holdingMonths}</Label>
                <Input
                  id="holding_months"
                  type="number"
                  {...register("holding_months", { valueAsNumber: true })}
                  placeholder="12"
                  className={errors.holding_months ? "border-red-500" : ""}
                />
                {errors.holding_months && <span className="text-sm text-red-500">{errors.holding_months.message}</span>}
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
                      {...register("financing.ltv", { valueAsNumber: true })}
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
                      {...register("fees.grunderwerb_pct", { valueAsNumber: true })}
                      placeholder="6"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notary_pct">{strings.notaryFee}</Label>
                    <Input
                      id="notary_pct"
                      type="number"
                      step="0.1"
                      {...register("fees.notary_pct", { valueAsNumber: true })}
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
            <Button type="button" onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}>
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
