"use client"

import { useEffect, useRef, useState } from "react"
import { useGoogleSignInMutation } from "@/lib/hooks-auth"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

declare global {
  interface Window {
    google?: any
  }
}

type GoogleLoginButtonProps = {
  remember?: boolean
  variant?: "solid" | "outline"
  fullWidth?: boolean
}

export function GoogleLoginButton({ remember = true, variant = "outline", fullWidth }: GoogleLoginButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initRef = useRef(false)
  const { mutate, isPending } = useGoogleSignInMutation()

  useEffect(() => {
    if (!clientId) {
      setError("Google sign-in is not configured.")
      return
    }
    if (window.google) {
      setReady(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = () => setReady(true)
    script.onerror = () => setError("Failed to load Google sign-in.")
    document.head.appendChild(script)
  }, [clientId])

  const handleClick = () => {
    setError(null)
    if (!clientId) {
      setError("Google sign-in is not configured.")
      return
    }
    if (!window.google?.accounts?.id) {
      setError("Google is not ready yet. Please try again.")
      return
    }
    if (!initRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          const credential = response?.credential
          if (!credential) {
            setError("No credential returned. Please try again.")
            return
          }
          mutate({ credential, remember })
        },
        ux_mode: "popup",
      })
      initRef.current = true
    }
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        setError("Popup blocked. Please allow popups for Google sign-in.")
      }
    })
  }

  const btnClass =
    variant === "solid"
      ? "bg-white text-slate-900 hover:bg-slate-50 border border-slate-200"
      : "border-slate-300 text-slate-800 hover:border-blue-500 hover:text-blue-700"

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <Button
        type="button"
        variant="outline"
        disabled={!ready || isPending}
        onClick={handleClick}
        className={`${btnClass} ${fullWidth ? "w-full justify-center" : ""}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.5 12.273c0-.815-.073-1.598-.209-2.348H12v4.44h5.92a5.06 5.06 0 0 1-2.195 3.32v2.757h3.547c2.078-1.915 3.228-4.733 3.228-8.17Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.91 0 5.354-.96 7.138-2.605l-3.547-2.757c-.986.66-2.246 1.05-3.591 1.05-2.762 0-5.1-1.864-5.937-4.37H2.36v2.772A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC04"
            d="M6.063 14.318A6.61 6.61 0 0 1 5.708 12c0-.807.14-1.59.355-2.318V6.91H2.36A11 11 0 0 0 1 12c0 1.784.427 3.463 1.36 5.09l3.703-2.772Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.273c1.584 0 3.005.545 4.125 1.615l3.086-3.086C17.351 1.545 14.91.5 12 .5 7.969.5 4.45 2.79 2.36 6.91l3.703 2.772C6.899 7.91 9.238 5.273 12 5.273Z"
          />
        </svg>
        <span className="ml-2 text-sm font-semibold">Continue with Google</span>
      </Button>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}
