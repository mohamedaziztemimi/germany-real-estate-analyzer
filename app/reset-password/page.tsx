"use client"

import Link from "next/link"

export default function ResetPasswordRedirectPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl shadow-slate-200/80 space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Reset password</h1>
          <p className="text-slate-600">
            We now send a 6-digit verification code to your email. Please use the <strong>Forgot password</strong> page
            to request a new code and update your password securely.
          </p>
          <Link
            href="/forgot-password"
            className="block rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            Go to forgot password
          </Link>
        </div>
      </div>
    </main>
  )
}
