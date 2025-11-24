"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export function HomeLanding() {
  const { strings } = useLanguage()

  const features = [
    { icon: "[AI]", title: strings.feature1Title, description: strings.feature1Description },
    { icon: "[ROI]", title: strings.feature2Title, description: strings.feature2Description },
    { icon: "[Data]", title: strings.feature3Title, description: strings.feature3Description },
  ]

  const marketData = [
    strings.dataList1Item1,
    strings.dataList1Item2,
    strings.dataList1Item3,
    strings.dataList1Item4,
  ]

  const deliverables = [
    strings.dataList2Item1,
    strings.dataList2Item2,
    strings.dataList2Item3,
    strings.dataList2Item4,
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h1 className="text-balance mb-4 text-5xl font-bold text-gray-900">{strings.heroTitle}</h1>
          <p className="text-balance mb-8 text-xl text-gray-600">{strings.heroSubtitle}</p>
          <Link href="/analyze">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg">{strings.heroCta}</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <div className="mb-4 text-3xl" aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold">{strings.dataTitle1}</h2>
            <ul className="space-y-2 text-gray-700">
              {marketData.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">{strings.dataTitle2}</h2>
            <ul className="space-y-2 text-gray-700">
              {deliverables.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
