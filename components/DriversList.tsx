import { Card } from "@/components/ui/card"
import type { Driver } from "@/lib/schemas"

interface DriversListProps {
  drivers: Driver[]
}

export function DriversList({ drivers }: DriversListProps) {
  const sorted = [...drivers].sort((a, b) => Math.abs(b.effect) - Math.abs(a.effect))

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Key Value Drivers</h3>
      <div className="space-y-3">
        {sorted.map((driver, idx) => (
          <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
            <span className="text-sm text-gray-700">{driver.feature}</span>
            <span className={`text-sm font-semibold ${driver.effect > 0 ? "text-green-600" : "text-red-600"}`}>
              {driver.effect > 0 ? "+" : ""}
              {(driver.effect * 100).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
