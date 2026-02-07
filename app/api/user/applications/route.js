import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.userSession.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { user: true },
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const candidates = await prisma.candidate.findMany({
      where: { userId: session.userId },
      orderBy: { appliedDate: "desc" },
    })

    return NextResponse.json(
      candidates.map((c) => ({
        id: c.id,
        position: c.position,
        location: c.location,
        status: c.status,
        appliedDate: c.appliedDate.toISOString().split("T")[0],
        createdAt: c.createdAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error("User applications:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
