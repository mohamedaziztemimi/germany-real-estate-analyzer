"use client"

import { useState } from "react"
import { PropertyForm } from "@/components/PropertyForm"
import { DecisionCard } from "@/components/DecisionCard"
import { KpiTiles } from "@/components/KpiTiles"
import { DriversList } from "@/components/DriversList"
import { AssumptionsPanel } from "@/components/AssumptionsPanel"
import { WarningsAlert } from "@/components/WarningsAlert"
import { ExplanationsPanel } from "@/components/ExplanationsPanel"
import type { PropertyPayload, PredictionResponse } from "@/lib/schemas"

export default function AnalyzePage() {
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleFormSubmit = (payload: PropertyPayload, result: PredictionResponse) => {
    setResult(result)
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h1 className="mb-6 text-2xl font-bold">Property Analyzer</h1>
              <PropertyForm onSuccess={handleFormSubmit} />
            </div>
          </div>

          {/* Results Section */}
          {submitted && result && (
            <div className="space-y-6">
              <DecisionCard prediction={result} />
              <KpiTiles prediction={result} />
              <DriversList drivers={result.drivers} />
              <ExplanationsPanel explanations={result.explanations} />
              <AssumptionsPanel assumptions={result.assumptions} />
              <WarningsAlert warnings={result.warnings} />
            </div>
          )}

          {!submitted && !result && (
            <div className="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
              <p className="text-center text-gray-500">Fill out the form and submit to see analysis results here.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
