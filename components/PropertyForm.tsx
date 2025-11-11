"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { propertyPayloadSchema, type PropertyPayload, type PredictionResponse } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePredictMutation } from "@/lib/hooks"

const steps = [
  { id: 1, name: "Location", fields: ["country", "plz", "city", "lat", "lon", "property_type"] },
  { id: 2, name: "Details", fields: ["surface_m2", "rooms", "year_built", "condition"] },
  { id: 3, name: "Pricing", fields: ["price_buy", "reno_cost", "expected_rent_month", "holding_months"] },
  { id: 4, name: "Financing", fields: ["financing", "fees"] },
]

interface PropertyFormProps {
  onSuccess?: (data: PropertyPayload, result: PredictionResponse) => void
}

export function PropertyForm({ onSuccess }: PropertyFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const { mutate, isPending, error, data: result } = usePredictMutation()
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<PropertyPayload>({
    resolver: zodResolver(propertyPayloadSchema),
    mode: "onChange",
    defaultValues: {
      country: "DE",
      property_type: "wohnung",
      condition: "average",
      financing: { ltv: 0.8, fix_years: "10" },
      fees: { grunderwerb_pct: 0.06, notary_pct: 0.015, agent_pct: 0.03, other: 1500 },
    },
  })

  const values = watch()
  const currentStepConfig = steps[currentStep - 1]

  const onSubmit = (data: PropertyPayload) => {
    mutate(data, {
      onSuccess: (result) => {
        localStorage.setItem("payload:last", JSON.stringify(data))
        onSuccess?.(data, result)
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6 p-6">
          <h2 className="mb-6 text-lg font-semibold">{currentStepConfig.name}</h2>

          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="plz">PLZ (Postal Code)</Label>
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
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Berlin"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && <span className="text-sm text-red-500">{errors.city.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude (optional)</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    {...register("lat", { valueAsNumber: true })}
                    placeholder="52.532"
                  />
                </div>
                <div>
                  <Label htmlFor="lon">Longitude (optional)</Label>
                  <Input
                    id="lon"
                    type="number"
                    step="0.0001"
                    {...register("lon", { valueAsNumber: true })}
                    placeholder="13.384"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <Select value={values.property_type} onValueChange={(value) => setValue("property_type", value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wohnung">Wohnung (Apartment)</SelectItem>
                    <SelectItem value="haus">Haus (House)</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="gewerbe">Gewerbe (Commercial)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="surface_m2">Surface Area (m²)</Label>
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
                <Label htmlFor="rooms">Number of Rooms</Label>
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
                <Label htmlFor="year_built">Year Built (optional)</Label>
                <Input
                  id="year_built"
                  type="number"
                  {...register("year_built", { valueAsNumber: true })}
                  placeholder="1965"
                />
              </div>

              <div>
                <Label htmlFor="condition">Condition (optional)</Label>
                <Select value={values.condition || ""} onValueChange={(value) => setValue("condition", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="renovated">Renovated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="price_buy">Purchase Price (€)</Label>
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
                <Label htmlFor="reno_cost">Renovation Cost (€)</Label>
                <Input
                  id="reno_cost"
                  type="number"
                  {...register("reno_cost", { valueAsNumber: true })}
                  placeholder="22000"
                  className={errors.reno_cost ? "border-red-500" : ""}
                />
                {errors.reno_cost && <span className="text-sm text-red-500">{errors.reno_cost.message}</span>}
              </div>

              <div>
                <Label htmlFor="expected_rent_month">Expected Rent/Month (€)</Label>
                <Input
                  id="expected_rent_month"
                  type="number"
                  {...register("expected_rent_month", { valueAsNumber: true })}
                  placeholder="1200"
                />
              </div>

              <div>
                <Label htmlFor="holding_months">Holding Period (months)</Label>
                <Input
                  id="holding_months"
                  type="number"
                  {...register("holding_months", { valueAsNumber: true })}
                  placeholder="12"
                  className={errors.holding_months ? "border-red-500" : ""}
                />
                {errors.holding_months && <span className="text-sm text-red-500">{errors.holding_months.message}</span>}
              </div>
            </div>
          )}

          {/* Step 4: Financing */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 font-semibold">Financing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ltv">Loan-to-Value (LTV)</Label>
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
                    <Label htmlFor="fix_years">Fixed Rate Period</Label>
                    <Select
                      value={values.financing.fix_years}
                      onValueChange={(value) => setValue("financing.fix_years", value as any)}
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
                <h3 className="mb-4 font-semibold">Fees</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="grunderwerb_pct">Ground Acquisition Tax (%)</Label>
                    <Input
                      id="grunderwerb_pct"
                      type="number"
                      step="0.001"
                      {...register("fees.grunderwerb_pct", { valueAsNumber: true })}
                      placeholder="0.06"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notary_pct">Notary Fee (%)</Label>
                    <Input
                      id="notary_pct"
                      type="number"
                      step="0.001"
                      {...register("fees.notary_pct", { valueAsNumber: true })}
                      placeholder="0.015"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agent_pct">Agent Fee (%) [optional]</Label>
                    <Input
                      id="agent_pct"
                      type="number"
                      step="0.001"
                      {...register("fees.agent_pct", { valueAsNumber: true })}
                      placeholder="0.03"
                    />
                  </div>
                  <div>
                    <Label htmlFor="other">Other Fees (€) [optional]</Label>
                    <Input
                      id="other"
                      type="number"
                      {...register("fees.other", { valueAsNumber: true })}
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
            Back
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={!isValid || isPending} className="bg-blue-600 hover:bg-blue-700">
              {isPending ? "Analyzing..." : "Analyze Property"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
