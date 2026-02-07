import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session || session.adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [vendors, payments] = await Promise.all([
      prisma.adminUser.count({ where: { role: "vendor" } }),
      prisma.payment.aggregate({ _count: true, _sum: { amount: true } }),
    ])

    return NextResponse.json({
      vendors,
      payments: payments._count ?? 0,
      totalAmount: payments._sum?.amount ?? 0,
    })
  } catch (error) {
    console.error("Super-admin stats:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
