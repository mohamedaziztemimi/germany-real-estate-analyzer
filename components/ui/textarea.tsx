import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:border-blue-200 focus-visible:ring-2 focus-visible:ring-blue-200/70 dark:focus-visible:border-blue-300 dark:focus-visible:ring-blue-300/60 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive min-h-28 w-full rounded-xl border bg-white px-3.5 py-3 text-base font-medium text-slate-900 transition-all duration-200 outline-none hover:border-slate-200 dark:bg-slate-900/70 dark:text-slate-50 dark:border-slate-800 dark:hover:border-slate-700",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

