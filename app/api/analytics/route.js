import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const scheduleModel = prisma.interviewSchedule ?? prisma.InterviewSchedule

function getStartEndToday() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return { start, end }
}

function getStartEndForPeriod(period, customFrom, customTo) {
  const now = new Date()
  if (customFrom) {
    const start = new Date(customFrom)
    start.setUTCHours(0, 0, 0, 0)
    const end = customTo ? new Date(customTo) : new Date(start)
    if (!customTo) {
      end.setUTCDate(end.getUTCDate() + 1)
    } else {
      end.setUTCHours(23, 59, 59, 999)
    }
    return { start, end }
  }
  if (period === "day") {
    const { start: s, end: e } = getStartEndToday()
    return { start: s, end: e }
  }
  if (period === "week") {
    const day = now.getUTCDay()
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1)
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff))
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 7)
    return { start, end }
  }
  if (period === "month") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    return { start, end }
  }
  if (period === "year") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    const end = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1))
    return { start, end }
  }
  const { start: s, end: e } = getStartEndToday()
  return { start: s, end: e }
}

/** GET /api/analytics?period=today
 *  GET /api/analytics?period=day|week|month|year&from=ISO&to=ISO (optional from/to for range)
 */
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get("period") || "today"
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    if (period === "today") {
      const { start, end } = getStartEndToday()
      const [candidatesAddedToday, interviewsScheduledToday, hiredToday] = await Promise.all([
        prisma.candidate.count({ where: { createdAt: { gte: start, lt: end } } }),
        scheduleModel
          ? scheduleModel.count({ where: { createdAt: { gte: start, lt: end } } })
          : Promise.resolve(0),
        prisma.candidate.count({
          where: {
            status: "hired",
            updatedAt: { gte: start, lt: end },
          },
        }),
      ])
      return NextResponse.json({
        period: "today",
        candidatesAddedToday,
        interviewsScheduledToday,
        hiredToday,
      })
    }

    const { start, end } = getStartEndForPeriod(period, from, to)

    const [candidates, hiredCandidates, schedules, allHiredInPeriod] = await Promise.all([
      prisma.candidate.findMany({
        where: { createdAt: { gte: start, lt: end } },
        select: { id: true, addedByHrId: true, addedByHr: { select: { id: true, name: true, email: true } } },
      }),
      prisma.candidate.findMany({
        where: { status: "hired", updatedAt: { gte: start, lt: end } },
        select: { id: true, name: true, updatedAt: true, addedByHrId: true, addedByHr: { select: { id: true, name: true, email: true } } },
      }),
      scheduleModel
        ? scheduleModel.count({ where: { createdAt: { gte: start, lt: end } } })
        : Promise.resolve(0),
      prisma.candidate.findMany({
        where: { status: "hired" },
        select: { id: true, updatedAt: true },
      }),
    ])

    const candidatesAdded = candidates.length
    const hiredCount = hiredCandidates.length

    const perDayHiringMap = {}
    const periodStart = new Date(start)
    const periodEnd = new Date(end)
    for (const c of allHiredInPeriod) {
      const d = c.updatedAt
      if (d >= periodStart && d < periodEnd) {
        const key = d.toISOString().slice(0, 10)
        perDayHiringMap[key] = (perDayHiringMap[key] || 0) + 1
      }
    }
    const perDayHiring = Object.entries(perDayHiringMap)
      .map(([date, count]) => ({ date, hiredCount: count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const hrCountMap = {}
    for (const c of candidates) {
      const key = c.addedByHrId == null ? "not_assigned" : c.addedByHrId
      if (!hrCountMap[key]) hrCountMap[key] = { count: 0, label: c.addedByHr ? `${c.addedByHr.name} (${c.addedByHr.email})` : (key === "not_assigned" ? "Not assigned" : `HR#${key}`) }
      hrCountMap[key].count += 1
    }
    const topHrByCandidates = Object.entries(hrCountMap)
      .map(([_, v]) => ({ hr: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    const hiredByHrMap = {}
    for (const c of hiredCandidates) {
      const label = c.addedByHr ? `${c.addedByHr.name} (${c.addedByHr.email})` : (c.addedByHrId ? `HR#${c.addedByHrId}` : "Not assigned")
      hiredByHrMap[label] = (hiredByHrMap[label] || 0) + 1
    }
    const hiredByHr = Object.entries(hiredByHrMap)
      .map(([hr, count]) => ({ hr, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      period,
      from: start.toISOString(),
      to: end.toISOString(),
      candidatesAdded,
      hiredCount,
      interviewsScheduled: schedules,
      perDayHiring,
      hiredCandidates: hiredCandidates.slice(0, 50),
      topHrByCandidates,
      hiredByHr,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}
