"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, Clock3, Radar, ShieldCheck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/hooks-auth"

export function HomeLanding() {
  const { strings } = useLanguage()
  const { data: authData } = useAuth()
  const isAuthenticated = !!authData?.user

  const featureIcons = [TrendingUp, Radar, ShieldCheck]

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.10),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_60%_85%,rgba(59,130,246,0.10),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 space-y-20">

        {/* Hero */}
        <section className="relative grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              Germany-focused real estate AI
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl text-slate-900">
                {strings.heroTitle}
              </h1>
              <p className="text-lg text-slate-600">{strings.heroSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-300">
                      Go to dashboard
                    </Button>
                  </Link>
                  <Link href="/analyses">
                    <Button
                      variant="outline"
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      View analyses
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-300">
                      {strings.heroCta}
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button
                      variant="outline"
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300"
                    >
                      {strings.signIn}
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" /> GDPR ready
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                <BarChart3 className="h-4 w-4 text-blue-600" aria-hidden="true" /> Live market signals
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                <Clock3 className="h-4 w-4 text-slate-600" aria-hidden="true" /> Decisions in minutes
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-blue-100 via-emerald-50 to-cyan-100 blur-3xl" aria-hidden />
            <Card className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="font-semibold text-slate-900">AI deal profile</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  ROI +12.4%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-500">Confidence</p>
                  <p className="text-2xl font-semibold text-slate-900">82%</p>
                  <p className="text-xs text-emerald-700 mt-1">Model certainty</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-slate-500">Risk band</p>
                  <p className="text-2xl font-semibold text-amber-600">Moderate</p>
                  <p className="text-xs text-slate-500 mt-1">Stress-tested</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-blue-50 to-white p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Recommendation</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      Actionable
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-emerald-700">Proceed with negotiation</p>
                  <p className="text-xs text-slate-500 mt-1">Drivers: comps, forecasted cash flow, renovation uplift.</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Trust logos */}
        <section className="relative space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.28em] text-slate-500">
            <span className="h-px w-12 bg-slate-200" aria-hidden="true" />
            Trusted by teams at
            <span className="h-px w-12 bg-slate-200" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-slate-600 text-sm">
            {["Northwind", "Globex", "Initech", "Umbrella", "Stark Industries", "Wayne Assets"].map((brand) => (
              <span key={brand} className="rounded-full bg-white px-4 py-2 ring-1 ring-slate-200 shadow-sm">
                {brand}
              </span>
            ))}
          </div>
        </section>

        {/* Value props */}
        <section className="relative space-y-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">{strings.dataTitle1}</h2>
            <p className="text-slate-600 text-sm">Clarity, speed, and alignment for your team.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[strings.feature1Title, strings.feature2Title, strings.feature3Title].map((title, idx) => {
              const Icon = featureIcons[idx] || TrendingUp
              const desc =
                idx === 0 ? strings.feature1Description : idx === 1 ? strings.feature2Description : strings.feature3Description
              return (
                <Card
                  key={title}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{desc}</p>
                </Card>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section
          className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-10 shadow-2xl shadow-blue-300/30"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_45%)]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-white">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-blue-100">Ready to decide faster?</p>
              <h3 className="text-2xl font-semibold">Launch your next analysis in minutes.</h3>
              <p className="text-sm text-blue-100/90">Transparent drivers, ROI, and confidence in one view.</p>
            </div>
            <div className="flex gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5">
                      Go to dashboard
                    </Button>
                  </Link>
                  <Link href="/analyses">
                    <Button
                      variant="outline"
                      className="rounded-xl border border-white/70 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                    >
                      View analyses
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/signup">
                    <Button className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5">
                      {strings.heroCta}
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button
                      variant="outline"
                      className="rounded-xl border border-white/70 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                    >
                      {strings.signIn}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
