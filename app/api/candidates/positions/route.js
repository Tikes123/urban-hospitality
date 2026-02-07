import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET /api/candidates/positions - returns distinct position values for filter dropdowns */
export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      select: { position: true },
      distinct: ["position"],
      orderBy: { position: "asc" },
    })
    const positions = candidates.map((c) => c.position).filter((p) => p != null && String(p).trim() !== "")
    return NextResponse.json(positions)
  } catch (error) {
    console.error("Error fetching positions:", error)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}
