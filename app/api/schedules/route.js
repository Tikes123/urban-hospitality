import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/schedules?from=YYYY-MM-DD&to=YYYY-MM-DD - for calendar
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromStr = searchParams.get("from")
    const toStr = searchParams.get("to")
    const from = fromStr ? new Date(fromStr + "T00:00:00.000Z") : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const to = toStr ? new Date(toStr + "T23:59:59.999Z") : new Date(from.getFullYear(), from.getMonth() + 1, 0, 23, 59, 59)

    const schedules = await prisma.interviewSchedule.findMany({
      where: {
        scheduledAt: { gte: from, lte: to },
      },
      include: {
        candidate: true,
        outlet: true,
      },
      orderBy: { scheduledAt: "asc" },
    })

    return NextResponse.json(
      schedules.map((s) => ({
        id: s.id,
        scheduledAt: s.scheduledAt.toISOString(),
        type: s.type,
        remarks: s.remarks,
        candidateId: s.candidateId,
        candidateName: s.candidate?.name,
        outletId: s.outletId,
        outletName: s.outlet?.name,
      }))
    )
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}
