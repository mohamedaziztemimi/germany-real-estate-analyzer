import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { QueryClientProvider } from "@tanstack/react-query"
import QueryClient from "@/lib/query-client"
import "./globals.css"

export const metadata: Metadata = {
  title: "Real Estate Investment Platform",
  description: "AI-powered real estate investment analysis for Germany",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryClientProvider client={QueryClient}>
          <header className="border-b border-gray-200 bg-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                RealEstate.AI
              </Link>
              <div className="flex gap-6 items-center">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
                <Link href="/analyze" className="text-gray-600 hover:text-gray-900">
                  Analyze
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/chat" className="text-gray-600 hover:text-gray-900">
                  Chat
                </Link>
                <div className="flex gap-4">
                  <Link href="/signin" className="text-gray-600 hover:text-gray-900">
                    Sign In
                  </Link>
                  <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign Up
                  </Link>
                </div>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          {children}

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl text-center text-sm text-gray-600">
              <p>&copy; 2025 Germany Real Estate Investment Platform. All rights reserved.</p>
            </div>
          </footer>
        </QueryClientProvider>
      </body>
    </html>
  )
}
