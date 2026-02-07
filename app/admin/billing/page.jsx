"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"

export default function BillingPage() {
  const [pricing, setPricing] = useState({ yearlyVendorPrice: 6000, hrMailPrice: 2000, currency: "INR" })

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setPricing)
      .catch(() => {})
  }, [])

  const annual = pricing.yearlyVendorPrice ?? 6000
  const perHr = pricing.hrMailPrice ?? 2000

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing</h1>
          <p className="text-gray-600 mb-6">Pay for your app subscription and HR email seats.</p>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  App subscription
                </CardTitle>
                <CardDescription>Annual platform access.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{annual.toLocaleString("en-IN")} <span className="text-sm font-normal text-gray-500">/year</span></p>
                    <p className="text-sm text-gray-500">Full access to UHS Applicant Tracking System</p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">Pay now</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HR email seats</CardTitle>
                <CardDescription>Per-employee email activation for your team. Add HR in Manage HR.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{perHr.toLocaleString("en-IN")} <span className="text-sm font-normal text-gray-500">/month per email</span></p>
                    <p className="text-sm text-gray-500">Add or remove seats in Manage HR</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/admin/manage-hr">Manage seats</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current plan</CardTitle>
                <CardDescription>Your billing status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <span className="text-sm text-gray-600">Next billing date: —</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
