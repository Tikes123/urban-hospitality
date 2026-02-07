import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Razorpay from "razorpay"

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { amount, type = "subscription", hrName, hrEmail, hrPhone } = body
    let amountNum = Math.round(Number(amount) || 0)
    if (type === "hr_monthly") {
      amountNum = 2000
    }
    if (amountNum < 1) return NextResponse.json({ error: "Invalid amount" }, { status: 400 })

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) return NextResponse.json({ error: "Payment not configured" }, { status: 503 })

    let vendor = await prisma.vendor.findUnique({
      where: { email: session.adminUser.email },
    })
    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          name: session.adminUser.name || session.adminUser.email,
          email: session.adminUser.email,
          status: "active",
        },
      })
    }

    const notes = {
      type: type || "subscription",
      vendorId: String(vendor.id),
      adminUserId: String(session.adminUserId),
    }
    if (type === "hr_monthly" && hrName && hrEmail) {
      notes.hrName = String(hrName).trim()
      notes.hrEmail = String(hrEmail).trim()
      notes.hrPhone = hrPhone ? String(hrPhone).trim() : ""
    }

    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const order = await instance.orders.create({
      amount: amountNum * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${session.adminUserId}`,
      notes,
    })

    return NextResponse.json({
      orderId: order.id,
      keyId,
      amount: amountNum,
      type: type || "subscription",
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
