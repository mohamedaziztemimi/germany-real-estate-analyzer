"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useResetPasswordMutation } from "@/lib/hooks-auth"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const { mutate, isPending, error } = useResetPasswordMutation()

  useEffect(() => {
    const initialToken = searchParams.get("token")
    if (initialToken) {
      setToken(initialToken)
    }
  }, [searchParams])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!token.trim()) {
      setFormError("Reset token is required.")
      return
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.")
      return
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }

    mutate(
      { token: token.trim(), password },
      {
        onSuccess: () => setIsComplete(true),
      },
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-center">Reset password</h1>
          <p className="mb-6 text-center text-gray-600">
            Paste the reset code from your email and choose a new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="token">Reset token</Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste the token from your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {formError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{formError}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error.message}</AlertDescription>
              </Alert>
            )}

            {isComplete && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  Password updated successfully. You can sign in with your new password now.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? "Updating..." : "Update password"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Ready to sign in?{" "}
            <Link href="/signin" className="text-blue-600 hover:underline font-medium">
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}