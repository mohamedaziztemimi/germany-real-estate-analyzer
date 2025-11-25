"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Mail, KeyRound, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/lib/hooks-auth"

function StatusMessage({ message, tone }: { message?: string; tone: "error" | "info" | "success" }) {
  if (!message) return null
  const toneClasses =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-blue-200 bg-blue-50 text-blue-700"
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${toneClasses}`}>
      {tone === "error" ? "Action needed" : tone === "success" ? "Success" : "Notice"}
      <span className="sr-only">:</span>
      <span>{message}</span>
    </div>
  )
}

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  helper,
  autoComplete,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  icon: React.ReactNode
  helper?: string
  autoComplete?: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-900">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="pl-11 pr-3 bg-white text-slate-900 border-slate-200 hover:border-blue-300 focus-visible:border-blue-400 focus-visible:ring-blue-300 placeholder:text-slate-400"
        />
      </div>
      {helper && <p className="text-xs text-slate-600">{helper}</p>}
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-900">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </span>
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete="off"
          className="pl-11 pr-12 bg-white text-slate-900 border-slate-200 hover:border-blue-300 focus-visible:border-blue-400 focus-visible:ring-blue-300 placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          aria-pressed={show}
        >
          {show ? (
            <span className="inline-flex items-center gap-1"><EyeOff className="h-4 w-4" aria-hidden="true" />Hide</span>
          ) : (
            <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" aria-hidden="true" />Show</span>
          )}
        </button>
      </div>
    </div>
  )
}

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
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-12 sm:px-8">
        <div className="relative w-full max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/80">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Reset access</p>
              <h1 className="text-2xl font-semibold text-slate-900">Forgot password?</h1>
              <p className="text-sm text-slate-600">
                Enter the email tied to your account and we will send a 6-digit reset code.
              </p>
            </div>
            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 sm:flex">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {error && <StatusMessage message={error.message} tone="error" />}
            {isSent && !resetSuccess && (
              <StatusMessage
                message="We sent a 6-digit verification code to your email. Enter it below with your new password to finish."
                tone="info"
              />
            )}

            <InputField
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            />

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-70"
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Send reset code"}
            </button>
          </form>

          {isSent && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-slate-900">Enter your reset code</h2>
                <p className="text-sm text-slate-600">Code expires in 10 minutes for your security.</p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                {formError && <StatusMessage message={formError} tone="error" />}
                {resetError && <StatusMessage message={resetError.message} tone="error" />}
                {resetSuccess && <StatusMessage message="Password reset! You can now sign in with your new password." tone="success" />}

                <div className="space-y-3">
                  <label htmlFor="reset-code" className="text-sm font-semibold text-slate-900">
                    Reset code
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <Input
                      id="reset-code"
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      required
                      className="pl-11 pr-3 tracking-[0.4em] text-lg bg-white text-slate-900 border-slate-200 hover:border-blue-300 focus-visible:border-blue-400 focus-visible:ring-blue-300 placeholder:text-slate-400"
                      aria-describedby="code-helper"
                    />
                  </div>
                  <p id="code-helper" className="text-xs text-slate-600">
                    Check your inbox for the 6-digit code we emailed you.
                  </p>
                </div>

                <PasswordField
                  id="new-password"
                  label="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />

                <PasswordField
                  id="confirm-password"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                />

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-70"
                  disabled={isResetting}
                >
                  {isResetting ? "Updating..." : "Update password"}
                </button>
              </form>
            </div>
          )}

          <div className="text-center text-sm text-slate-600">
            <Link href="/signin" className="font-semibold text-blue-700 hover:text-blue-600">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-600">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
