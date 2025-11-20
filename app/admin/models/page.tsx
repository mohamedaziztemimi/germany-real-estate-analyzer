"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useModels, useCreateModelMutation, useActivateModelMutation } from "@/lib/hooks"
import { AlertCircle } from "lucide-react"

function ModelsContent() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [version, setVersion] = useState("")
  const [path, setPath] = useState("")
  const { data, isLoading, error } = useModels()
  const { mutate: createModel, isPending: isCreating } = useCreateModelMutation()
  const { mutate: activateModel, isPending: isActivating } = useActivateModelMutation()

  const handleCreate = () => {
    if (!name || !version || !path) return
    createModel(
      { name, version, path },
      {
        onSuccess: () => {
          setName("")
          setVersion("")
          setPath("")
          setIsOpen(false)
        },
      },
    )
  }

  const handleActivate = (modelId: string) => {
    activateModel(modelId)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Model Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">Create Model</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Model</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="model-name">Name</Label>
                  <Input
                    id="model-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="XGBoost v1"
                  />
                </div>
                <div>
                  <Label htmlFor="model-version">Version</Label>
                  <Input
                    id="model-version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="model-path">Path</Label>
                  <Input
                    id="model-path"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="/models/xgboost_v1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!name || !version || !path || isCreating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 mb-6">
            <div className="flex gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>Failed to load models</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </Card>
            ))
          ) : data?.models.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No models available</Card>
          ) : (
            data?.models.map((model) => (
              <Card key={model.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{model.name}</h3>
                    <p className="text-sm text-gray-600">Version: {model.version}</p>
                    <p className="text-sm text-gray-600">Path: {model.path || "N/A"}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(model.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {model.active && (
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Active
                      </span>
                    )}
                    {!model.active && (
                      <Button
                        size="sm"
                        onClick={() => handleActivate(model.id)}
                        disabled={isActivating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {data && <p className="mt-4 text-sm text-gray-500">Total models: {data.total}</p>}
      </div>
    </main>
  )
}

export default function ModelsPage() {
  return (
    <AuthGuard requiredRole="admin">
      <ModelsContent />
    </AuthGuard>
  )
}
