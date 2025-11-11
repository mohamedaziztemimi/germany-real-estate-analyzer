"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSignUpMutation } from "@/lib/hooks-auth"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const router = useRouter()
  const { mutate, isPending, error } = useSignUpMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard")
        },
      },
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-center">Create Account</h1>
          <p className="mb-6 text-center text-gray-600">Get started with Real Estate Analyzer</p>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {passwordError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{passwordError}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error.message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700">
              {isPending ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}
