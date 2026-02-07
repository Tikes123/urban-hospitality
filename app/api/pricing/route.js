import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const row = await prisma.pricing.findFirst({ orderBy: { id: "asc" } })
    if (!row) {
      return NextResponse.json({
        yearlyVendorPrice: 6000,
        hrMailPrice: 2000,
        currency: "INR",
      })
    }
    return NextResponse.json({
      yearlyVendorPrice: row.yearlyVendorPrice,
      hrMailPrice: row.hrMailPrice,
      currency: row.currency || "INR",
    })
  } catch (error) {
    console.error("Pricing fetch error:", error)
    return NextResponse.json({ yearlyVendorPrice: 6000, hrMailPrice: 2000, currency: "INR" })
  }
}
