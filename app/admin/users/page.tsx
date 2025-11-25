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
  const [newUser, setNewUser] = useState<{ email: string; password: string; role: "user" | "admin" }>(
    {
      email: "",
      password: "",
      role: "user",
    },
  )

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
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Admin</p>
            <h1 className="text-3xl font-bold text-slate-900">{strings.usersTitle}</h1>
            <p className="text-sm text-slate-600">Manage access, roles, and invitations.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAddForm((v) => !v)}
            className="rounded-xl border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-blue-500 hover:text-blue-700"
          >
            {showAddForm ? strings.usersClose : strings.usersAdd}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80">
            <h2 className="text-lg font-semibold mb-3 text-slate-900">{strings.usersAdd}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                placeholder={strings.usersEmail}
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-white"
              />
              <Input
                placeholder={strings.usersPassword}
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                className="bg-white"
              />
              <Select
                value={newUser.role}
                onValueChange={(role: "user" | "admin") => setNewUser((prev) => ({ ...prev, role }))}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={strings.usersRole} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{strings.usersUser}</SelectItem>
                  <SelectItem value="admin">{strings.usersAdmin}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 flex gap-3">
              <Button onClick={handleCreate} disabled={isCreating} className="rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                {isCreating ? strings.usersCreating : strings.usersCreate}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                disabled={isCreating}
                className="text-slate-600 hover:text-slate-900"
              >
                {strings.usersCancel}
              </Button>
            </div>
          </Card>
        )}

        {error && (
          <Card className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <p>{strings.usersFailed}</p>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <Card key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.users?.map((user: any) => (
              <Card
                key={user.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Input
                  value={drafts[user.id]?.email ?? user.email}
                  onChange={(e) => handleChange(user.id, "email", e.target.value)}
                  className="bg-white"
                />
                <Select value={drafts[user.id]?.role ?? user.role} onValueChange={(value) => handleChange(user.id, "role", value)}>
                  <SelectTrigger className="w-32 bg-white">
                    <SelectValue placeholder={strings.usersRole} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{strings.usersUser}</SelectItem>
                    <SelectItem value="admin">{strings.usersAdmin}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto flex gap-2">
                  <Button size="sm" onClick={() => handleSave(user.id)} disabled={isSaving} className="rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                    {strings.usersCreate}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(user.id)}
                    disabled={isDeleting}
                    className="text-slate-500 hover:text-rose-600"
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
