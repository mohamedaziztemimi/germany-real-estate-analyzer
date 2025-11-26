"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSignupStartMutation, useSignupCompleteMutation } from "@/lib/hooks-auth"
import { GoogleLoginButton } from "@/components/GoogleLoginButton"

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
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  autoComplete?: string
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
          autoComplete={autoComplete}
          required
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

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<1 | 2>(1)
  const [passwordError, setPasswordError] = useState("")
  const [codeError, setCodeError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const router = useRouter()
  const { mutate: startSignup, isPending: isSendingCode, error: startError } = useSignupStartMutation()
  const { mutate: completeSignup, isPending: isVerifying, error: verifyError } = useSignupCompleteMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setCodeError("")

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    startSignup(
      { email, password },
      {
        onSuccess: (data) => {
          setStep(2)
          if (data?.code) {
            setCode(data.code)
            setInfoMessage(`We generated a code for you: ${data.code}. Finishing signup...`)
            completeSignup(
              { email, code: data.code },
              {
                onSuccess: () => router.replace("/"),
              },
            )
          } else {
            setInfoMessage("Enter the 6-digit code you receive to finish signing up.")
          }
        },
      },
    )
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    setCodeError("")
    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the 6-digit code sent to your email.")
      return
    }

    completeSignup(
      { email, code: code.trim() },
      {
        onSuccess: () => {
          router.replace("/")
        },
      },
    )
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-12 sm:px-8">
        <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/80">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Get started</p>
              <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
              <p className="text-sm text-slate-600">Secure access to Real Estate Analyzer in two quick steps.</p>
            </div>
            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 sm:flex">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>

          <div className="mb-4 space-y-3">
            <GoogleLoginButton fullWidth />
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step === 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                1
              </span>
              Verify your email
            </span>
            <span className="inline-flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${step === 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                2
              </span>
              Confirm access code
            </span>
          </div>

          <form onSubmit={step === 1 ? handleSubmit : handleVerify} className="space-y-5">
            {startError && step === 1 && <StatusMessage message={startError.message} tone="error" />}
            {verifyError && step === 2 && <StatusMessage message={verifyError.message} tone="error" />}
            {passwordError && step === 1 && <StatusMessage message={passwordError} tone="error" />}
            {codeError && step === 2 && <StatusMessage message={codeError} tone="error" />}
            {infoMessage && <StatusMessage message={infoMessage} tone="info" />}

            {step === 1 ? (
              <>
                <InputField
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  icon={<Mail className="h-4 w-4" aria-hidden="true" />}
                  helper="We'll send a 6-digit code to verify your email."
                />
                <PasswordField
                  id="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  autoComplete="new-password"
                />
                <PasswordField
                  id="confirmPassword"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                  autoComplete="new-password"
                />
              </>
            ) : (
              <div className="space-y-3">
                <label htmlFor="code" className="text-sm font-semibold text-slate-900">
                  Enter verification code
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <Input
                    id="code"
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
                  We sent a 6-digit code to {email || "your email address"}. Code expires in 10 minutes.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingCode || isVerifying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-70"
            >
              {step === 1 ? (isSendingCode ? "Sending code..." : "Send verification code") : isVerifying ? "Verifying..." : "Verify and continue"}
            </button>
            <p className="text-center text-xs text-slate-600">
              {step === 1
                ? "Your credentials are encrypted and secure."
                : "Enter the 6-digit code from your inbox to activate your account."}
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-blue-700 hover:text-blue-600">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
