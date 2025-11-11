import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientLayout } from "@/components/ClientLayout"

export const metadata: Metadata = {
  title: "Real Estate Investment Platform",
  description: "AI-powered real estate investment analysis for Germany",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
