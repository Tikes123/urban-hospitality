import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/schedules?from=YYYY-MM-DD&to=YYYY-MM-DD&candidateIds=1,2,3&outletId=1 - for calendar or outlet view
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromStr = searchParams.get("from")
    const toStr = searchParams.get("to")
    const candidateIdsStr = searchParams.get("candidateIds")
    const outletIdStr = searchParams.get("outletId")
    
    const where = {}
    
    if (fromStr || toStr) {
      const from = fromStr ? new Date(fromStr + "T00:00:00.000Z") : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const to = toStr ? new Date(toStr + "T23:59:59.999Z") : new Date(from.getFullYear(), from.getMonth() + 1, 0, 23, 59, 59)
      where.scheduledAt = { gte: from, lte: to }
    }
    
    if (candidateIdsStr) {
      const candidateIds = candidateIdsStr.split(",").map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      if (candidateIds.length > 0) {
        where.candidateId = { in: candidateIds }
      }
    }
    
    if (outletIdStr) {
      const outletId = parseInt(outletIdStr, 10)
      if (!isNaN(outletId)) {
        where.outletId = outletId
      }
    }

    const schedules = await prisma.interviewSchedule.findMany({
      where,
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
