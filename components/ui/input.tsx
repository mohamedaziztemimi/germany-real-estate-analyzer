import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 selection:bg-primary selection:text-primary-foreground border-input min-h-11 w-full min-w-0 rounded-xl border bg-white/95 px-3.5 py-2 text-base font-medium text-slate-900 shadow-[0_12px_50px_-28px_rgba(15,23,42,0.8)] transition-all duration-200 outline-none file:inline-flex file:h-9 file:items-center file:rounded-lg file:border-0 file:bg-transparent file:px-3 file:text-sm file:font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
        "focus-visible:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400/70 hover:border-slate-300",
        "dark:bg-slate-900/70 dark:text-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus-visible:border-emerald-300",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }

