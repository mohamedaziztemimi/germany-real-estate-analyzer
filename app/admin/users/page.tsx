"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useUsers, useUpdateUserMutation, useDeleteUserMutation, useCreateUserMutation } from "@/lib/hooks"
import { useLanguage } from "@/lib/language-context"
import { AlertCircle, Trash2 } from "lucide-react"

function UsersContent() {
  const { strings } = useLanguage()
  const { data, isLoading, error } = useUsers()
  const { mutate: saveUser, isPending: isSaving } = useUpdateUserMutation()
  const { mutate: removeUser, isPending: isDeleting } = useDeleteUserMutation()
  const { mutate: addUser, isPending: isCreating } = useCreateUserMutation()
  const [drafts, setDrafts] = useState<Record<string, { email: string; role: "user" | "admin" }>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState<{ email: string; password: string; role: "user" | "admin" }>({
    email: "",
    password: "",
    role: "user",
  })

  useEffect(() => {
    if (!data?.users) return
    const next: Record<string, { email: string; role: "user" | "admin" }> = {}
    data.users.forEach((u: any) => {
      next[u.id] = { email: u.email, role: (u.role as "user" | "admin") ?? "user" }
    })
    setDrafts(next)
  }, [data?.users])

  const handleChange = (userId: string, field: "email" | "role", value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [userId]: {
        email: field === "email" ? value : prev[userId]?.email ?? "",
        role: (field === "role" ? value : prev[userId]?.role ?? "user") as "user" | "admin",
      },
    }))
  }

  const handleSave = (userId: string) => {
    const draft = drafts[userId]
    saveUser({ userId, email: draft?.email, role: draft?.role })
  }

  const handleDelete = (userId: string) => {
    removeUser(userId)
  }

  const handleCreate = () => {
    if (!newUser.email || !newUser.password) return
    addUser(newUser, {
      onSuccess: () => {
        setNewUser({ email: "", password: "", role: "user" })
        setShowAddForm(false)
      },
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">{strings.usersTitle}</h1>
          <Button variant="outline" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? strings.usersClose : strings.usersAdd}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8 border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">{strings.usersAdd}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                placeholder={strings.usersEmail}
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder={strings.usersPassword}
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              />
              <Select
                value={newUser.role}
                onValueChange={(role: "user" | "admin") => setNewUser((prev) => ({ ...prev, role }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{strings.usersUser}</SelectItem>
                  <SelectItem value="admin">{strings.usersAdmin}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 flex gap-3">
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? strings.usersCreating : strings.usersCreate}
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)} disabled={isCreating}>
                {strings.usersCancel}
              </Button>
            </div>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 mb-6">
            <div className="flex gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{strings.usersFailed}</p>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <Card key={idx} className="p-4">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.users?.map((user: any) => (
              <Card key={user.id} className="p-4 flex items-center gap-3">
                <Input
                  value={drafts[user.id]?.email ?? user.email}
                  onChange={(e) => handleChange(user.id, "email", e.target.value)}
                />
                <Select
                  value={drafts[user.id]?.role ?? user.role}
                  onValueChange={(value) => handleChange(user.id, "role", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{strings.usersUser}</SelectItem>
                    <SelectItem value="admin">{strings.usersAdmin}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" onClick={() => handleSave(user.id)} disabled={isSaving}>
                    {strings.usersCreate}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(user.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersContent />
    </AuthGuard>
  )
}
