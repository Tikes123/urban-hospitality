import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request) {
  try {
    const body = await request.json()
    const { candidateIds, scheduledAt, outletId } = body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json({ error: "candidateIds array is required" }, { status: 400 })
    }

    if (!scheduledAt) {
      return NextResponse.json({ error: "scheduledAt date is required" }, { status: 400 })
    }

    if (!outletId) {
      return NextResponse.json({ error: "outletId is required" }, { status: 400 })
    }

    const date = new Date(scheduledAt)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 })
    }

    const candidateIdInts = candidateIds.map((id) => parseInt(id, 10))
    const outletIdInt = parseInt(outletId, 10)

    // Update or create interview schedules for the selected outlet
    let updatedCount = 0
    for (const candidateId of candidateIdInts) {
      // Check if schedule exists
      const existing = await prisma.interviewSchedule.findFirst({
        where: {
          candidateId,
          outletId: outletIdInt,
        },
      })

      if (existing) {
        // Update existing schedule
        await prisma.interviewSchedule.update({
          where: { id: existing.id },
          data: { scheduledAt: date },
        })
        updatedCount++
      } else {
        // Create new schedule
        await prisma.interviewSchedule.create({
          data: {
            candidateId,
            outletId: outletIdInt,
            scheduledAt: date,
          },
        })
        updatedCount++
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      message: `Updated date for ${updatedCount} candidate(s)`,
    })
  } catch (error) {
    console.error("Error updating bulk date:", error)
    return NextResponse.json({ error: "Failed to update date" }, { status: 500 })
  }
}
