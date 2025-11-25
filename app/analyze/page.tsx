"use client"

import Link from "next/link"
import { useState } from "react"
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
  const horizonYears = Math.max(1, projectionYears || 1)
  const holdingYears = (payload.holding_months ?? 12) / 12
  const postRenoValue =
    result.post_reno_value_today ??
    (result.price_post_reno_per_m2 && payload.surface_m2 ? result.price_post_reno_per_m2 * payload.surface_m2 : 0)
  const purchasePrice = payload.price_buy ?? 0
  const renoCost = payload.reno_cost ?? 0
  const feesTotal = purchasePrice * 0.105 + (payload.fees?.other ?? 0)
  const totalInvested = purchasePrice + renoCost + feesTotal

  const projected: Point[] = []
  const maxYears = Math.max(1, Math.ceil(horizonYears))
  const maxYBase = Math.max(postRenoValue, 1)
  for (let i = 0; i <= maxYears; i++) {
    const y = postRenoValue * Math.pow(1 + appreciation, i)
    projected.push({ x: i, y })
  }
  const maxY = Math.max(...projected.map((pt) => pt.y), maxYBase)

  const driversMap: Record<string, number> = {}
  const driversArr = Array.isArray(result.drivers) ? result.drivers : []
  driversArr.forEach((d) => {
    driversMap[d.feature] = d.effect
  })
  const driverItems = [
    { label: strings.driverGreix, value: driversMap["market_greix_index"] ?? 0 },
    { label: strings.driverHpi, value: driversMap["market_hpi_index"] ?? 0 },
    { label: strings.driverUplift, value: driversMap["projected_uplift_pct"] ?? 0 },
    { label: strings.driverCostIntensity, value: driversMap["renovation_cost_intensity"] ?? 0 },
  ]

  const roiScenario = (rate: number) => {
    const future = postRenoValue * Math.pow(1 + rate, horizonYears)
    return totalInvested ? (future - totalInvested) / totalInvested : 0
  }
  const roiScenarios = [
    { label: strings.chartPessimistic, value: roiScenario(appreciation - 0.01) },
    { label: strings.chartBase, value: roiScenario(appreciation) },
    { label: strings.chartOptimistic, value: roiScenario(appreciation + 0.01) },
  ]

  const pieParts = [
    {
      label: strings.chartInvestPurchase || (language === "de" ? "Kaufpreis" : "Purchase price"),
      value: purchasePrice,
      color: "#2563eb",
    },
    {
      label: strings.chartInvestRenovation || (language === "de" ? "Sanierung" : "Renovation"),
      value: renoCost,
      color: "#10b981",
    },
    {
      label: strings.chartInvestFees || (language === "de" ? "Nebenkosten" : "Acquisition fees"),
      value: feesTotal,
      color: "#f97316",
    },
  ].filter((p) => p.value > 0)
  const pieTotal = pieParts.reduce((sum, p) => sum + p.value, 0) || 1
  let pieOffset = 0
  const yearUnit = strings.chartYearUnit || (language === "de" ? "J" : "yr")
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">{strings.chartProjected}</h3>
        <svg viewBox="0 0 100 60" className="w-full h-48 text-blue-600">
          {maxY > 0 ? (
            <>
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                points={projected
                  .map((p) => {
                    const x = (p.x / maxYears) * 90 + 5
                    const y = 55 - (p.y / maxY) * 45
                    return `${x},${y}`
                  })
                  .join(" ")}
              />
              {projected.map((p) => {
                const x = (p.x / maxYears) * 90 + 5
                const y = 55 - (p.y / maxY) * 45
                return <circle key={p.x} cx={x} cy={y} r={1.3} fill="#2563eb" />
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
            {maxYears} {yearUnit}
          </text>
          <text x="5" y="8" fontSize="3" fill="#64748b">
            {fmt(maxY)}
          </text>
              {projected.map((p) => {
                const x = (p.x / maxYears) * 90 + 5
                const y = 55 - (p.y / maxY) * 45
                const shouldLabel =
                  maxYears <= 5 || p.x === 0 || p.x === maxYears || p.x === Math.round(maxYears / 2)
                return (
                  <text key={`val-${p.x}`} x={x} y={y - 2} fontSize="2.5" fill="#0f172a" textAnchor="middle">
                    {shouldLabel ? fmt(p.y) : ""}
                  </text>
                )
              })}
        </svg>
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:justify-between text-xs text-slate-600">
          <span>
            {strings.chartToday}: <strong>{fmt(postRenoValue || 0)}</strong>
          </span>
          <span>
            {strings.chartFuture
              .replace("{years}", horizonYears.toFixed(1))
              .replace("{unit}", yearUnit)}{" "}
            <strong>{fmt(projected[projected.length - 1]?.y || 0)}</strong>
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">{strings.chartInvest}</h3>
        <div className="relative mx-auto h-40 w-40">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backgroundImage: `conic-gradient(${pieParts
                .map((p) => {
                  const start = (pieOffset / pieTotal) * 360
                  const angle = (p.value / pieTotal) * 360
                  pieOffset += p.value
                  return `${p.color} ${start}deg ${start + angle}deg`
                })
                .join(",")})`,
            }}
          />
          <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-slate-700">
            €{Math.round(totalInvested).toLocaleString(locale)}
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm text-slate-700">
          {pieParts.map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: p.color }} />
              <span className="flex-1">{p.label}</span>
              <span className="font-semibold">€{Math.round(p.value).toLocaleString(locale)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">{strings.chartDrivers}</h3>
        <div className="space-y-2">
          {driverItems.map((d) => {
            const width = Math.min(100, Math.abs(d.value) * 100)
            const color = d.value >= 0 ? "bg-emerald-500" : "bg-rose-500"
            return (
              <div key={d.label}>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{d.label}</span>
                  <span>{d.value.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded">
                  <div className={`h-2 rounded ${color}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">{strings.chartRoiScenarios}</h3>
        <div className="flex items-end gap-4 h-40">
          {roiScenarios.map((s) => {
            const height = Math.min(100, Math.max(-100, s.value * 100))
            const positive = height >= 0
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center text-sm text-slate-700">
                <div className="relative w-full h-28 bg-slate-100 rounded">
                  <div
                    className={`absolute bottom-14 left-1/4 w-1/2 rounded ${
                      positive ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{ height: `${Math.abs(height)}%`, bottom: positive ? "0" : `${Math.abs(height)}%` }}
                  />
                </div>
                <span className="mt-2 font-semibold">{s.label}</span>
                <span className="text-xs text-slate-500">{(s.value * 100).toFixed(1)}%</span>
              </div>
            )
          })}
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
  const [formKey, setFormKey] = useState(0)
  const [projectionYears, setProjectionYears] = useState(5)
  const router = useRouter()
  const isAuthenticated = !!authData?.user
  const showAuthReminder = !authLoading && !isAuthenticated

  const handleFormSubmit = (formPayload: PropertyPayload, result: PredictionResponse) => {
    setPayload(formPayload)
    setResult(result)
    setSubmitted(true)
  }

  const handleSaveSuccess = (analysisId: string) => {
    router.push(`/analyses/${analysisId}`)
  }

  const handleNewAnalysis = () => {
    setSubmitted(false)
    setResult(null)
    setPayload(null)
    setFormKey((prev) => prev + 1) // remount form to clear state and return to step 1
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80">
              <h1 className="mb-6 text-2xl font-bold">{strings.analysisTitle}</h1>
              <PropertyForm key={formKey} onSuccess={handleFormSubmit} />
            </div>
          </div>

          {/* Results Section */}
          {submitted && result && payload && (
            <div className="space-y-6">
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm font-medium">
                {strings.analysisSuccess}
              </div>
              {showAuthReminder && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>{strings.analysisGuestNote}</span>
                    <div className="flex gap-2">
                      <Link href="/signin?next=/analyze">
                        <Button variant="outline" size="sm">
                          {strings.signIn}
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          {strings.signUp}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <SaveAnalysisButton payload={payload} response={result} onSuccess={handleSaveSuccess} />
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
              <DriversList drivers={result.drivers} />
              <ExplanationsPanel explanations={result.explanations} />
              <AssumptionsPanel assumptions={result.assumptions} prediction={result} payload={payload} />
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
    </main>
  )
}
