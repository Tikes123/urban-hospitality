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
      include: { outlet: true },
      orderBy: { scheduledAt: "desc" },
    })

    return NextResponse.json(schedules.map((s) => ({
      ...s,
      scheduledAt: s.scheduledAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      taggedBy: null,
    })))
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid candidate id" }, { status: 400 })
    if (!scheduleModel) return NextResponse.json({ error: "InterviewSchedule model not available" }, { status: 500 })

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
        },
        include: { outlet: true },
      })
      created.push({
        ...schedule,
        scheduledAt: schedule.scheduledAt.toISOString(),
        createdAt: schedule.createdAt.toISOString(),
        taggedBy: null,
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
