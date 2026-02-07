import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type = "subscription" } = body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment data" }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) return NextResponse.json({ error: "Payment not configured" }, { status: 503 })

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const existing = await prisma.payment.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
    })
    if (existing) {
      return NextResponse.json({ success: true, message: "Already verified" })
    }

    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: {
        Authorization: "Basic " + Buffer.from(process.env.RAZORPAY_KEY_ID + ":" + keySecret).toString("base64"),
      },
    })
    const orderData = await orderRes.json()
    const amount = orderData.amount ? orderData.amount / 100 : 0
    const notes = orderData.notes || {}
    const vendorId = notes.vendorId ? parseInt(notes.vendorId, 10) : null
    if (!vendorId) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 })
    }

    await prisma.payment.create({
      data: {
        vendorId,
        amount,
        type: type || "subscription",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "success",
      },
    })

    if (type === "hr_monthly" && notes.adminUserId && notes.hrName && notes.hrEmail) {
      const adminUserId = parseInt(notes.adminUserId, 10)
      if (!isNaN(adminUserId)) {
        await prisma.hr.create({
          data: {
            vendorId: adminUserId,
            name: notes.hrName,
            email: notes.hrEmail,
            phone: notes.hrPhone || null,
          },
        })
      }
    }

    return NextResponse.json({ success: true, message: "Payment verified" })
  } catch (error) {
    console.error("Verify payment error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
