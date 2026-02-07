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

    const list = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { vendor: { select: { id: true, email: true, name: true } } },
    })

    return NextResponse.json(
      list.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error("Super-admin payments:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
