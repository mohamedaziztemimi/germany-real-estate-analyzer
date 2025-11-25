"use client"

import Link from "next/link"
import { AuthGuard } from "@/components/AuthGuard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSharedAnalyses } from "@/lib/hooks"
import { useLanguage } from "@/lib/language-context"

function SharedAnalysesContent() {
  const { data, isLoading, error } = useSharedAnalyses()
  const { strings } = useLanguage()

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-5xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Collaboration</p>
            <h1 className="text-3xl font-bold text-slate-900">{strings.discussionsTitle}</h1>
            <p className="text-sm text-slate-600">{strings.discussionsSubtitle}</p>
          </div>
          <Link href="/analyze">
            <Button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300">
              {strings.analysesNew}
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{strings.discussionsFailed}</Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <Card key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80">
                <Skeleton className="h-5 w-1/4 mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="space-y-4">
            {data.items.map((share) => (
              <Card
                key={share.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>
                      {strings.discussionsSharedBy} {share.shared_by.email}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>{new Date(share.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-slate-900">{share.analysis.title}</h3>
                      {share.message && <p className="text-sm text-slate-600">{share.message}</p>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                        {strings.analysesDecision}: {" "}
                        <strong className={share.analysis.response.decision === "Buy" ? "text-emerald-700" : "text-rose-700"}>
                          {share.analysis.response.decision}
                        </strong>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                        {strings.analysesROI}: <strong>{(share.analysis.response.roi_estimated * 100).toFixed(1)}%</strong>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                        {strings.analysesConfidence}: <strong>{(share.analysis.response.confidence * 100).toFixed(0)}%</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/shared/${share.id}`}>
                      <Button variant="outline" className="rounded-xl border-slate-300 hover:border-blue-500 hover:text-blue-700">
                        {strings.discussionsView}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm shadow-slate-200/80">
            <p className="text-slate-600">{strings.discussionsEmpty}</p>
          </Card>
        )}
      </div>
    </main>
  )
}

export default function SharedAnalysesPage() {
  return (
    <AuthGuard>
      <SharedAnalysesContent />
    </AuthGuard>
  )
}
