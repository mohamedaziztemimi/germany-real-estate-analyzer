"use client"

import type React from "react"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSignInMutation } from "@/lib/hooks-auth"

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate, isPending, error } = useSignInMutation()
  const forgotPasswordHref = useMemo(
    () => (email ? `/forgot-password?email=${encodeURIComponent(email)}` : "/forgot-password"),
    [email],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(
      { email, password },
      {
        onSuccess: () => {
          const next = searchParams.get("next") || "/"
          router.push(next)
        },
      },
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-center">Sign In</h1>
          <p className="mb-6 text-center text-gray-600">Welcome back to Real Estate Analyzer</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href={forgotPasswordHref} className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error.message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700">
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
