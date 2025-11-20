"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useUsers, useUpdateUserMutation, useDeleteUserMutation, useCreateUserMutation } from "@/lib/hooks"
import { AlertCircle, Trash2 } from "lucide-react"

function UsersContent() {
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
          <h1 className="text-3xl font-bold">Users Management</h1>
          <Button variant="outline" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Close" : "Add User"}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8 border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3">Add User</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Password"
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
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 flex gap-3">
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
              <Button variant="ghost" onClick={() => setShowAddForm(false)} disabled={isCreating}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 p-4 mb-6">
            <div className="flex gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>Failed to load users</p>
            </div>
          </Card>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  </tr>
                ))
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 text-sm">
                      <Input
                        value={drafts[user.id]?.email ?? user.email}
                        onChange={(e) => handleChange(user.id, "email", e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Select
                        value={drafts[user.id]?.role ?? user.role}
                        onValueChange={(role: "user" | "admin") => handleChange(user.id, "role", role)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSaving || isDeleting}
                        onClick={() => handleSave(user.id)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isSaving || isDeleting}
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && <p className="mt-4 text-sm text-gray-500">Total users: {data.total}</p>}
      </div>
    </main>
  )
}

export default function UsersPage() {
  return (
    <AuthGuard requiredRole="admin">
      <UsersContent />
    </AuthGuard>
  )
}
