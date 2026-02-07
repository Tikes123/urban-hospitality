import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const scheduleModel = prisma.interviewSchedule ?? prisma.InterviewSchedule

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid candidate id" }, { status: 400 })
    if (!scheduleModel) return NextResponse.json({ error: "InterviewSchedule model not available" }, { status: 500 })

    const schedules = await scheduleModel.findMany({
      where: { candidateId: id },
      include: { outlet: true, taggedBy: true },
      orderBy: { scheduledAt: "desc" },
    })

    return NextResponse.json(schedules.map((s) => ({
      ...s,
      scheduledAt: s.scheduledAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      taggedBy: s.taggedBy ? { id: s.taggedBy.id, name: s.taggedBy.name, email: s.taggedBy.email } : null,
    })))
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

async function getVendorSession(request) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!auth) return null
  return prisma.session.findFirst({
    where: { sessionToken: auth, expiresAt: { gt: new Date() } },
    include: { adminUser: true },
  })
}

export async function POST(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid candidate id" }, { status: 400 })
    if (!scheduleModel) return NextResponse.json({ error: "InterviewSchedule model not available" }, { status: 500 })

    const session = await getVendorSession(request)
    const taggedByAdminUserId = session?.adminUserId ?? null

    const body = await request.json()
    const { slots } = body
    // slots: [{ outletId, scheduledAt, type, status, remarks }]
    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "At least one schedule slot required" }, { status: 400 })
    }

    const created = []
    for (const slot of slots) {
      const { outletId, scheduledAt, type, status, remarks } = slot
      if (!outletId || !scheduledAt) continue
      const schedule = await scheduleModel.create({
        data: {
          candidateId: id,
          outletId: parseInt(outletId),
          scheduledAt: new Date(scheduledAt),
          type: type || null,
          status: status || null,
          remarks: remarks || null,
          taggedByAdminUserId,
        },
        include: { outlet: true, taggedBy: true },
      })
      created.push({
        ...schedule,
        scheduledAt: schedule.scheduledAt.toISOString(),
        createdAt: schedule.createdAt.toISOString(),
        taggedBy: schedule.taggedBy ? { id: schedule.taggedBy.id, name: schedule.taggedBy.name, email: schedule.taggedBy.email } : null,
      })
    }

    // Optionally update candidate status to interview-scheduled
    await prisma.candidate.update({
      where: { id },
      data: { status: "interview-scheduled" },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}
