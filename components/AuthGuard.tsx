"use client"

import type React from "react"

import { useAuth } from "@/lib/hooks-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { data, isLoading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && error) {
      router.push(`/signin?next=${window.location.pathname}`)
    }
  }, [isLoading, error, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !data?.user) {
    return null
  }

  if (requiredRole && data.user.role !== requiredRole) {
    router.push("/")
    return null
  }

  return <>{children}</>
}
