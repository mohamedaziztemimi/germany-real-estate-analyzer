"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useAnalysesMutation } from "@/lib/hooks"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/hooks-auth"
import type { PropertyPayload, PredictionResponse } from "@/lib/schemas"

interface SaveAnalysisButtonProps {
  payload: PropertyPayload
  response: PredictionResponse
  onSuccess?: (id: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SaveAnalysisButton({ payload, response, onSuccess, open, onOpenChange }: SaveAnalysisButtonProps) {
  const { strings } = useLanguage()
  const { data: authData, isLoading: authLoading } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState(`Analysis - ${payload.city}`)
  const [notes, setNotes] = useState("")
  const { mutate, isPending, error } = useAnalysesMutation()
  const isAuthenticated = !!authData?.user
  const resolvedOpen = typeof open === "boolean" ? open : internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const handleSave = () => {
    mutate(
      { title, notes, payload, response },
      {
        onSuccess: (result) => {
          setOpen(false)
          setTitle(`Analysis - ${payload.city}`)
          setNotes("")
          onSuccess?.(result.id)
        },
      },
    )
  }

  return (
    <Dialog open={resolvedOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{strings.saveAnalysis}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{strings.dialogSaveTitle}</DialogTitle>
        </DialogHeader>
        {authLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner className="h-4 w-4" />
            <span>Checking your session...</span>
          </div>
        ) : isAuthenticated ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Berlin 3BR Apartment"
              />
            </div>
            <div>
              <Label htmlFor="notes">{strings.dialogSaveNotes}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this analysis..."
                rows={3}
                className="hover:border-slate-200 focus-visible:ring-blue-200/70"
              />
            </div>
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                {strings.dialogCancel}
              </Button>
              <Button onClick={handleSave} disabled={!title || isPending} className="bg-blue-600 hover:bg-blue-700">
                {isPending ? "Saving..." : strings.dialogSaveCta}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">{strings.analysisGuestNote}</AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Link href="/signin?next=/analyze">
                <Button variant="outline">{strings.signIn}</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">{strings.signUp}</Button>
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
