"use client"

import type React from "react"
import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useSignInMutation } from "@/lib/hooks-auth"
import { GoogleLoginButton } from "@/components/GoogleLoginButton"

function StatusMessage({ message, tone }: { message?: string; tone: "error" | "info" }) {
  if (!message) return null
  const toneClasses =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700"
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${toneClasses}`}>
      {tone === "error" ? "Action needed" : "Heads up"}
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
  autoComplete,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  icon: React.ReactNode
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
  forgotPasswordHref,
}: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  autoComplete?: string
  forgotPasswordHref: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
        <label htmlFor={id}>{label}</label>
        <Link href={forgotPasswordHref} className="text-blue-700 hover:text-blue-600">
          Forgot password?
        </Link>
      </div>
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

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
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
      { email, password, remember: rememberMe },
      {
        onSuccess: () => {
          const next = searchParams.get("next") || "/"
          router.push(next)
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
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Welcome back</p>
            <h1 className="text-2xl font-semibold text-slate-900">Sign in to your workspace</h1>
            <p className="text-sm text-slate-600">Access your analyses, discussions, and saved properties.</p>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 sm:flex">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>

          <div className="space-y-3">
            <GoogleLoginButton fullWidth />
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or sign in with email</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <StatusMessage message={error?.message} tone="error" />

            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            />

            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
              forgotPasswordHref={forgotPasswordHref}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-300"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Keep me signed in on this device
              </label>
              <Link href={forgotPasswordHref} className="font-semibold text-blue-700 hover:text-blue-600">
                Trouble signing in?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-70"
            >
              {isPending ? "Signing in..." : "Access workspace"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-blue-700 hover:text-blue-600">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-600">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
