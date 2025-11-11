"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAnalyticsSummary } from "@/lib/hooks"
import { AuthGuard } from "@/components/AuthGuard"
import { ChatDrawer } from "@/components/ChatDrawer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, AlertCircle } from "lucide-react"
import Link from "next/link"

function DashboardContent() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { data, isLoading, error } = useAnalyticsSummary()
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Button onClick={() => setIsChatOpen(true)} className="bg-blue-600 hover:bg-blue-700" variant="default">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 mb-6">
            <div className="flex gap-2 items-start text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Failed to load analytics data</p>
                <p className="text-sm mt-1">
                  Make sure the backend API is running at {process.env.NEXT_PUBLIC_API_BASE_URL}
                </p>
              </div>
            </div>
          </Card>
        )}

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

        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </main>
  )
}

function DashboardFallback() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-12 shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
          <p className="text-gray-600 mb-6">Sign in to view your analytics dashboard.</p>
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

export default function DashboardPage() {
  return (
    <AuthGuard fallback={<DashboardFallback />}>
      <DashboardContent />
    </AuthGuard>
  )
}
