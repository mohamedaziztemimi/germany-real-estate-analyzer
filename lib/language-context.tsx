"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { Language, TranslationKeys } from "./translations"
import { translations } from "./translations"

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  strings: Record<TranslationKeys, string>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)
const STORAGE_KEY = "rea_language"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null
    if (saved) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang)
    }
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      strings: translations[language],
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
