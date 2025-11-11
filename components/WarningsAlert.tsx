import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface WarningsAlertProps {
  warnings?: string[]
}

export function WarningsAlert({ warnings }: WarningsAlertProps) {
  if (!warnings || warnings.length === 0) {
    return null
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="ml-2 text-yellow-800">
        <p className="font-semibold mb-2">Warnings:</p>
        <ul className="list-inside list-disc space-y-1">
          {warnings.map((warning, idx) => (
            <li key={idx} className="text-sm">
              {warning}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
