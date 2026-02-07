"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const PLANS_TEMPLATE = (yearly, monthly) => [
  {
    title: "Software subscription",
    price: `₹${(yearly ?? 6000).toLocaleString("en-IN")}`,
    period: "/year",
    description: "Full access to the Urban Hospitality platform for your agency.",
    features: [
      "Dashboard & analytics",
      "Candidate & outlet management",
      "CV links & designations",
      "Client management",
      "Support",
    ],
  },
  {
    title: "Per employee activation",
    price: `₹${(monthly ?? 2000).toLocaleString("en-IN")}`,
    period: "/month",
    description: "Per email ID activation for each employee using the system.",
    features: [
      "One active session per email",
      "Secure login",
      "Role-based access",
      "Device limit enforced",
    ],
  },
]

export default function ForBusinessPage() {
  const [pricing, setPricing] = useState({ yearlyVendorPrice: 6000, hrMailPrice: 2000 })
  useEffect(() => {
    fetch("/api/pricing").then((r) => (r.ok ? r.json() : {})).then(setPricing).catch(() => {})
  }, [])
  const PLANS = PLANS_TEMPLATE(pricing.yearlyVendorPrice, pricing.hrMailPrice)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-light)]/20 to-white">
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">For Business</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Agencies like yours can license our software. One subscription, per-employee activation—simple pricing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <Card key={plan.title} className="border-2 border-[var(--brand)]/20 hover:border-[var(--brand)]/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-xl">{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--brand)]">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-[var(--brand)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)]" asChild>
                  <Link href="/contact#demo">Get started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">One email ID cannot be used on multiple devices at the same time.</p>
          <Button variant="outline" className="border-[var(--brand)] text-[var(--brand)]" asChild>
            <Link href="/contact">Contact us for a demo</Link>
          </Button>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
