"use client"

import type React from "react"

import { useAuth } from "@/lib/hooks-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Spinner } from "@/components/ui/spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  fallback?: React.ReactNode
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { data, isLoading, error } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    if (fallback) {
      return <>{fallback}</>
    }
    router.push(`/signin?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`)
    return null
  }

  if (!data?.user) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null
  }

  if (requiredRole && data.user.role !== requiredRole) {
    router.push("/")
    return null
  }

  return <>{children}</>
}
