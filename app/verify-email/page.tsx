"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function VerifyEmailPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-lg p-8 space-y-4">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-center">Verify your email</h1>
          <p className="text-center text-gray-600">
            Signups now use a 6-digit code sent to your email. Enter that code in the signup form to finish creating
            your account.
          </p>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            If you need a new code, return to the signup page and request another one.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => router.push("/")}>
            Go to homepage
          </Button>
          <Button onClick={() => router.push("/signup")}>Back to sign up</Button>
        </div>
      </Card>
    </main>
  )
}
