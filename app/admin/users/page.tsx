"use client"

import { AuthGuard } from "@/components/AuthGuard"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers, useUpdateUserRoleMutation } from "@/lib/hooks"
import { AlertCircle } from "lucide-react"

function UsersContent() {
  const { data, isLoading, error } = useUsers()
  const { mutate: updateRole, isPending } = useUpdateUserRoleMutation()

  const handleRoleChange = (userId: string, role: "user" | "admin") => {
    updateRole({ userId, role })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">User Management</h1>

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
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <Select value={user.role} onValueChange={(role: any) => handleRoleChange(user.id, role)}>
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
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleRoleChange(user.id, user.role === "admin" ? "user" : "admin")}
                      >
                        Toggle
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
