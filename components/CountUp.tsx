import { useEffect, useRef, useState } from "react"

type CountUpProps = {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  formatter?: (value: number) => string
}

// Lightweight, UI-friendly count-up animation for KPIs.
export function CountUp({ value, duration = 800, decimals = 0, prefix = "", suffix = "", formatter }: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = display
    const target = Number.isFinite(value) ? value : 0
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const next = startValue + (target - startValue) * eased
      setDisplay(next)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const formatted = formatter
    ? formatter(display)
    : `${prefix}${display.toFixed(decimals)}${suffix}`

  return <span>{formatted}</span>
}
