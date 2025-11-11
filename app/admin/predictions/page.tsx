"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePredictions } from "@/lib/hooks"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"

function PredictionsContent() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = usePredictions(page)

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Predictions Log</h1>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 mb-6">
            <div className="flex gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>Failed to load predictions</p>
            </div>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Decision</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Confidence</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ROI</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              ) : data?.predictions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No predictions yet
                  </td>
                </tr>
              ) : (
                data?.predictions.map((pred) => (
                  <tr key={pred.id}>
                    <td className="px-6 py-4 text-sm font-mono">{pred.user_id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          pred.decision === "Buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pred.decision}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{(pred.confidence * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4 text-sm">{(pred.roi_estimated * 100).toFixed(2)}%</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(pred.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">Total predictions: {data.total}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm">Page {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page * 50 >= data.total}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function PredictionsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <PredictionsContent />
    </AuthGuard>
  )
}
