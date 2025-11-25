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
import {
  useShare,
  useShareComments,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useToggleCommentLikeMutation,
} from "@/lib/hooks"
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
      <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-4xl space-y-4 px-4 py-10">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-48 w-full" />
        </div>
      </main>
    )
  }

  if (error || !share) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-10">
          <Alert className="border-rose-200 bg-rose-50">
            <AlertDescription className="text-rose-700">Unable to load shared analysis.</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const analysis = share.analysis
  const response = analysis.response

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-4xl space-y-6 px-4 py-10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">Shared by {share.shared_by.email}</p>
            <h1 className="text-3xl font-bold text-slate-900">{analysis.title}</h1>
            {share.message && <p className="text-slate-600 mt-1">{share.message}</p>}
          </div>
          <Link href="/shared">
            <Button variant="outline" className="rounded-xl border-slate-300 text-slate-800 hover:border-blue-500 hover:text-blue-700">
              Back to shared list
            </Button>
          </Link>
        </div>

        <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">Decision</p>
              <p className={`text-2xl font-semibold ${response.decision === "Buy" ? "text-emerald-700" : "text-rose-700"}`}>
                {response.decision}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Estimated ROI</p>
              <p className="text-2xl font-semibold text-slate-900">{(response.roi_estimated * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Confidence</p>
              <p className="text-2xl font-semibold text-slate-900">{(response.confidence * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Property</p>
              <p className="text-lg font-medium text-slate-900">
                {analysis.payload.city}, {analysis.payload.plz} - {analysis.payload.surface_m2} sqm
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                Discussion
              </h2>
              <p className="text-sm text-slate-600">Collaborate with the rest of the workspace.</p>
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
                const canDeleteComment = currentUser && (currentUser.role === "admin" || currentUser.id === comment.user.id)
                const liked = comment.liked_by_me
                return (
                  <article
                    key={comment.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
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
                          className="text-slate-500 hover:text-rose-600"
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
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
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
              className="bg-white"
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{currentUser?.email}</span>
              <Button type="submit" disabled={!body.trim() || isPending} className="rounded-xl">
                {isPending ? "Posting..." : "Publish"}
              </Button>
            </div>
          </form>
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
