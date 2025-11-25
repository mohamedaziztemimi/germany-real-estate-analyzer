"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Download, MessageCircle, Share2, ThumbsUp, Trash2 } from "lucide-react"

import { AuthGuard } from "@/components/AuthGuard"
import { DecisionCard } from "@/components/DecisionCard"
import { KpiTiles } from "@/components/KpiTiles"
import { DriversList } from "@/components/DriversList"
import { AssumptionsPanel } from "@/components/AssumptionsPanel"
import { ExplanationsPanel } from "@/components/ExplanationsPanel"
import { WarningsAlert } from "@/components/WarningsAlert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  useAnalysis,
  useUpdateAnalysisMutation,
  useDeleteAnalysisMutation,
  useShareAnalysisMutation,
  useShare,
  useShareComments,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
} from "@/lib/hooks"
import { normalizePrediction } from "@/lib/prediction-utils"
import { generateAnalysisPdf } from "@/lib/analysis-pdf"
import { ChatDrawer } from "@/components/ChatDrawer"
import { useAuth } from "@/lib/hooks-auth"
import { useLanguage } from "@/lib/language-context"
import type { PropertyPayload, PredictionResponse } from "@/lib/schemas"

interface AnalysisDetailContentProps {
  id: string
}

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
      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{strings.chartProjected}</h3>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
            {maxYears} {yearUnit}
          </span>
        </div>
        <div className="mt-3 overflow-hidden rounded-xl bg-gradient-to-b from-blue-50 via-white to-slate-50 ring-1 ring-slate-100">
          <svg viewBox="0 0 100 60" className="h-48 w-full text-blue-600">
            {maxY > 0 ? (
              <>
                <defs>
                  <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  fill="url(#lineFill)"
                  points={projected
                    .map((p) => {
                      const x = (p.x / maxYears) * 90 + 5
                      const y = 55 - (p.y / maxY) * 45
                      return `${x},${y}`
                    })
                    .join(" ") + ` 95,55 5,55`}
                />
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
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
                const shouldLabel =
                  maxYears <= 5 || p.x === 0 || p.x === maxYears || p.x === Math.round(maxYears / 2)
                return (
                  <g key={p.x}>
                    <circle cx={x} cy={y} r={2} fill="#1d4ed8" className="transition-transform duration-150 group-hover:scale-110" />
                    {shouldLabel && (
                      <text x={x} y={y - 2.5} fontSize="3" fill="#0f172a" textAnchor="middle">
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
              {maxYears} {yearUnit}
            </text>
          </svg>
        </div>
        <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 ring-1 ring-blue-100">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {strings.chartToday}: <strong className="text-slate-900">{fmt(postRenoValue || 0)}</strong>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {strings.chartFuture.replace("{years}", horizonYears.toFixed(1)).replace("{unit}", yearUnit)}{" "}
            <strong className="text-slate-900">{fmt(projected[projected.length - 1]?.y || 0)}</strong>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">{strings.chartInvest}</h3>
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
          <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-700 shadow-inner shadow-slate-200">
            {fmt(totalInvested)}
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          {pieParts.map((p) => (
            <div key={p.label} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: p.color }} />
              <span className="flex-1">{p.label}</span>
              <span className="font-semibold">{fmt(p.value)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">{strings.chartDrivers}</h3>
        <div className="space-y-3">
          {driverItems.map((d) => {
            const width = Math.min(100, Math.abs(d.value) * 100)
            const color = d.value >= 0 ? "bg-emerald-500" : "bg-rose-500"
            return (
              <div key={d.label} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{d.label}</span>
                  <span>{d.value.toFixed(2)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-slate-100 ring-1 ring-slate-100">
                  <div
                    className={`h-2 rounded transition-[width,transform] duration-500 ease-out ${color}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">{strings.chartRoiScenarios}</h3>
        <div className="flex h-40 items-end gap-4">
          {roiScenarios.map((s) => {
            const height = Math.min(100, Math.max(-100, s.value * 100))
            const positive = height >= 0
            return (
              <div key={s.label} className="flex-1 text-center text-sm text-slate-700">
                <div className="relative h-28 w-full overflow-hidden rounded bg-slate-100 ring-1 ring-slate-100">
                  <div
                    className={`absolute left-1/4 w-1/2 rounded transition-[height,bottom] duration-500 ease-out ${
                      positive ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{ height: `${Math.abs(height)}%`, bottom: positive ? "0" : `${Math.abs(height)}%` }}
                  />
                </div>
                <div className="mt-2 font-semibold">{s.label}</div>
                <div className="text-xs text-slate-500">{(s.value * 100).toFixed(1)}%</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function AnalysisDetailContent({ id }: AnalysisDetailContentProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: authData } = useAuth()
  const { strings, language } = useLanguage()
  const [projectionYears, setProjectionYears] = useState(5)
  const { data: analysis, isLoading, error } = useAnalysis(id)
  const { mutate: updateAnalysis, isPending: isUpdating } = useUpdateAnalysisMutation()
  const { mutate: deleteAnalysis, isPending: isDeleting } = useDeleteAnalysisMutation()
  const { mutate: shareAnalysis, isPending: isSharing } = useShareAnalysisMutation()
  const { mutate: addComment, isPending: isCommenting } = useAddCommentMutation()
  const { mutate: deleteCommentMutation } = useDeleteCommentMutation()
  const { mutate: toggleCommentLike } = useToggleCommentLikeMutation()
  const shareId = analysis?.share_id ?? undefined
  const { data: shareDetail } = useShare(shareId)
  const { data: comments } = useShareComments(shareId)

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareMessage, setShareMessage] = useState("")
  const [newComment, setNewComment] = useState("")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null)
  const currentUser = authData?.user

  if (isLoading) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-10">
          <Skeleton className="mb-6 h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    )
  }

  if (error || !analysis) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-10">
          <Alert className="border-rose-200 bg-rose-50">
            <AlertDescription className="text-rose-700">Failed to load analysis</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const normalizedPrediction = normalizePrediction(analysis.payload, analysis.response)

  const handleSave = () => {
    updateAnalysis(
      { id, data: { title, notes } },
      {
        onSuccess: () => setIsEditing(false),
      },
    )
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteAnalysis(id, {
        onSuccess: () => router.push("/analyses"),
      })
    }
  }

  const handleShare = () => {
    shareAnalysis(
      { analysisId: id, message: shareMessage },
      {
        onSuccess: (share) => {
          setIsShareDialogOpen(false)
          setShareMessage("")
          queryClient.invalidateQueries({ queryKey: ["analyses", "shares", share.id] })
        },
      },
    )
  }

  const handleCommentSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!shareId || !newComment.trim()) return
    addComment(
      { shareId, body: newComment.trim() },
      {
        onSuccess: () => setNewComment(""),
      },
    )
  }

  const handleCommentDelete = (commentId: string) => {
    if (!shareId) return
    if (!confirm("Delete this message?")) return
    setDeletingCommentId(commentId)
    deleteCommentMutation(
      { shareId, commentId },
      {
        onSettled: () => setDeletingCommentId(null),
      },
    )
  }

  const handleCommentLike = (commentId: string) => {
    if (!shareId) return
    setLikingCommentId(commentId)
    toggleCommentLike(
      { shareId, commentId },
      {
        onSettled: () => setLikingCommentId(null),
      },
    )
  }

  const handlePdfDownload = async () => {
    setIsGeneratingPdf(true)
    try {
      await generateAnalysisPdf(analysis, normalizedPrediction)
    } catch (err) {
      console.error("Failed to generate analysis PDF", err)
      alert("Unable to generate the PDF right now. Please try again in a moment.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/analyses" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis
          </Link>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTitle(analysis.title)
                    setNotes(analysis.notes || "")
                    setIsEditing(true)
                  }}
                  className="rounded-xl border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-blue-500 hover:text-blue-700"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShareMessage(shareDetail?.message ?? "")
                    setIsShareDialogOpen(true)
                  }}
                  className="rounded-xl border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:border-blue-500 hover:text-blue-700"
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  {analysis.share_id ? "Update Share" : "Share"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white" />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="bg-white" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!title || isUpdating} className="rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-slate-900">{analysis.title}</h1>
              {analysis.notes && <p className="text-slate-600">{analysis.notes}</p>}
              <p className="text-xs text-slate-500">Created {new Date(analysis.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <DecisionCard prediction={normalizedPrediction} />
          <KpiTiles prediction={normalizedPrediction} />
          <Card className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
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
            result={normalizedPrediction as any}
            payload={analysis.payload as any}
            strings={strings as any}
            language={language}
            projectionYears={projectionYears}
          />
          <DriversList drivers={normalizedPrediction.drivers} />
          <ExplanationsPanel explanations={normalizedPrediction.explanations} />
          <AssumptionsPanel assumptions={normalizedPrediction.assumptions} prediction={normalizedPrediction} payload={analysis.payload} />
          <WarningsAlert warnings={normalizedPrediction.warnings} />

          <Card className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Property Details</h3>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-slate-700">
              <div>
                <span className="text-slate-500">Location:</span> {analysis.payload.city}, {analysis.payload.plz}
              </div>
              <div>
                <span className="text-slate-500">Type:</span> {analysis.payload.property_type}
              </div>
              <div>
                <span className="text-slate-500">Surface:</span> {analysis.payload.surface_m2} m²
              </div>
              <div>
                <span className="text-slate-500">Rooms:</span> {analysis.payload.rooms}
              </div>
              <div>
                <span className="text-slate-500">Purchase Price:</span> €{analysis.payload.price_buy.toLocaleString("de-DE")}
              </div>
              <div>
                <span className="text-slate-500">Renovation Cost:</span> €{analysis.payload.reno_cost.toLocaleString("de-DE")}
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Download Analysis PDF</h3>
              <p className="text-sm text-slate-600">Generate a shareable memo with the property data and model highlights.</p>
            </div>
            <Button
              onClick={handlePdfDownload}
              disabled={isGeneratingPdf}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <Download className="mr-2 h-4 w-4" />
              {isGeneratingPdf ? "Preparing..." : "Download PDF"}
            </Button>
          </Card>

          {shareId && shareDetail && (
            <Card className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Shared with workspace</h3>
                <p className="text-sm text-slate-600">
                  Shared by {shareDetail.shared_by.email} on {new Date(shareDetail.created_at).toLocaleString()}
                </p>
                {shareDetail.message && <p className="mt-2 text-sm text-slate-700">{shareDetail.message}</p>}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      Discussion
                    </h4>
                    <p className="text-sm text-slate-600">Share feedback and ask follow-up questions.</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-2 font-medium text-slate-900">
                      <MessageCircle className="h-4 w-4" />
                      {comments?.length ?? 0} replies
                    </span>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {comments && comments.length > 0 ? (
                    comments.map((comment) => {
                      const canDeleteComment =
                        currentUser && (currentUser.role === "admin" || currentUser.id === comment.user.id)
                      const liked = comment.liked_by_me
                      return (
                        <article
                          key={comment.id}
                          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                {comment.user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{comment.user.email}</p>
                                <p className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            {canDeleteComment && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-slate-500 hover:text-rose-600"
                                disabled={deletingCommentId === comment.id}
                                onClick={() => handleCommentDelete(comment.id)}
                                aria-label="Delete message"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-slate-800">{comment.body}</p>
                          <div className="mt-4 flex items-center gap-4 text-sm">
                            <button
                              type="button"
                              onClick={() => handleCommentLike(comment.id)}
                              disabled={likingCommentId === comment.id}
                              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                liked
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              }`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} />
                              <span>{comment.likes_count}</span>
                              <span className="sr-only">Like message</span>
                            </button>
                            {comment.likes_count > 0 && (
                              <span className="text-xs text-slate-500">
                                {comment.likes_count} {comment.likes_count === 1 ? "like" : "likes"}
                              </span>
                            )}
                          </div>
                        </article>
                      )
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
                      <p className="text-sm font-medium text-slate-700">No messages yet.</p>
                      <p className="text-sm text-slate-500">Start the conversation by sharing your insights.</p>
                    </div>
                  )}
                </div>
                <form className="mt-6 space-y-3" onSubmit={handleCommentSubmit}>
                  <Label htmlFor="discussion-message" className="text-sm font-medium text-slate-700">
                    Post a message
                  </Label>
                  <Textarea
                    id="discussion-message"
                    placeholder="Share an update or ask a question..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isCommenting}
                    rows={3}
                    className="bg-white"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{currentUser?.email}</span>
                    <Button type="submit" disabled={!newComment.trim() || isCommenting} className="rounded-xl">
                      {isCommenting ? "Posting..." : "Publish"}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{analysis.share_id ? "Update shared analysis" : "Share analysis"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Sharing makes this analysis visible to every workspace user.</p>
            <div>
              <Label htmlFor="share-message">Message (optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Give readers some context..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSharing} className="rounded-xl bg-blue-600 text-white hover:bg-blue-500">
              {isSharing ? "Sharing..." : analysis.share_id ? "Update share" : "Share analysis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-500"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        analysisPayload={analysis.payload}
        analysisResponse={analysis.response}
      />
    </main>
  )
}

export default function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return (
    <AuthGuard>
      <AnalysisDetailContent id={resolvedParams.id} />
    </AuthGuard>
  )
}

