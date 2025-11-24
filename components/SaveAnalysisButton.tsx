"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAnalysesMutation } from "@/lib/hooks"
import { useLanguage } from "@/lib/language-context"
import type { PropertyPayload, PredictionResponse } from "@/lib/schemas"

interface SaveAnalysisButtonProps {
  payload: PropertyPayload
  response: PredictionResponse
  onSuccess?: (id: string) => void
}

export function SaveAnalysisButton({ payload, response, onSuccess }: SaveAnalysisButtonProps) {
  const { strings } = useLanguage()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(`Analysis - ${payload.city}`)
  const [notes, setNotes] = useState("")
  const { mutate, isPending, error } = useAnalysesMutation()

  const handleSave = () => {
    mutate(
      { title, notes, payload, response },
      {
        onSuccess: (result) => {
          setOpen(false)
          setTitle("")
          setNotes("")
          onSuccess?.(result.id)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{strings.saveAnalysis}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{strings.dialogSaveTitle}</DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  )
}
