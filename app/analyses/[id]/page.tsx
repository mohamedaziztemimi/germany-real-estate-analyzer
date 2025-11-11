"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthGuard } from "@/components/AuthGuard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { DecisionCard } from "@/components/DecisionCard"
import { KpiTiles } from "@/components/KpiTiles"
import { DriversList } from "@/components/DriversList"
import { AssumptionsPanel } from "@/components/AssumptionsPanel"
import { WarningsAlert } from "@/components/WarningsAlert"
import { ExplanationsPanel } from "@/components/ExplanationsPanel"
import { useAnalysis, useUpdateAnalysisMutation, useDeleteAnalysisMutation } from "@/lib/hooks"
import { ArrowLeft, Trash2 } from "lucide-react"

interface AnalysisDetailContentProps {
  id: string
}

function AnalysisDetailContent({ id }: AnalysisDetailContentProps) {
  const { data: analysis, isLoading, error } = useAnalysis(id)
  const { mutate: updateAnalysis, isPending: isUpdating } = useUpdateAnalysisMutation()
  const { mutate: deleteAnalysis, isPending: isDeleting } = useDeleteAnalysisMutation()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const router = useRouter()

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    )
  }

  if (error || !analysis) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">Failed to load analysis</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const handleSave = () => {
    updateAnalysis(
      { id, data: { title, notes } },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
      },
    )
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteAnalysis(id, {
        onSuccess: () => {
          router.push("/analyses")
        },
      })
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/analyses" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Analyses
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
                >
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Edit Analysis</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!title || isUpdating} className="bg-blue-600 hover:bg-blue-700">
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{analysis.title}</h1>
            {analysis.notes && <p className="text-gray-600 mb-4">{analysis.notes}</p>}
            <p className="text-sm text-gray-500">Created {new Date(analysis.created_at).toLocaleDateString()}</p>
          </Card>
        )}

        <div className="space-y-6">
          <DecisionCard prediction={analysis.response} />
          <KpiTiles prediction={analysis.response} />
          <DriversList drivers={analysis.response.drivers} />
          <ExplanationsPanel explanations={analysis.response.explanations} />
          <AssumptionsPanel assumptions={analysis.response.assumptions} />
          <WarningsAlert warnings={analysis.response.warnings} />

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-2">Property Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Location:</span> {analysis.payload.city}, {analysis.payload.plz}
              </div>
              <div>
                <span className="text-gray-600">Type:</span> {analysis.payload.property_type}
              </div>
              <div>
                <span className="text-gray-600">Surface:</span> {analysis.payload.surface_m2} m²
              </div>
              <div>
                <span className="text-gray-600">Rooms:</span> {analysis.payload.rooms}
              </div>
              <div>
                <span className="text-gray-600">Purchase Price:</span> €{analysis.payload.price_buy.toLocaleString()}
              </div>
              <div>
                <span className="text-gray-600">Renovation Cost:</span> €{analysis.payload.reno_cost.toLocaleString()}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default function AnalysisDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <AnalysisDetailContent id={params.id} />
    </AuthGuard>
  )
}
