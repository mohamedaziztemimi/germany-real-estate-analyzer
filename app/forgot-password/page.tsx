"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/lib/hooks-auth"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isSent, setIsSent] = useState(false)
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const { mutate: sendResetEmail, isPending, error } = useForgotPasswordMutation()
  const {
    mutate: submitNewPassword,
    isPending: isResetting,
    error: resetError,
  } = useResetPasswordMutation()

  useEffect(() => {
    const initialEmail = searchParams.get("email")
    if (initialEmail) {
      setEmail(initialEmail)
    }
  }, [searchParams])

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    sendResetEmail(
      { email },
      {
        onSuccess: () => {
          setIsSent(true)
          setFormError(null)
          setResetSuccess(false)
          setCode("")
          setPassword("")
          setConfirmPassword("")
        },
      },
    )
  }

  const handleCodeSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!/^\d{6}$/.test(code.trim())) {
      setFormError("Enter the 6-digit code we emailed you.")
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
    submitNewPassword(
      { email, code: code.trim(), password },
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
        <Card className="p-8 space-y-6">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-center">Forgot password?</h1>
            <p className="text-center text-gray-600">
              Enter the email tied to your account and we&apos;ll send you a 6-digit reset code.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
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

            {isSent && !resetSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  We sent a 6-digit verification code to your email. Enter it below with your new password to finish.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
              {isPending ? "Sending..." : "Send reset code"}
            </Button>
          </form>

          {isSent && (
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-lg font-semibold text-gray-900">Enter your reset code</h2>
              <p className="mt-1 text-sm text-gray-600">Code expires in 10 minutes for your security.</p>

              <form onSubmit={handleCodeSubmit} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="reset-code">Reset code</Label>
                  <Input
                    id="reset-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
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
                      Password updated successfully. You can sign in with your new password now.
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isResetting}>
                  {isResetting ? "Updating..." : "Update password"}
                </Button>
              </form>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
