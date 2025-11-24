"use client"

import type React from "react"
import Link from "next/link"
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

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
      <Link href="/" className="hover:text-gray-900">
        {strings.home}
      </Link>
      {isAuthenticated && (
        <>
          <Link href="/dashboard" className="hover:text-gray-900">
            {strings.dashboard}
          </Link>
          <Link href="/analyses" className="hover:text-gray-900">
            {strings.analyses}
          </Link>
          <Link href="/shared" className="hover:text-gray-900">
            {strings.discussions}
          </Link>
          {isAdmin && (
            <Link href="/admin/users" className="hover:text-gray-900">
              {strings.users}
            </Link>
          )}
        </>
      )}
      <div className="flex gap-3 items-center">
        {isAuthenticated && <LogoutButton />}
        {!isAuthenticated && (
          <>
            <Link href="/signin" className="hover:text-gray-900">
              {strings.signIn}
            </Link>
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
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
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            {strings.brand}
          </Link>
          <div className="flex flex-1 justify-center">
            <NavigationContent />
          </div>
          <LanguageSelector />
        </nav>
      </header>

      {children}

      <footer className="border-t border-gray-200 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-600">
          <p>&copy; 2025 Germany Real Estate Investment Platform. All rights reserved.</p>
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
