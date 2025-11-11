"use client"

import { useAnalyticsSummary } from "@/lib/hooks"
import { AuthGuard } from "@/components/AuthGuard"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function DashboardContent() {
  const { data, isLoading, error } = useAnalyticsSummary()

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Analytics Dashboard</h1>

        {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">Failed to load analytics data</div>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Requests */}
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Requests</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{data?.total_requests?.toLocaleString() || 0}</p>
            )}
          </Card>

          {/* Average Confidence */}
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">
                {data?.avg_confidence ? (data.avg_confidence * 100).toFixed(1) : 0}%
              </p>
            )}
          </Card>

          {/* Buy Rate */}
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Buy Rate</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{data?.buy_rate ? (data.buy_rate * 100).toFixed(1) : 0}%</p>
            )}
          </Card>

          {/* Average ROI */}
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Average ROI</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{data?.avg_roi ? (data.avg_roi * 100).toFixed(2) : 0}%</p>
            )}
          </Card>
        </div>

        {data?.updated_at && (
          <p className="mt-8 text-sm text-gray-500">Last updated: {new Date(data.updated_at).toLocaleString()}</p>
        )}
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
