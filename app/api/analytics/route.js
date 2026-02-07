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
    const bucket = searchParams.get("bucket") || (period === "year" ? "quarter" : period === "month" ? "week" : "day")
    const hrFilter = searchParams.get("hrFilter") || "all"

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
    const BACKED_OUT_STATUSES = ["backed-out", "backed-out-not-attended-interview", "joined-and-left", "appointed-not-joined"]
    const NOT_SELECTED_STATUS = "attended-interview-not-selected"

    const hrWhere = hrFilter === "all" ? {} : { addedByHrId: hrFilter === "not_assigned" ? null : parseInt(hrFilter, 10) }
    let candidateIdsForHr = []
    if (hrFilter !== "all") {
      const list = await prisma.candidate.findMany({ where: hrWhere, select: { id: true } })
      candidateIdsForHr = list.map((c) => c.id)
    }
    const scheduleWhere = { createdAt: { gte: start, lt: end } }
    if (hrFilter !== "all") scheduleWhere.candidateId = { in: candidateIdsForHr.length ? candidateIdsForHr : [-1] }

    const [candidates, hiredCandidates, schedulesCount, allHiredInPeriod, candidatesInPeriodByStatus, schedulesInPeriod, hiredWithSchedule, hrList] = await Promise.all([
      prisma.candidate.findMany({
        where: { createdAt: { gte: start, lt: end }, ...hrWhere },
        select: { id: true, addedByHrId: true, addedByHr: { select: { id: true, name: true, email: true } } },
      }),
      prisma.candidate.findMany({
        where: { status: "hired", updatedAt: { gte: start, lt: end }, ...hrWhere },
        select: { id: true, name: true, updatedAt: true, addedByHrId: true, addedByHr: { select: { id: true, name: true, email: true } } },
      }),
      scheduleModel ? scheduleModel.count({ where: scheduleWhere }) : Promise.resolve(0),
      prisma.candidate.findMany({
        where: { status: "hired", ...hrWhere },
        select: { id: true, updatedAt: true },
      }),
      prisma.candidate.findMany({
        where: {
          ...hrWhere,
          OR: [
            { createdAt: { gte: start, lt: end } },
            { updatedAt: { gte: start, lt: end }, status: { in: ["hired", ...BACKED_OUT_STATUSES, NOT_SELECTED_STATUS] } },
          ],
        },
        select: { id: true, status: true, createdAt: true, updatedAt: true, addedByHrId: true, addedByHr: { select: { id: true, name: true, email: true } } },
      }),
      scheduleModel
        ? scheduleModel.findMany({
            where: scheduleWhere,
            select: { id: true, candidateId: true, createdAt: true },
          })
        : Promise.resolve([]),
      prisma.candidate.findMany({
        where: { status: "hired", updatedAt: { gte: start, lt: end }, ...hrWhere },
        select: { id: true },
      }),
      prisma.hr.findMany({ select: { id: true, name: true, email: true } }).catch(() => []),
    ])

    const candidateIdsWithScheduleInPeriod = new Set(schedulesInPeriod.map((s) => s.candidateId))
    const hiredFromScheduledCount = hiredWithSchedule.filter((c) => candidateIdsWithScheduleInPeriod.has(c.id)).length
    const uniqueCandidatesScheduled = candidateIdsWithScheduleInPeriod.size
    const conversionPct = uniqueCandidatesScheduled ? Math.round((hiredFromScheduledCount / uniqueCandidatesScheduled) * 100) : 0

    const candidatesAdded = candidates.length
    const hiredCount = hiredCandidates.length
    const backedOutCount = candidatesInPeriodByStatus.filter((c) => BACKED_OUT_STATUSES.includes(c.status) && c.updatedAt >= start && c.updatedAt < end).length
    const notSelectedCount = candidatesInPeriodByStatus.filter((c) => c.status === NOT_SELECTED_STATUS && c.updatedAt >= start && c.updatedAt < end).length
    const totalOutcomes = hiredCount + backedOutCount + notSelectedCount

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

    const bucketFormat = bucket
    const bucketMap = {}
    const addToBucket = (date, key, inc = 1) => {
      if (date == null) return
      const d = new Date(date)
      if (Number.isNaN(d.getTime())) return
      let bucketKey
      if (bucketFormat === "day") bucketKey = d.toISOString().slice(0, 10)
      else if (bucketFormat === "week") {
        const weekStart = new Date(d)
        weekStart.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1))
        bucketKey = weekStart.toISOString().slice(0, 10)
      } else if (bucketFormat === "month") {
        bucketKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      } else if (bucketFormat === "quarter") {
        const q = Math.floor(d.getMonth() / 3) + 1
        bucketKey = `${d.getFullYear()}-Q${q}`
      } else bucketKey = d.toISOString().slice(0, 10)
      if (!bucketMap[bucketKey]) bucketMap[bucketKey] = { label: bucketKey, hired: 0, interviewsScheduled: 0, backedOut: 0, notSelected: 0, candidatesAdded: 0 }
      bucketMap[bucketKey][key] += inc
    }
    for (const c of candidates) {
      addToBucket(c.createdAt, "candidatesAdded")
    }
    for (const c of hiredCandidates) {
      addToBucket(c.updatedAt, "hired")
    }
    for (const c of candidatesInPeriodByStatus) {
      if (BACKED_OUT_STATUSES.includes(c.status) && c.updatedAt >= start && c.updatedAt < end) addToBucket(c.updatedAt, "backedOut")
      if (c.status === NOT_SELECTED_STATUS && c.updatedAt >= start && c.updatedAt < end) addToBucket(c.updatedAt, "notSelected")
    }
    for (const s of schedulesInPeriod) {
      addToBucket(s.createdAt, "interviewsScheduled")
    }
    const barChartBuckets = Object.entries(bucketMap)
      .map(([k, v]) => ({ ...v, label: k }))
      .sort((a, b) => a.label.localeCompare(b.label))

    const hrCountMap = {}
    const hrLabel = (c) => (c.addedByHr ? `${c.addedByHr.name} (${c.addedByHr.email})` : (c.addedByHrId ? `HR#${c.addedByHrId}` : "Not assigned"))
    for (const c of candidates) {
      const key = c.addedByHrId == null ? "not_assigned" : c.addedByHrId
      if (!hrCountMap[key]) hrCountMap[key] = { count: 0, label: c.addedByHr ? `${c.addedByHr.name} (${c.addedByHr.email})` : (key === "not_assigned" ? "Not assigned" : `HR#${key}`) }
      hrCountMap[key].count += 1
    }
    const topHrByCandidates = Object.entries(hrCountMap)
      .map(([_, v]) => ({ hr: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    const scheduleCountByCandidate = {}
    for (const s of schedulesInPeriod) {
      scheduleCountByCandidate[s.candidateId] = (scheduleCountByCandidate[s.candidateId] || 0) + 1
    }
    const candidateIdToHr = {}
    for (const c of candidatesInPeriodByStatus) {
      candidateIdToHr[c.id] = c.addedByHrId != null ? c.addedByHrId : "not_assigned"
    }
    const scheduleCandidateIds = [...new Set(schedulesInPeriod.map((s) => s.candidateId))]
    if (scheduleCandidateIds.length > 0) {
      const scheduleCandidates = await prisma.candidate.findMany({
        where: { id: { in: scheduleCandidateIds } },
        select: { id: true, addedByHrId: true },
      })
      for (const c of scheduleCandidates) {
        if (candidateIdToHr[c.id] == null) candidateIdToHr[c.id] = c.addedByHrId != null ? c.addedByHrId : "not_assigned"
      }
    }
    const hrStats = {}
    const allKey = "__all__"
    hrStats[allKey] = { hr: "All", candidatesAdded: 0, hired: 0, interviewsScheduled: 0, backedOut: 0, notSelected: 0 }
    for (const c of candidatesInPeriodByStatus) {
      const key = c.addedByHrId != null ? c.addedByHrId : "not_assigned"
      const label = hrLabel(c)
      if (!hrStats[key]) hrStats[key] = { hr: label, candidatesAdded: 0, hired: 0, interviewsScheduled: 0, backedOut: 0, notSelected: 0 }
      if (c.createdAt >= start && c.createdAt < end) {
        hrStats[key].candidatesAdded += 1
        hrStats[allKey].candidatesAdded += 1
      }
      if (c.status === "hired" && c.updatedAt >= start && c.updatedAt < end) {
        hrStats[key].hired += 1
        hrStats[allKey].hired += 1
      }
      if (BACKED_OUT_STATUSES.includes(c.status) && c.updatedAt >= start && c.updatedAt < end) {
        hrStats[key].backedOut += 1
        hrStats[allKey].backedOut += 1
      }
      if (c.status === NOT_SELECTED_STATUS && c.updatedAt >= start && c.updatedAt < end) {
        hrStats[key].notSelected += 1
        hrStats[allKey].notSelected += 1
      }
    }
    for (const s of schedulesInPeriod) {
      const cid = s.candidateId
      const hrKey = candidateIdToHr[cid] != null ? candidateIdToHr[cid] : "not_assigned"
      if (!hrStats[hrKey]) {
        hrStats[hrKey] = { hr: hrKey === "not_assigned" ? "Not assigned" : `HR#${hrKey}`, candidatesAdded: 0, hired: 0, interviewsScheduled: 0, backedOut: 0, notSelected: 0 }
      }
      hrStats[hrKey].interviewsScheduled += 1
      hrStats[allKey].interviewsScheduled += 1
    }
    const hrWise = Object.values(hrStats).map((row) => {
      const total = row.hired + row.backedOut + row.notSelected || 1
      return {
        ...row,
        hiredPct: total ? Math.round((row.hired / total) * 100) : 0,
        backedOutPct: total ? Math.round((row.backedOut / total) * 100) : 0,
        notSelectedPct: total ? Math.round((row.notSelected / total) * 100) : 0,
      }
    })

    const hiredByHrMap = {}
    for (const c of hiredCandidates) {
      const label = c.addedByHr ? `${c.addedByHr.name} (${c.addedByHr.email})` : (c.addedByHrId ? `HR#${c.addedByHrId}` : "Not assigned")
      hiredByHrMap[label] = (hiredByHrMap[label] || 0) + 1
    }
    const hiredByHr = Object.entries(hiredByHrMap)
      .map(([hr, count]) => ({ hr, count }))
      .sort((a, b) => b.count - a.count)

    const hrOptions = [
      { value: "all", label: "All" },
      { value: "not_assigned", label: "Not assigned" },
      ...(Array.isArray(hrList) ? hrList.map((h) => ({ value: String(h.id), label: `${h.name} (${h.email})` })) : []),
    ]

    return NextResponse.json({
      period,
      hrFilter,
      hrOptions,
      from: start.toISOString(),
      to: end.toISOString(),
      candidatesAdded,
      hiredCount,
      interviewsScheduled: schedulesCount,
      backedOutCount,
      notSelectedCount,
      totalOutcomes,
      hiredPct: totalOutcomes ? Math.round((hiredCount / totalOutcomes) * 100) : 0,
      backedOutPct: totalOutcomes ? Math.round((backedOutCount / totalOutcomes) * 100) : 0,
      notSelectedPct: totalOutcomes ? Math.round((notSelectedCount / totalOutcomes) * 100) : 0,
      comparison: { interviewsScheduled: schedulesCount, hiredFromScheduled: hiredFromScheduledCount, uniqueCandidatesScheduled, conversionPct },
      barChartBuckets,
      pieChartSummary: [
        { name: "Hired", value: hiredCount, fill: "#22c55e" },
        { name: "Interview scheduled", value: schedulesCount, fill: "#f59e0b" },
        { name: "Backed out", value: backedOutCount, fill: "#ef4444" },
        { name: "Not selected", value: notSelectedCount, fill: "#6b7280" },
        { name: "Candidates added", value: candidatesAdded, fill: "#3b82f6" },
      ].filter((d) => d.value > 0),
      perDayHiring,
      hiredCandidates: hiredCandidates.slice(0, 50),
      topHrByCandidates,
      hiredByHr,
      hrWise,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 })
  }
}
