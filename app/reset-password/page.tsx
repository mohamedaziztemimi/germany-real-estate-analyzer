"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ResetPasswordRedirectPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="text-gray-600">
            We now send a 6-digit verification code to your email. Please use the{" "}
            <strong>Forgot password</strong> page to request a new code and update your password securely.
          </p>
          <Link href="/forgot-password">
            <Button className="bg-blue-600 hover:bg-blue-700 mt-2 w-full">Go to forgot password</Button>
          </Link>
        </Card>
      </div>
    </main>
  )
}
