"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Script from "next/script"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function BillingPage() {
  const [pricing, setPricing] = useState({ yearlyVendorPrice: 6000, hrMailPrice: 2000, currency: "INR" })
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setPricing)
      .catch(() => {})
  }, [])

  const annual = pricing.yearlyVendorPrice ?? 6000
  const perHr = pricing.hrMailPrice ?? 2000

  const handlePayNow = async (amount, type) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) {
      toast.error("Please log in")
      return
    }
    setPaying(true)
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, type }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order")

      if (typeof window === "undefined" || !window.Razorpay) {
        toast.error("Razorpay not loaded")
        setPaying(false)
        return
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount * 100,
        currency: "INR",
        name: "Urban Hospitality",
        description: type === "subscription" ? "Annual subscription" : "HR seat",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                type,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok && verifyData.success) {
              toast.success("Payment successful")
            } else {
              toast.error(verifyData.error || "Verification failed")
            }
          } catch (_) {
            toast.error("Verification failed")
          } finally {
            setPaying(false)
          }
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", () => {
        toast.error("Payment failed")
        setPaying(false)
      })
      rzp.open()
    } catch (err) {
      toast.error(err.message || "Payment failed")
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing</h1>
          <p className="text-gray-600 mb-6">App subscription and HR seats are separate transactions. Pay for each as needed.</p>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  App subscription (annual)
                </CardTitle>
                <CardDescription>One-time annual payment. Separate from HR seat payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{annual.toLocaleString("en-IN")} <span className="text-sm font-normal text-gray-500">/year</span></p>
                    <p className="text-sm text-gray-500">Full access to UHS Applicant Tracking System</p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700" disabled={paying} onClick={() => handlePayNow(annual, "subscription")}>
                    {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Pay ₹{annual.toLocaleString("en-IN")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HR email seats</CardTitle>
                <CardDescription>₹{perHr.toLocaleString("en-IN")}/month per HR — paid when you add each HR in Manage HR (separate transaction per HR).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">₹{perHr.toLocaleString("en-IN")} <span className="text-sm font-normal text-gray-500">/month per email</span></p>
                    <p className="text-sm text-gray-500">Go to Manage HR → Add HR → pay ₹{perHr.toLocaleString("en-IN")} to create each HR email</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/vendor/manage-hr">Manage HR & pay per seat</Link>
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
