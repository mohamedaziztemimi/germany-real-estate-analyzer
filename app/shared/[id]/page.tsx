"use client"

import { use, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/AuthGuard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, ThumbsUp, Trash2 } from "lucide-react"
import { useShare, useShareComments, useAddCommentMutation, useDeleteCommentMutation, useToggleCommentLikeMutation } from "@/lib/hooks"
import { useAuth } from "@/lib/hooks-auth"

interface SharedAnalysisDetailProps {
  params: {
    id: string
  }
}

function SharedAnalysisContent({ shareId }: { shareId: string }) {
  const { data: authData } = useAuth()
  const { data: share, isLoading, error } = useShare(shareId)
  const { data: comments } = useShareComments(shareId)
  const { mutate: addComment, isPending } = useAddCommentMutation()
  const { mutate: deleteCommentMutation } = useDeleteCommentMutation()
  const { mutate: toggleCommentLike } = useToggleCommentLikeMutation()
  const [body, setBody] = useState("")
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null)
  const currentUser = authData?.user

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!body.trim()) return
    addComment(
      { shareId, body: body.trim() },
      {
        onSuccess: () => setBody(""),
      },
    )
  }

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Delete this message?")) return
    setDeletingCommentId(commentId)
    deleteCommentMutation(
      { shareId, commentId },
      {
        onSettled: () => setDeletingCommentId(null),
      },
    )
  }

  const handleLikeComment = (commentId: string) => {
    setLikingCommentId(commentId)
    toggleCommentLike(
      { shareId, commentId },
      {
        onSettled: () => setLikingCommentId(null),
      },
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-48 w-full" />
        </div>
      </main>
    )
  }

  if (error || !share) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-700">Unable to load shared analysis.</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const analysis = share.analysis
  const response = analysis.response

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Shared by {share.shared_by.email}</p>
            <h1 className="text-3xl font-bold">{analysis.title}</h1>
            {share.message && <p className="text-gray-600 mt-2">{share.message}</p>}
          </div>
          <Link href="/shared">
            <Button variant="outline">Back to shared list</Button>
          </Link>
        </div>

        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Decision</p>
              <p className={`text-2xl font-semibold ${response.decision === "Buy" ? "text-green-600" : "text-red-600"}`}>
                {response.decision}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated ROI</p>
              <p className="text-2xl font-semibold">{(response.roi_estimated * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Confidence</p>
              <p className="text-2xl font-semibold">{(response.confidence * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Property</p>
              <p className="text-lg font-medium">
                {analysis.payload.city}, {analysis.payload.plz} · {analysis.payload.surface_m2} m²
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <MessageCircle className="h-4 w-4 text-indigo-500" />
                  Discussion
                </h2>
                <p className="text-sm text-slate-500">Collaborate with the rest of the workspace.</p>
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
                            onClick={() => handleDeleteComment(comment.id)}
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
                          onClick={() => handleLikeComment(comment.id)}
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
                  <p className="text-sm text-slate-500">Kick off the discussion with your insights.</p>
                </div>
              )}
            </div>
            <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
              <Label htmlFor="shared-discussion" className="text-sm font-medium text-slate-700">
                Post a message
              </Label>
              <Textarea
                id="shared-discussion"
                placeholder="Share an update or ask a question..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={isPending}
                rows={3}
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{currentUser?.email}</span>
                <Button type="submit" disabled={!body.trim() || isPending}>
                  {isPending ? "Posting..." : "Publish"}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </main>
  )
}

export default function SharedAnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  return (
    <AuthGuard>
      <SharedAnalysisContent shareId={resolvedParams.id} />
    </AuthGuard>
  )
}
