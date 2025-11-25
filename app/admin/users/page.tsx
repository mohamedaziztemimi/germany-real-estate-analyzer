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
  const [page, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    if (!data?.users) return
    const next: Record<string, { email: string; role: "user" | "admin" }> = {}
    data.users.forEach((u: any) => {
      next[u.id] = { email: u.email, role: (u.role as "user" | "admin") ?? "user" }
    })
    setDrafts(next)
    setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(data.users.length / pageSize))))
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
    removeUser(userId, {
      onSuccess: () => {
        setDrafts((prev) => {
          const next = { ...prev }
          delete next[userId]
          return next
        })
        setPage((prev) => {
          const total = (data?.users?.length ?? 1) - 1
          const maxPage = Math.max(1, Math.ceil(total / pageSize))
          return Math.min(prev, maxPage)
        })
      },
    })
  }

  const handleCreate = () => {
    if (!newUser.email || !newUser.password) return
    addUser(newUser, {
      onSuccess: () => {
        setNewUser({ email: "", password: "", role: "user" })
        setShowAddForm(false)
        setPage(1)
      },
    })
  }

  const users = data?.users ?? []
  const pageCount = Math.max(1, Math.ceil(users.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pagedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
          <Card className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
              <Select value={newUser.role} onValueChange={(role: "user" | "admin") => setNewUser((prev) => ({ ...prev, role }))}>
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
              <Card key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-slate-200 bg-white p-0 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-800">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">{strings.usersEmail}</th>
                    <th className="px-4 py-3">{strings.usersRole}</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 align-middle">
                        <Input
                          value={drafts[user.id]?.email ?? user.email}
                          onChange={(e) => handleChange(user.id, "email", e.target.value)}
                          className="bg-white"
                        />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Select value={drafts[user.id]?.role ?? user.role} onValueChange={(value) => handleChange(user.id, "role", value)}>
                          <SelectTrigger className="w-36 bg-white">
                            <SelectValue placeholder={strings.usersRole} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">{strings.usersUser}</SelectItem>
                            <SelectItem value="admin">{strings.usersAdmin}</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <div className="flex justify-end gap-2">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
              <span>
                Page {currentPage} of {pageCount}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                  disabled={currentPage === pageCount}
                  className="rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
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
