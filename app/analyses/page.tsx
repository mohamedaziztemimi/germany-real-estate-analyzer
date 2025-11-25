"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalysesList, useDeleteAnalysisMutation } from "@/lib/hooks"
import { useLanguage } from "@/lib/language-context"
import { AlertCircle, Trash2 } from "lucide-react"

function AnalysisContent() {
  const { strings } = useLanguage()
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useAnalysesList(page)
  const { mutate: deleteAnalysis, isPending: isDeleting } = useDeleteAnalysisMutation()
  const router = useRouter()

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteAnalysis(id, {
        onSuccess: () => {
          router.refresh()
        },
      })
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Library</p>
            <h1 className="text-3xl font-bold text-slate-900">{strings.analysesTitle}</h1>
            <p className="text-sm text-slate-600">Review and manage every saved analysis in one view.</p>
          </div>
          <Link href="/analyze">
            <Button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300">
              {strings.analysesNew}
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span className="font-medium">{strings.analysesFailed}</span>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))
          ) : data?.items.length === 0 ? (
            <Card className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm shadow-slate-200/80">
              <p className="text-slate-600">{strings.analysesEmpty}</p>
              <Link href="/analyze" className="mt-4 inline-block">
                <Button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300">
                  {strings.analysesCta}
                </Button>
              </Link>
            </Card>
          ) : (
            data?.items.map((analysis) => (
              <Card
                key={analysis.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                onClick={() => router.push(`/analyses/${analysis.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">{analysis.title}</h3>
                    {analysis.notes && <p className="text-slate-600 text-sm">{analysis.notes}</p>}
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                        {strings.analysesDecision}:{" "}
                        <strong className={analysis.response.decision === "Buy" ? "text-emerald-700" : "text-rose-700"}>
                          {analysis.response.decision}
                        </strong>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                        {strings.analysesROI}: <strong>{(analysis.response.roi_estimated * 100).toFixed(2)}%</strong>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 ring-1 ring-slate-200">
                        {strings.analysesConfidence}:{" "}
                        <strong>{(analysis.response.confidence * 100).toFixed(0)}%</strong>
                      </span>
                      <span className="ml-auto text-xs text-slate-500">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(analysis.id)
                    }}
                    disabled={isDeleting}
                    className="text-slate-500 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {data && data.total > (data.page_size || 20) && (
          <div className="mt-8 flex justify-center gap-2 text-sm text-slate-700">
            <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              {strings.paginationPrev}
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {Math.ceil(data.total / (data.page_size || 20))}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(data.total / (data.page_size || 20))}
            >
              {strings.paginationNext}
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

function AnalysisFallback() {
  const { strings } = useLanguage()
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xl shadow-slate-200/80">
          <h2 className="text-2xl font-bold mb-3 text-slate-900">{strings.analysesSigninTitle}</h2>
          <p className="text-slate-600 mb-6">{strings.analysesSigninDesc}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signin">
              <Button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300">
                {strings.analysesSignin}
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="rounded-xl border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-blue-500 hover:text-blue-700">
                {strings.analysesSignup}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function AnalysisPage() {
  return (
    <AuthGuard fallback={<AnalysisFallback />}>
      <AnalysisContent />
    </AuthGuard>
  )
}
