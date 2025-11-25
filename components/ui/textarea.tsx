import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-400/70 dark:focus-visible:border-emerald-300 dark:focus-visible:ring-emerald-400/70 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-28 w-full rounded-xl border bg-white/95 px-3.5 py-3 text-base font-medium text-slate-900 shadow-[0_12px_50px_-28px_rgba(15,23,42,0.8)] transition-all duration-200 outline-none hover:border-slate-300 dark:bg-slate-900/70 dark:text-slate-50 dark:border-slate-800 dark:hover:border-slate-700",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

