"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAnalyticsSummary } from "@/lib/hooks"
import { AuthGuard } from "@/components/AuthGuard"
import { ChatDrawer } from "@/components/ChatDrawer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, AlertCircle, Target, TrendingUp, ShieldCheck, Percent } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { CountUp } from "@/components/CountUp"
import { fadeUp, fadeScale, staggerChildren } from "@/lib/animations"

function DashboardContent() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { data, isLoading, error } = useAnalyticsSummary()
  const { strings } = useLanguage()
  const totalRequests = data?.total_requests ?? 0
  const showEmptyState = !isLoading && (!data || totalRequests === 0 || !!error)

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{strings.dashboardKicker}</p>
            <h1 className="text-3xl font-bold text-slate-900">{strings.dashboardTitle}</h1>
            <p className="text-sm text-slate-600">{strings.dashboardSubtitle}</p>
          </div>
          <Button
            onClick={() => setIsChatOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <MessageSquare className="h-4 w-4" />
            {strings.askAI}
          </Button>
        </div>

        <motion.div
          variants={staggerChildren(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              label: strings.totalRequests,
              value: isLoading ? null : totalRequests,
              decimals: 0,
              icon: ShieldCheck,
              tone: "text-blue-700 bg-blue-50 ring-blue-100",
            },
            {
              label: strings.avgConfidence,
              value: isLoading ? null : (data?.avg_confidence ?? 0) * 100,
              suffix: "%",
              decimals: 1,
              icon: Target,
              tone: "text-emerald-700 bg-emerald-50 ring-emerald-100",
            },
            {
              label: strings.buyRate,
              value: isLoading ? null : (data?.buy_rate ?? 0) * 100,
              suffix: "%",
              decimals: 1,
              icon: TrendingUp,
              tone: "text-indigo-700 bg-indigo-50 ring-indigo-100",
            },
            {
              label: strings.avgRoi,
              value: isLoading ? null : (data?.avg_roi ?? 0) * 100,
              suffix: "%",
              decimals: 2,
              icon: Percent,
              tone: "text-amber-700 bg-amber-50 ring-amber-100",
            },
          ].map((metric) => {
            const Icon = metric.icon
            return (
              <motion.div
                variants={fadeScale}
                key={metric.label}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${metric.tone}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                {isLoading ? (
                  <Skeleton className="mt-3 h-8 w-20" />
                ) : (
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    <CountUp value={metric.value ?? 0} decimals={metric.decimals ?? 0} suffix={metric.suffix || ""} />
                  </p>
                )}
                <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="block h-full w-full origin-left rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-600"
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {showEmptyState && (
          <Card className="mt-6 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm shadow-slate-200/80">
            <AlertCircle className="h-6 w-6 text-slate-500" />
            <p className="text-base text-slate-600">{strings.noAnalyses}</p>
            <Link href="/analyze">
              <Button className="mt-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300">
                {strings.newAnalysis}
              </Button>
            </Link>
          </Card>
        )}

        {data?.updated_at && !showEmptyState && (
          <p className="mt-4 text-sm text-slate-500">
            {strings.lastUpdated}: {new Date(data.updated_at).toLocaleString()}
          </p>
        )}

        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </main>
  )
}

function DashboardFallback() {
  const { strings } = useLanguage()
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xl shadow-slate-200/80">
          <h2 className="text-2xl font-bold mb-3 text-slate-900">{strings.dashboard}</h2>
          <p className="text-slate-600 mb-6">{strings.dashboardPrompt}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signin">
              <Button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300">
                {strings.signIn}
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="rounded-xl border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-blue-500 hover:text-blue-700">
                {strings.signUp}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard fallback={<DashboardFallback />}>
      <DashboardContent />
    </AuthGuard>
  )
}
