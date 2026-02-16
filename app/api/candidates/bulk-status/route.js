import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request) {
  try {
    const body = await request.json()
    const { candidateIds, status, outletId } = body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json({ error: "candidateIds array is required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 })
    }

    // Update candidate statuses
    const updateResult = await prisma.candidate.updateMany({
      where: {
        id: { in: candidateIds.map((id) => parseInt(id, 10)) },
      },
      data: {
        status,
      },
    })

    // If outletId is provided, also update interview schedules for that outlet
    if (outletId) {
      await prisma.interviewSchedule.updateMany({
        where: {
          candidateId: { in: candidateIds.map((id) => parseInt(id, 10)) },
          outletId: parseInt(outletId, 10),
        },
        data: {
          status,
        },
      })
    }

    return NextResponse.json({
      success: true,
      updated: updateResult.count,
      message: `Updated ${updateResult.count} candidate(s) status to ${status}`,
    })
  } catch (error) {
    console.error("Error updating bulk status:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
