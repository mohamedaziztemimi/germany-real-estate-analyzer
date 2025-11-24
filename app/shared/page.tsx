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
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{strings.discussionsTitle}</h1>
            <p className="text-sm text-gray-500">{strings.discussionsSubtitle}</p>
          </div>
          <Link href="/analyze">
            <Button className="bg-blue-600 hover:bg-blue-700">{strings.analysesNew}</Button>
          </Link>
        </div>

        {error && (
          <Card className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {strings.discussionsFailed}
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <Card key={idx} className="p-6">
                <Skeleton className="h-5 w-1/4 mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="space-y-4">
            {data.items.map((share) => (
              <Card key={share.id} className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>
                      {strings.discussionsSharedBy} {share.shared_by.email}
                    </span>
                    <span>•</span>
                    <span>{new Date(share.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{share.analysis.title}</h3>
                      {share.message && <p className="text-sm text-gray-600 mt-1">{share.message}</p>}
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span>
                        {strings.analysesDecision}:{" "}
                        <strong className={share.analysis.response.decision === "Buy" ? "text-green-600" : "text-red-600"}>
                          {share.analysis.response.decision}
                        </strong>
                      </span>
                      <span>
                        {strings.analysesROI}: <strong>{(share.analysis.response.roi_estimated * 100).toFixed(1)}%</strong>
                      </span>
                      <span>
                        {strings.analysesConfidence}: <strong>{(share.analysis.response.confidence * 100).toFixed(0)}%</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/shared/${share.id}`}>
                      <Button variant="outline">{strings.discussionsView}</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-500">{strings.discussionsEmpty}</p>
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
