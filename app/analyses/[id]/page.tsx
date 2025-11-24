"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Download, MessageCircle, Share2, ThumbsUp, Trash2 } from "lucide-react"

import { AuthGuard } from "@/components/AuthGuard"
import { DecisionCard } from "@/components/DecisionCard"
import { KpiTiles } from "@/components/KpiTiles"
import { DriversList } from "@/components/DriversList"
import { AssumptionsPanel } from "@/components/AssumptionsPanel"
import { ExplanationsPanel } from "@/components/ExplanationsPanel"
import { WarningsAlert } from "@/components/WarningsAlert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  useAnalysis,
  useUpdateAnalysisMutation,
  useDeleteAnalysisMutation,
  useShareAnalysisMutation,
  useShare,
  useShareComments,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
} from "@/lib/hooks"
import { normalizePrediction } from "@/lib/prediction-utils"
import { generateAnalysisPdf } from "@/lib/analysis-pdf"
import { ChatDrawer } from "@/components/ChatDrawer"
import { useAuth } from "@/lib/hooks-auth"

interface AnalysisDetailContentProps {
  id: string
}

function AnalysisDetailContent({ id }: AnalysisDetailContentProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: authData } = useAuth()
  const { data: analysis, isLoading, error } = useAnalysis(id)
  const { mutate: updateAnalysis, isPending: isUpdating } = useUpdateAnalysisMutation()
  const { mutate: deleteAnalysis, isPending: isDeleting } = useDeleteAnalysisMutation()
  const { mutate: shareAnalysis, isPending: isSharing } = useShareAnalysisMutation()
  const { mutate: addComment, isPending: isCommenting } = useAddCommentMutation()
  const { mutate: deleteCommentMutation } = useDeleteCommentMutation()
  const { mutate: toggleCommentLike } = useToggleCommentLikeMutation()
  const shareId = analysis?.share_id ?? undefined
  const { data: shareDetail } = useShare(shareId)
  const { data: comments } = useShareComments(shareId)

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [notes, setNotes] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [shareMessage, setShareMessage] = useState("")
  const [newComment, setNewComment] = useState("")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null)
  const currentUser = authData?.user

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

  const normalizedPrediction = normalizePrediction(analysis.payload, analysis.response)

  const handleSave = () => {
    updateAnalysis(
      { id, data: { title, notes } },
      {
        onSuccess: () => setIsEditing(false),
      },
    )
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this analysis?")) {
      deleteAnalysis(id, {
        onSuccess: () => router.push("/analyses"),
      })
    }
  }

  const handleShare = () => {
    shareAnalysis(
      { analysisId: id, message: shareMessage },
      {
        onSuccess: (share) => {
          setIsShareDialogOpen(false)
          setShareMessage("")
          queryClient.invalidateQueries({ queryKey: ["analyses", "shares", share.id] })
        },
      },
    )
  }

  const handleCommentSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!shareId || !newComment.trim()) return
    addComment(
      { shareId, body: newComment.trim() },
      {
        onSuccess: () => setNewComment(""),
      },
    )
  }

  const handleCommentDelete = (commentId: string) => {
    if (!shareId) return
    if (!confirm("Delete this message?")) return
    setDeletingCommentId(commentId)
    deleteCommentMutation(
      { shareId, commentId },
      {
        onSettled: () => setDeletingCommentId(null),
      },
    )
  }

  const handleCommentLike = (commentId: string) => {
    if (!shareId) return
    setLikingCommentId(commentId)
    toggleCommentLike(
      { shareId, commentId },
      {
        onSettled: () => setLikingCommentId(null),
      },
    )
  }

  const handlePdfDownload = async () => {
    setIsGeneratingPdf(true)
    try {
      await generateAnalysisPdf(analysis, normalizedPrediction)
    } catch (err) {
      console.error("Failed to generate analysis PDF", err)
      alert("Unable to generate the PDF right now. Please try again in a moment.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/analyses" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Analysis
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShareMessage(shareDetail?.message ?? "")
                    setIsShareDialogOpen(true)
                  }}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {analysis.share_id ? "Update Share" : "Share"}
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
          <Card className="p-6">
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
          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-2">{analysis.title}</h1>
            {analysis.notes && <p className="text-gray-600 mb-4">{analysis.notes}</p>}
            <p className="text-sm text-gray-500">Created {new Date(analysis.created_at).toLocaleDateString()}</p>
          </Card>
        )}

        <div className="space-y-6">
          <DecisionCard prediction={normalizedPrediction} />
          <KpiTiles prediction={normalizedPrediction} />
          <DriversList drivers={normalizedPrediction.drivers} />
          <ExplanationsPanel explanations={normalizedPrediction.explanations} />
          <AssumptionsPanel
            assumptions={normalizedPrediction.assumptions}
            prediction={normalizedPrediction}
            payload={analysis.payload}
          />
          <WarningsAlert warnings={normalizedPrediction.warnings} />

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
                <span className="text-gray-600">Purchase Price:</span> €{analysis.payload.price_buy.toLocaleString("de-DE")}
              </div>
              <div>
                <span className="text-gray-600">Renovation Cost:</span> €{analysis.payload.reno_cost.toLocaleString("de-DE")}
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-lg">Download Analysis PDF</h3>
              <p className="text-sm text-gray-500">Generate a shareable memo with the property data and model highlights.</p>
            </div>
            <Button
              onClick={handlePdfDownload}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPdf ? "Preparing..." : "Download PDF"}
            </Button>
          </Card>

          {shareId && shareDetail && (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Shared with workspace</h3>
                <p className="text-sm text-gray-500">
                  Shared by {shareDetail.shared_by.email} on {new Date(shareDetail.created_at).toLocaleString()}
                </p>
                {shareDetail.message && <p className="mt-2 text-sm text-gray-700">{shareDetail.message}</p>}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <MessageCircle className="h-4 w-4 text-indigo-500" />
                      Discussion
                    </h4>
                    <p className="text-sm text-slate-500">Share feedback and ask follow-up questions.</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-2 font-medium text-slate-900">
                      <MessageCircle className="h-4 w-4" />
                      {comments?.length ?? 0} replies
                    </span>
                  </div>
                </div>
                <div className="mt-5 space-y-4">
                  {comments && comments.length > 0 ? (
                    comments.map((comment) => {
                      const canDeleteComment =
                        currentUser && (currentUser.role === "admin" || currentUser.id === comment.user.id)
                      const liked = comment.liked_by_me
                      return (
                        <article
                          key={comment.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                {comment.user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{comment.user.email}</p>
                                <p className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            {canDeleteComment && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-slate-500 hover:text-red-600"
                                disabled={deletingCommentId === comment.id}
                                onClick={() => handleCommentDelete(comment.id)}
                                aria-label="Delete message"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-slate-800">{comment.body}</p>
                          <div className="mt-4 flex items-center gap-4 text-sm">
                            <button
                              type="button"
                              onClick={() => handleCommentLike(comment.id)}
                              disabled={likingCommentId === comment.id}
                              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                liked
                                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                  : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                              }`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} />
                              <span>{comment.likes_count}</span>
                              <span className="sr-only">Like message</span>
                            </button>
                            {comment.likes_count > 0 && (
                              <span className="text-xs text-slate-500">
                                {comment.likes_count} {comment.likes_count === 1 ? "like" : "likes"}
                              </span>
                            )}
                          </div>
                        </article>
                      )
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
                      <p className="text-sm font-medium text-slate-700">No messages yet.</p>
                      <p className="text-sm text-slate-500">Start the conversation by sharing your insights.</p>
                    </div>
                  )}
                </div>
                <form className="mt-6 space-y-3" onSubmit={handleCommentSubmit}>
                  <Label htmlFor="discussion-message" className="text-sm font-medium text-slate-700">
                    Post a message
                  </Label>
                  <Textarea
                    id="discussion-message"
                    placeholder="Share an update or ask a question..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isCommenting}
                    rows={3}
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{currentUser?.email}</span>
                    <Button type="submit" disabled={!newComment.trim() || isCommenting}>
                      {isCommenting ? "Posting..." : "Publish"}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{analysis.share_id ? "Update shared analysis" : "Share analysis"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Sharing makes this analysis visible to every workspace user.</p>
            <div>
              <Label htmlFor="share-message">Message (optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Give readers some context..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSharing}>
              {isSharing ? "Sharing..." : analysis.share_id ? "Update share" : "Share analysis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        analysisPayload={analysis.payload}
        analysisResponse={analysis.response}
      />
    </main>
  )
}

export default function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return (
    <AuthGuard>
      <AnalysisDetailContent id={resolvedParams.id} />
    </AuthGuard>
  )
}
