import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata = {
  title: "Germany Real Estate Investment Decision Platform",
  description: "AI-powered analysis for real estate investment decisions in Germany",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-balance mb-4 text-5xl font-bold text-gray-900">
            Germany Real Estate Investment Intelligence
          </h1>
          <p className="text-balance mb-8 text-xl text-gray-600">
            AI-powered analysis to make smarter real estate investment decisions. Get instant ROI estimates, confidence
            scores, and detailed value drivers.
          </p>
          <Link href="/analyze">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">Start Analysis</Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="mb-4 text-3xl">📊</div>
            <h3 className="mb-2 text-lg font-semibold">Instant ROI Analysis</h3>
            <p className="text-gray-600">Get estimated ROI, cap rate, and post-renovation valuations in seconds.</p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 text-3xl">🤖</div>
            <h3 className="mb-2 text-lg font-semibold">ML-Powered Insights</h3>
            <p className="text-gray-600">Machine learning model trained on real German market data and trends.</p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 text-3xl">🎯</div>
            <h3 className="mb-2 text-lg font-semibold">Decision Confidence</h3>
            <p className="text-gray-600">Confidence scores and detailed value drivers for informed decisions.</p>
          </Card>
        </div>

        {/* Data Section */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Real Market Data</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Bundesbank mortgage rates</li>
              <li>✓ Destatis property price indices</li>
              <li>✓ Berlin Mietspiegel data</li>
              <li>✓ Location & transport accessibility scoring</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">What You Get</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Buy/Don't buy recommendation</li>
              <li>✓ ROI and cap rate calculations</li>
              <li>✓ Feature importance analysis</li>
              <li>✓ Market assumption transparency</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
