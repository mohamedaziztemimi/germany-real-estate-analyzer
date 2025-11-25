"use client"

import { Button } from "@/components/ui/button"
import { useSignOutMutation } from "@/lib/hooks-auth"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

export function LogoutButton() {
  const router = useRouter()
  const { mutate: signOut, isPending } = useSignOutMutation()
  const queryClient = useQueryClient()

  const handleLogout = () => {
    signOut(undefined, {
      onSuccess: () => {
        queryClient.clear()
        router.push("/")
      },
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="text-gray-600 hover:text-gray-900"
    >
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  )
}
