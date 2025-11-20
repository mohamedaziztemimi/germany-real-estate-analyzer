"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalysesList, useDeleteAnalysisMutation } from "@/lib/hooks"
import { AlertCircle, Trash2 } from "lucide-react"

function AnalysisContent() {
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
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Analysis</h1>
          <Link href="/analyze">
            <Button className="bg-blue-600 hover:bg-blue-700">New Analysis</Button>
          </Link>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 mb-6">
            <div className="flex gap-2 text-red-700 items-start">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Failed to load analysis data</p>
                <p className="text-sm mt-1">Make sure the backend API is running</p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </Card>
              ))}
            </>
          ) : data?.items.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No analysis available yet.</p>
              <Link href="/analyze" className="mt-4 inline-block">
                <Button className="bg-blue-600 hover:bg-blue-700">Analyze Property</Button>
              </Link>
            </Card>
          ) : (
            data?.items.map((analysis) => (
              <Card
                key={analysis.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/analyses/${analysis.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{analysis.title}</h3>
                    {analysis.notes && <p className="text-gray-600 text-sm mb-3">{analysis.notes}</p>}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                        Decision:{" "}
                        <strong className={analysis.response.decision === "Buy" ? "text-green-600" : "text-red-600"}>
                          {analysis.response.decision}
                        </strong>
                      </span>
                      <span>
                        ROI: <strong>{(analysis.response.roi_estimated * 100).toFixed(2)}%</strong>
                      </span>
                      <span>
                        Confidence: <strong>{(analysis.response.confidence * 100).toFixed(0)}%</strong>
                      </span>
                      <span className="ml-auto">{new Date(analysis.created_at).toLocaleDateString()}</span>
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
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {data && data.total > (data.page_size || 20) && (
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {Math.ceil(data.total / (data.page_size || 20))}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(data.total / (data.page_size || 20))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

function AnalysisFallback() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-12 shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4">My Analysis</h2>
          <p className="text-gray-600 mb-6">Sign in to view and manage your saved analysis.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signin">
              <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">Sign Up</Button>
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
