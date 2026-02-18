import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid requirement ID" }, { status: 400 })
    }

    const requirement = await prisma.clientRequirement.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        outlet: { select: { id: true, name: true } },
      },
    })

    if (!requirement) {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...requirement,
      perks: requirement.perks ? (typeof requirement.perks === "string" ? JSON.parse(requirement.perks) : requirement.perks) : [],
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching requirement:", error)
    return NextResponse.json({ error: "Failed to fetch requirement" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid requirement ID" }, { status: 400 })
    }

    const body = await request.json()
    const {
      outletId,
      designation,
      numberOfOpenings,
      gender,
      minSalary,
      maxSalary,
      perks,
      bothAvailable,
      jdFile,
      status,
      remark,
    } = body

    const updateData = {}
    if (outletId !== undefined) updateData.outletId = outletId ? parseInt(outletId, 10) : null
    if (designation !== undefined) updateData.designation = designation
    if (numberOfOpenings !== undefined) updateData.numberOfOpenings = parseInt(numberOfOpenings, 10)
    if (gender !== undefined) updateData.gender = gender || null
    if (minSalary !== undefined) updateData.minSalary = minSalary ? parseFloat(minSalary) : null
    if (maxSalary !== undefined) updateData.maxSalary = maxSalary ? parseFloat(maxSalary) : null
    if (perks !== undefined) updateData.perks = Array.isArray(perks) ? JSON.stringify(perks) : JSON.stringify([])
    if (bothAvailable !== undefined) updateData.bothAvailable = bothAvailable || null
    if (jdFile !== undefined) updateData.jdFile = jdFile || null
    if (status !== undefined) updateData.status = status
    if (remark !== undefined) updateData.remark = remark || null

    const requirement = await prisma.clientRequirement.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        outlet: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      ...requirement,
      perks: requirement.perks ? JSON.parse(requirement.perks) : [],
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error updating requirement:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update requirement" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid requirement ID" }, { status: 400 })
    }

    await prisma.clientRequirement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting requirement:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Requirement not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete requirement" }, { status: 500 })
  }
}
