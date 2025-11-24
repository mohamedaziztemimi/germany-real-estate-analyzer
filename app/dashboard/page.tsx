"use client"

import { useState } from "react"
import { useAnalyticsSummary } from "@/lib/hooks"
import { AuthGuard } from "@/components/AuthGuard"
import { ChatDrawer } from "@/components/ChatDrawer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

function DashboardContent() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { data, isLoading, error } = useAnalyticsSummary()
  const { strings } = useLanguage()
  const totalRequests = data?.total_requests ?? 0
  const showEmptyState = !isLoading && (!data || totalRequests === 0 || !!error)

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{strings.dashboardTitle}</h1>
          <Button onClick={() => setIsChatOpen(true)} className="bg-blue-600 hover:bg-blue-700" variant="default">
            <MessageSquare className="h-4 w-4 mr-2" />
            {strings.askAI}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">{strings.totalRequests}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{totalRequests.toLocaleString()}</p>
            )}
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">{strings.avgConfidence}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">
                {data?.avg_confidence ? (data.avg_confidence * 100).toFixed(1) : 0}%
              </p>
            )}
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">{strings.buyRate}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{data?.buy_rate ? (data.buy_rate * 100).toFixed(1) : 0}%</p>
            )}
          </Card>

          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">{strings.avgRoi}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{data?.avg_roi ? (data.avg_roi * 100).toFixed(2) : 0}%</p>
            )}
          </Card>
        </div>

        {showEmptyState && (
          <Card className="p-12 text-center mt-12">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <AlertCircle className="h-6 w-6" />
              <p className="text-base">{strings.noAnalyses}</p>
            </div>
          </Card>
        )}

        {data?.updated_at && !showEmptyState && (
          <p className="mt-8 text-sm text-gray-500">
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
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-12 shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4">{strings.dashboard}</h2>
          <p className="text-gray-600 mb-6">{strings.dashboardPrompt}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/signin">
              <Button className="bg-blue-600 hover:bg-blue-700">{strings.signIn}</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline">{strings.signUp}</Button>
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
