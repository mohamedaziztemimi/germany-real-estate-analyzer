"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query"
import { Globe } from "lucide-react"

import { LogoutButton } from "@/components/LogoutButton"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/hooks-auth"
import QueryClient from "@/lib/query-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useMemo } from "react"
import { getSession } from "@/lib/auth"
import { getAnalyses } from "@/lib/analyses-api"
import { getAnalyticsSummary } from "@/lib/api"

function NavigationContent() {
  const { data: authData } = useAuth()
  const isAuthenticated = !!authData?.user
  const isAdmin = authData?.user?.role === "admin"
  const { strings } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()

  const navItems = useMemo(
    () =>
      [
        { href: "/", label: strings.home, private: false },
        { href: "/analyze", label: strings.analyze, private: false },
        { href: "/dashboard", label: strings.dashboard, private: true },
        { href: "/analyses", label: strings.analyses, private: true },
        { href: "/shared", label: strings.discussions, private: true },
        ...(isAdmin ? [{ href: "/admin/users", label: strings.users, private: true }] : []),
      ].filter((item) => !item.private || isAuthenticated),
    [isAdmin, isAuthenticated, strings],
  )

  useEffect(() => {
    navItems.forEach((item) => {
      router.prefetch?.(item.href)
    })
  }, [navItems, router])

  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ["auth", "session"], queryFn: getSession })
    if (isAuthenticated) {
      queryClient.prefetchQuery({ queryKey: ["analytics", "summary"], queryFn: getAnalyticsSummary })
      queryClient.prefetchQuery({ queryKey: ["analyses", 1], queryFn: () => getAnalyses(1) })
    }
  }, [isAuthenticated, queryClient])

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
      {navItems.map((item) => {
        const active = pathname === item.href
        const baseClasses =
          "group relative inline-flex items-center rounded-full px-3 py-2 text-sm font-semibold transition"
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${baseClasses} ${
              active
                ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        )
      })}
      <div className="flex items-center gap-3 pl-2">
        {isAuthenticated && <LogoutButton />}
        {!isAuthenticated && (
          <>
            <Link href="/signin" className="text-slate-700 hover:text-blue-700 transition">
              {strings.signIn}
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              {strings.signUp}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  return (
    <div className="flex items-center gap-1 text-[11px] text-gray-600">
      <Globe className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
      <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "de")}>
        <SelectTrigger className="h-6 w-16 bg-white text-[11px]">
          <SelectValue placeholder="LANG" aria-label="Language select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">EN</SelectItem>
          <SelectItem value="de">DE</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function LayoutChrome({ children }: { children: React.ReactNode }) {
  const { strings } = useLanguage()
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-sm text-slate-700">
          <div className="flex items-center gap-3 text-slate-900">
            <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
              {strings.brand}
            </Link>
            <span className="hidden rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 sm:inline">
              For deal teams
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <NavigationContent />
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </nav>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-4 text-sm text-slate-600">
          <div className="space-y-3">
            <div className="text-slate-900 font-semibold">{strings.brand}</div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Data-driven real estate decisions for operators and investors.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              99.9% uptime
            </div>
          </div>
          <div>
            <h4 className="text-slate-900 font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/analyses" className="hover:text-blue-700">Analyses</Link></li>
              <li><Link href="/shared" className="hover:text-blue-700">Collaboration</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-700">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-blue-700">About</Link></li>
              <li><Link href="/blog" className="hover:text-blue-700">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-blue-700">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 font-semibold mb-3">Trust</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded bg-white ring-1 ring-slate-200 flex items-center justify-center text-slate-700">V</span>
                GDPR aligned
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded bg-white ring-1 ring-slate-200 flex items-center justify-center text-slate-700">V</span>
                Role-based access
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded bg-white ring-1 ring-slate-200 flex items-center justify-center text-slate-700">V</span>
                Encrypted at rest
              </div>
            </div>
          </div>
          <div className="md:col-span-4 space-y-2 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">Legal Disclaimer (Haftungsausschluss):</span> This tool
              generates AI-based estimations for informational and educational purposes only. It does not constitute
              financial advice, investment advice, tax advice, legal advice, or a certified real-estate appraisal. All
              outputs are approximations and may contain errors or omissions. Users should not rely solely on these
              results for purchase, sale, or financing decisions. By using this tool, you agree that the creator assumes
              no liability for any decisions made based on these estimations.
            </div>
            <div>
              <span className="font-semibold text-slate-900">Privacy Notice (Datenschutzhinweis):</span> This application
              processes only the data you manually provide in order to generate predictions. No personal data is sold or
              shared with third parties. If login or account features are added in the future, stored information will
              be used exclusively for authentication and providing the service.
            </div>
            <div>
              <span className="font-semibold text-slate-900">Impressum (§5 TMG):</span> Betreiber: Mohamed Aziz Temimi;
              Düsseldorf, Germany; E-mail: mohamedaziz.temimi@epsrit.tn
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          &copy; 2025 Germany Real Estate Investment Platform. All rights reserved.
        </div>
      </footer>
    </>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={QueryClient}>
      <LanguageProvider>
        <LayoutChrome>{children}</LayoutChrome>
      </LanguageProvider>
    </QueryClientProvider>
  )
}
