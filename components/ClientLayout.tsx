"use client"

import type React from "react"
import Link from "next/link"
import { QueryClientProvider } from "@tanstack/react-query"
import QueryClient from "@/lib/query-client"
import { LogoutButton } from "@/components/LogoutButton"
import { useAuth } from "@/lib/hooks-auth"

function NavigationContent() {
  const { data: authData } = useAuth()
  const isAuthenticated = !!authData?.user
  const isAdmin = authData?.user?.role === "admin"

  return (
    <div className="flex gap-6 items-center">
      <Link href="/" className="text-gray-600 hover:text-gray-900">
        Home
      </Link>
      {isAuthenticated && (
        <>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/analyses" className="text-gray-600 hover:text-gray-900">
            Analysis
          </Link>
          <Link href="/shared" className="text-gray-600 hover:text-gray-900">
            Discussions
          </Link>
          {isAdmin && (
            <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
              Users
            </Link>
          )}
        </>
      )}
      <div className="flex gap-4 items-center">
        {isAuthenticated && <LogoutButton />}
        {!isAuthenticated && (
          <>
            <Link href="/signin" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={QueryClient}>
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            RealEstate.AI
          </Link>
          <NavigationContent />
        </nav>
      </header>

      {children}

      <footer className="border-t border-gray-200 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-600">
          <p>&copy; 2025 Germany Real Estate Investment Platform. All rights reserved.</p>
        </div>
      </footer>
    </QueryClientProvider>
  )
}
