"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/lib/hooks-auth"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isSent, setIsSent] = useState(false)
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [devToken, setDevToken] = useState<string | null>(null)
  const { mutate, isPending, error } = useForgotPasswordMutation()
  const {
    mutate: resetPassword,
    isPending: isResetting,
    error: resetError,
  } = useResetPasswordMutation()

  useEffect(() => {
    const initialEmail = searchParams.get("email")
    if (initialEmail) {
      setEmail(initialEmail)
    }
  }, [searchParams])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    mutate(
      { email },
      {
        onSuccess: (data) => {
          setIsSent(true)
          if (data?.token) {
            setToken(data.token)
            setDevToken(data.token)
          } else {
            setDevToken(null)
          }
        },
      },
    )
  }

  const handleResetSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!token.trim()) {
      setFormError("Please paste the reset code we sent to your email.")
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
    resetPassword(
      { token: token.trim(), password },
      {
        onSuccess: () => {
          setResetSuccess(true)
        },
      },
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-center">Forgot password?</h1>
          <p className="mb-6 text-center text-gray-600">
            Enter the email tied to your account and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error.message}</AlertDescription>
              </Alert>
            )}

            {isSent && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  If that email is registered, you'll receive reset instructions shortly.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          {isSent && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">Enter your reset code</h2>
              <p className="mt-1 text-sm text-gray-600">
                Check your inbox for the reset code. Paste it below along with your new password.
              </p>

              {devToken && (
                <Alert className="mt-4 border-blue-200 bg-blue-50">
                  <AlertDescription className="text-sm text-blue-800">
                    Email delivery isn't configured in this environment. Use this temporary code to reset your password:
                    <span className="mt-1 block break-all font-mono text-base text-blue-900">{devToken}</span>
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="token">Reset code</Label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste the code from your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
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

                {resetError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{resetError.message}</AlertDescription>
                  </Alert>
                )}

                {resetSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-700">
                      Password updated successfully. You can now sign in with your new password.
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isResetting}>
                  {isResetting ? "Updating..." : "Update password"}
                </Button>
              </form>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link href="/signin" className="text-blue-600 hover:underline font-medium">
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </main>
  )
}
