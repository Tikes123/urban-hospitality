import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { BANGALORE_AREAS } from "@/lib/areas"

export async function GET(request) {
  try {
    const type = request.nextUrl.searchParams.get("type") || "all"
    const outlets = await prisma.outlet.findMany({
      where: { status: "active" },
      select: { id: true, name: true, type: true, address: true, area: true, openPositions: true },
    })

    const areaData = BANGALORE_AREAS.map((area) => {
      const inArea = outlets.filter(
        (o) =>
          (o.area && o.area.toLowerCase() === area.toLowerCase()) ||
          (o.address && o.address.toLowerCase().includes(area.toLowerCase()))
      )
      const byType = {
        hotel: inArea.filter((o) => o.type === "hotel").length,
        restaurant: inArea.filter((o) => o.type === "restaurant").length,
        bar: inArea.filter((o) => o.type === "bar").length,
      }
      const totalVenues = inArea.length
      const jobCount = inArea.reduce((s, o) => s + (o.openPositions || 0), 0) || (totalVenues > 0 ? 1 : 0)
      return {
        area,
        jobCount,
        totalVenues,
        hotel: byType.hotel,
        restaurant: byType.restaurant,
        bar: byType.bar,
      }
    })

    let filtered = areaData
    if (type !== "all") {
      filtered = areaData
        .map((a) => ({
          ...a,
          jobCount: type === "hotel" ? (a.hotel ? a.jobCount : 0) : type === "restaurant" ? (a.restaurant ? a.jobCount : 0) : type === "bar" ? (a.bar ? a.jobCount : 0) : a.jobCount,
        }))
        .filter((a) => a.jobCount > 0 || a.totalVenues > 0)
    }

    const withNearest = filtered.map((a) => {
      let nearest = a
      if (a.jobCount === 0 && a.totalVenues === 0) {
        const withJobs = filtered.filter((x) => x.jobCount > 0)
        nearest = withJobs.length > 0 ? withJobs[0] : a
      }
      return { ...a, nearestArea: nearest.area, nearestJobCount: nearest.jobCount }
    })

    return NextResponse.json(withNearest)
  } catch (error) {
    console.error("Error fetching job areas:", error)
    return NextResponse.json({ error: "Failed to fetch areas" }, { status: 500 })
  }
}
