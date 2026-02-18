import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** Parse candidate salary string to number (e.g. "20,000" / "20k" / "20000" → 20000) */
function parseSalaryToNumber(salaryStr) {
  if (salaryStr == null || typeof salaryStr !== "string") return null
  const trimmed = salaryStr.trim().replace(/,/g, "")
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()
  let num = parseFloat(lower.replace(/[^\d.]/g, ""), 10)
  if (Number.isNaN(num)) return null
  if (lower.endsWith("k") || lower.endsWith("l") || lower.endsWith("lac")) num *= 1000
  return Math.round(num)
}

/** Points by salary tier: ≥25k = 3, ≥20k = 2, ≥15k = 1, else 0 */
function pointsForSalary(salaryNum) {
  if (salaryNum == null || salaryNum < 15000) return 0
  if (salaryNum >= 25000) return 3
  if (salaryNum >= 20000) return 2
  if (salaryNum >= 15000) return 1
  return 0
}

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const vendorId = session.adminUserId

    const hrs = await prisma.hr.findMany({
      where: { vendorId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    })

    const candidates = await prisma.candidate.findMany({
      where: { addedByHrId: { in: hrs.map((h) => h.id) } },
      select: { id: true, addedByHrId: true, salary: true },
    })

    const byHr = {}
    hrs.forEach((h) => {
      byHr[h.id] = {
        hr: { id: h.id, name: h.name, email: h.email },
        count15: 0,
        count20: 0,
        count25: 0,
        totalCandidates: 0,
        totalPoints: 0,
      }
    })

    candidates.forEach((c) => {
      if (c.addedByHrId == null || !byHr[c.addedByHrId]) return
      const row = byHr[c.addedByHrId]
      row.totalCandidates += 1
      const num = parseSalaryToNumber(c.salary)
      const points = pointsForSalary(num)
      row.totalPoints += points
      if (points >= 3) row.count25 += 1
      else if (points >= 2) row.count20 += 1
      else if (points >= 1) row.count15 += 1
    })

    const data = hrs.map((h) => ({
      ...byHr[h.id],
      rank: 0,
    }))

    data.sort((a, b) => b.totalPoints - a.totalPoints)
    data.forEach((row, i) => {
      row.rank = i + 1
    })

    return NextResponse.json({
      pointsRule: {
        "≥ ₹15,000": 1,
        "≥ ₹20,000": 2,
        "≥ ₹25,000": 3,
      },
      data,
    })
  } catch (error) {
    console.error("Vendor incentives GET:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
