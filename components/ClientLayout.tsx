"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { QueryClientProvider } from "@tanstack/react-query"
import QueryClient from "@/lib/query-client"
import { LogoutButton } from "@/components/LogoutButton"
import { useAuth } from "@/lib/hooks-auth"
import { LanguageProvider, useLanguage } from "@/lib/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"

function NavigationContent() {
  const { data: authData } = useAuth()
  const isAuthenticated = !!authData?.user
  const isAdmin = authData?.user?.role === "admin"
  const { strings } = useLanguage()
   const pathname = usePathname()

  const navItems = [
    { href: "/", label: strings.home, private: false },
    { href: "/dashboard", label: strings.dashboard, private: true },
    { href: "/analyses", label: strings.analyses, private: true },
    { href: "/shared", label: strings.discussions, private: true },
    ...(isAdmin ? [{ href: "/admin/users", label: strings.users, private: true }] : []),
  ].filter((item) => !item.private || isAuthenticated)

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
      {navItems.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative rounded-md px-3 py-2 transition ${
              active ? "text-white" : "text-slate-300 hover:text-white"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
            <span
              className={`absolute inset-x-2 -bottom-1 h-[3px] rounded-full bg-blue-500 transition-all duration-300 ${
                active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:opacity-60"
              }`}
              aria-hidden="true"
            />
          </Link>
        )
      })}
      <div className="flex items-center gap-3 pl-2">
        {isAuthenticated && <LogoutButton />}
        {!isAuthenticated && (
          <>
            <Link href="/signin" className="text-slate-300 hover:text-white transition">
              {strings.signIn}
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-blue-600 px-3 py-2 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
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
      <header className="sticky top-0 z-30 backdrop-blur bg-slate-950/80 border-b border-slate-800">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              {strings.brand}
            </Link>
            <span className="hidden rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-semibold text-green-200 sm:inline">
              For SMB teams
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

      <footer className="border-t border-slate-800 bg-slate-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-4 text-sm text-slate-300">
          <div className="space-y-3">
            <div className="text-white font-semibold">{strings.brand}</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Data-driven real estate decisions for operators and investors.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-300">
              <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
              99.9% uptime
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/analyses" className="hover:text-white">Analyses</Link></li>
              <li><Link href="/shared" className="hover:text-white">Collaboration</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Trust</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center">✓</span>
                GDPR aligned
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center">✓</span>
                Role-based access
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center">✓</span>
                Encrypted at rest
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
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
