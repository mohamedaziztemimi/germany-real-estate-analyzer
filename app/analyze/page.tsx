"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PropertyForm } from "@/components/PropertyForm"
import { DecisionCard } from "@/components/DecisionCard"
import { KpiTiles } from "@/components/KpiTiles"
import { DriversList } from "@/components/DriversList"
import { AssumptionsPanel } from "@/components/AssumptionsPanel"
import { WarningsAlert } from "@/components/WarningsAlert"
import { ExplanationsPanel } from "@/components/ExplanationsPanel"
import { SaveAnalysisButton } from "@/components/SaveAnalysisButton"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/hooks-auth"
import { useLanguage } from "@/lib/language-context"
import type { PropertyPayload, PredictionResponse } from "@/lib/schemas"

type Point = { x: number; y: number }

function ChartsSection({
  result,
  payload,
  strings,
  language,
  projectionYears,
}: {
  result: PredictionResponse
  payload: PropertyPayload
  strings: Record<string, string>
  language: "en" | "de"
  projectionYears: number
}) {
  const locale = language === "de" ? "de-DE" : "en-US"
  const appreciation =
    (result.assumptions as any)?.annual_appreciation_rate ?? payload.annual_appreciation_rate ?? 0.015
  const holdingYears = Math.max(
    1,
    (payload.holding_years ?? (payload.holding_months ?? 0) / 12) || 1,
  )
  const pricePerM2Purchase = payload.purchase_price ? payload.purchase_price / payload.surface_m2 : payload.price_per_m2 ?? 0
  const marketPricePerM2 = payload.market_price_per_m2 ?? pricePerM2Purchase
  const predictedPricePerM2 = result.price_post_reno_per_m2 ?? 0
  const purchasePrice = payload.purchase_price ?? payload.price_buy ?? 0
  const purchaseCostsRate = payload.purchase_costs_rate ?? 0.1
  const capexOneTime = payload.capex_one_time ?? payload.reno_cost ?? 0
  const totalInvested =
    result.total_initial_investment ?? purchasePrice + purchasePrice * purchaseCostsRate + capexOneTime

  const marketRentPa = payload.market_rent_pa ?? (payload.expected_rent_month ?? 0) * 12
  const operatingCostRate = payload.operating_cost_rate ?? 0.22
  const rentGrowthRate = payload.rent_growth_rate ?? 0.02
  const capexPerYear = payload.capex_per_year ?? 0
  const years = Math.max(1, Math.round(Math.max(holdingYears, projectionYears || 1)))
  const netRentYear1 = marketRentPa * (1 - operatingCostRate)
  const cashflow_per_year =
    result.cashflow_per_year ??
    Array.from({ length: years }, (_, t) => netRentYear1 * Math.pow(1 + rentGrowthRate, t) - capexPerYear)
  const cashflowMax = Math.max(...cashflow_per_year.map((v) => Math.abs(v)), 1)

  const projected: { x: number; y: number }[] = []
  const postRenoValue =
    result.post_reno_value_today ?? predictedPricePerM2 * payload.surface_m2
  for (let i = 0; i <= years; i += 1) {
    projected.push({ x: i, y: postRenoValue * Math.pow(1 + appreciation, i) })
  }
  const maxY = Math.max(...projected.map((pt) => pt.y), postRenoValue, 1)

  const priceComparison =
    payload.renovation_planned === false
      ? [
          { label: strings.priceBuy, value: pricePerM2Purchase, color: "#2563eb" },
          { label: strings.marketPriceLabel, value: marketPricePerM2, color: "#0ea5e9" },
        ]
      : [
          { label: strings.priceBuy, value: pricePerM2Purchase, color: "#2563eb" },
          { label: strings.priceComparisonTitle, value: marketPricePerM2, color: "#0ea5e9" },
          { label: strings.pricePerM2PostReno, value: predictedPricePerM2, color: "#10b981" },
        ]
  const maxPrice = Math.max(...priceComparison.map((p) => p.value || 0), 1)
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
        <h3 className="mb-3 text-lg font-semibold">{strings.priceAppreciationTitle}</h3>
        <svg viewBox="0 0 100 70" className="w-full h-64 text-blue-600">
          {maxY > 0 ? (
            <>
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                points={projected
                  .map((p) => {
                    const x = (p.x / years) * 90 + 5
                    const y = 55 - (p.y / maxY) * 45
                    return `${x},${y}`
                  })
                  .join(" ")}
              />
              {projected.map((p) => {
                const x = (p.x / years) * 90 + 5
                const y = 55 - (p.y / maxY) * 45
                const shouldLabel = years <= 5 || p.x === 0 || p.x === years || p.x === Math.round(years / 2)
                return (
                  <g key={p.x}>
                    <circle cx={x} cy={y} r={1.3} fill="#2563eb" />
                    {shouldLabel && (
                      <text x={x} y={y - 2} fontSize="2.5" fill="#0f172a" textAnchor="middle">
                        {fmt(p.y)}
                      </text>
                    )}
                  </g>
                )
              })}
            </>
          ) : (
            <text x="20" y="32" fontSize="5" fill="#94a3b8">
              No projected values
            </text>
          )}
          <text x="5" y="58" fontSize="3" fill="#64748b">
            0
          </text>
          <text x="95" y="58" fontSize="3" fill="#64748b">
            {years} {strings.chartYearUnit || "yr"}
          </text>
          <text x="5" y="8" fontSize="3" fill="#64748b">
            {fmt(maxY)}
          </text>
        </svg>
        <div className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
          <span>
            {(strings.chartToday || "Today") + ":"} <strong>{fmt(postRenoValue || 0)}</strong>
          </span>
          <span>
            {(strings.chartFuture?.replace("{years}", years.toString()) || "Future") + ":"}{" "}
            <strong>{fmt(projected[projected.length - 1]?.y || 0)}</strong>
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">{strings.cashflowYearsTitle}</h3>
        <div className="space-y-2">
          {cashflow_per_year.map((value, idx) => {
            const width = Math.min(100, (Math.abs(value) / cashflowMax) * 100)
            const positive = value >= 0
            return (
              <div key={`cf-${idx}`} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{strings.yearLabel.replace("{year}", String(idx + 1))}</span>
                  <span className={positive ? "text-emerald-600" : "text-rose-600"}>{fmt(value)}</span>
                </div>
                <div className="h-2 rounded bg-slate-100">
                  <div
                    className={`h-2 rounded ${positive ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">{strings.priceComparisonTitle}</h3>
        <div className="flex flex-col gap-3">
          {priceComparison.map((item) => {
            const width = Math.min(100, (item.value / maxPrice) * 100)
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>{item.label}</span>
                  <span className="font-semibold">{fmt(item.value)}</span>
                </div>
                <div className="h-2 rounded bg-slate-100">
                  <div className="h-2 rounded" style={{ width: `${width}%`, backgroundColor: item.color }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 text-xs text-slate-600">
          <p>
            {strings.totalInvestedLabel}: <strong>{fmt(totalInvested)}</strong>
          </p>
          <p>
            {strings.netRentYear1Label}: <strong>{fmt(netRentYear1)}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  const { strings, language } = useLanguage()
  const { data: authData, isLoading: authLoading } = useAuth()
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [payload, setPayload] = useState<PropertyPayload | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [savePromptDismissed, setSavePromptDismissed] = useState(false)
  const [exitPromptOpen, setExitPromptOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [projectionYears, setProjectionYears] = useState(5)
  const router = useRouter()
  const isAuthenticated = !!authData?.user
  const hasUnsavedAnalysis = submitted && result && payload && !hasSaved

  const handleFormSubmit = (formPayload: PropertyPayload, result: PredictionResponse) => {
    setPayload(formPayload)
    setResult(result)
    setSubmitted(true)
    setHasSaved(false)
    setSavePromptDismissed(false)
  }

  const handleSaveSuccess = (analysisId: string) => {
    setHasSaved(true)
    setSavePromptDismissed(true)
    setSaveDialogOpen(false)
    router.push(`/analyses/${analysisId}`)
  }

  const handleNewAnalysis = () => {
    if (hasUnsavedAnalysis) {
      setExitPromptOpen(true)
      return
    }
    setExitPromptOpen(false)
    setSavePromptDismissed(false)
    setHasSaved(false)
    setSubmitted(false)
    setResult(null)
    setPayload(null)
    setFormKey((prev) => prev + 1) // remount form to clear state and return to step 1
  }

  // Warn on tab close if an analysis is ready but not saved.
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (hasUnsavedAnalysis) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasUnsavedAnalysis])

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Form Section */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80">
              <h1 className="mb-6 text-2xl font-bold">{strings.analysisTitle}</h1>
              <PropertyForm key={formKey} onSuccess={handleFormSubmit} />
            </div>
          </div>

          {/* Results Section */}
          {submitted && result && payload && (
            <div className="space-y-8">
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm font-medium">
                {strings.analysisSuccess}
              </div>
              {hasUnsavedAnalysis && !savePromptDismissed && (
                <Card className="flex flex-col gap-3 border-amber-200 bg-amber-50/70 p-4 shadow-sm shadow-amber-100 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-900">{strings.savePromptTitle}</p>
                    <p className="text-sm text-amber-800">
                      {isAuthenticated ? strings.savePromptBody : strings.savePromptGuestBody}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isAuthenticated ? (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setSaveDialogOpen(true)}>
                        {strings.savePromptCta}
                      </Button>
                    ) : (
                      <>
                        <Link href="/signin?next=/analyze">
                          <Button size="sm" variant="outline">
                            {strings.signIn}
                          </Button>
                        </Link>
                        <Link href="/signup">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            {strings.signUp}
                          </Button>
                        </Link>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setSavePromptDismissed(true)}>
                      {strings.savePromptDismiss}
                    </Button>
                  </div>
                </Card>
              )}
              <div className="flex gap-2">
                <SaveAnalysisButton
                  payload={payload}
                  response={result}
                  onSuccess={handleSaveSuccess}
                  open={saveDialogOpen}
                  onOpenChange={setSaveDialogOpen}
                />
                <Button variant="outline" onClick={handleNewAnalysis}>
                  {strings.newAnalysis}
                </Button>
              </div>
              <DecisionCard prediction={result} />
              <KpiTiles prediction={result} />

              <Card className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm shadow-slate-200/80">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Projection horizon</span>
                  <span className="text-sm text-slate-600">Extend charts beyond your holding period.</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {[1, 3, 5, 10].map((yr) => (
                    <Button
                      key={yr}
                      variant={projectionYears === yr ? "default" : "outline"}
                      onClick={() => setProjectionYears(yr)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                        projectionYears === yr
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                          : "border-slate-300 text-slate-800 hover:border-blue-500 hover:text-blue-700"
                      }`}
                    >
                      {yr}y
                    </Button>
                  ))}
                </div>
              </Card>

              <ChartsSection
                result={result}
                payload={payload}
                strings={strings as any}
                language={language}
                projectionYears={projectionYears}
              />
              <AssumptionsPanel assumptions={result.assumptions} prediction={result} payload={payload} />
              <DriversList drivers={result.drivers} />
              <ExplanationsPanel explanations={result.explanations} />
              <WarningsAlert warnings={result.warnings} />
            </div>
          )}

          {!submitted && !result && (
            <div className="flex items-center justify-center rounded-lg bg-white p-12 shadow-sm">
              <p className="text-center text-gray-500">{strings.analysisEmpty}</p>
            </div>
          )}
        </div>
      </div>
      <Dialog open={exitPromptOpen} onOpenChange={setExitPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{strings.exitPromptTitle}</DialogTitle>
            <DialogDescription>{isAuthenticated ? strings.exitPromptBody : strings.exitPromptGuestBody}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setExitPromptOpen(false)
                setSavePromptDismissed(true)
                setHasSaved(false)
                setSubmitted(false)
                setResult(null)
                setPayload(null)
                setFormKey((prev) => prev + 1)
              }}
            >
              {strings.exitPromptSkip}
            </Button>
            {isAuthenticated ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setExitPromptOpen(false)
                  setSaveDialogOpen(true)
                }}
              >
                {strings.exitPromptSave}
              </Button>
            ) : (
              <>
                <Link href="/signin?next=/analyze">
                  <Button variant="outline">{strings.signIn}</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700">{strings.signUp}</Button>
                </Link>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
