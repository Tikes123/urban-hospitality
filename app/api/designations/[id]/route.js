import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    const designation = await prisma.designation.findUnique({
      where: { id },
      include: { candidates: true },
    })
    if (!designation) return NextResponse.json({ error: "Designation not found" }, { status: 404 })
    return NextResponse.json({
      ...designation,
      requirements: designation.requirements ? JSON.parse(designation.requirements) : [],
      responsibilities: designation.responsibilities ? JSON.parse(designation.responsibilities) : [],
      skills: designation.skills ? JSON.parse(designation.skills) : [],
      createdDate: designation.createdDate.toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("Error fetching designation:", error)
    return NextResponse.json({ error: "Failed to fetch designation" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const updateData = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.category !== undefined) updateData.category = body.category
    if (body.department !== undefined) updateData.department = body.department
    if (body.level !== undefined) updateData.level = body.level
    if (body.minSalary !== undefined) updateData.minSalary = parseFloat(body.minSalary)
    if (body.maxSalary !== undefined) updateData.maxSalary = parseFloat(body.maxSalary)
    if (body.openPositions !== undefined) updateData.openPositions = body.openPositions
    if (body.totalEmployees !== undefined) updateData.totalEmployees = body.totalEmployees
    if (body.description !== undefined) updateData.description = body.description
    if (body.requirements !== undefined) updateData.requirements = Array.isArray(body.requirements) ? JSON.stringify(body.requirements) : JSON.stringify([])
    if (body.responsibilities !== undefined) updateData.responsibilities = Array.isArray(body.responsibilities) ? JSON.stringify(body.responsibilities) : JSON.stringify([])
    if (body.skills !== undefined) updateData.skills = Array.isArray(body.skills) ? JSON.stringify(body.skills) : JSON.stringify([])
    if (body.status !== undefined) updateData.status = body.status

    const designation = await prisma.designation.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      ...designation,
      requirements: JSON.parse(designation.requirements),
      responsibilities: JSON.parse(designation.responsibilities),
      skills: JSON.parse(designation.skills),
      createdDate: designation.createdDate.toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("Error updating designation:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "Designation not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to update designation" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)
    await prisma.designation.delete({ where: { id } })
    return NextResponse.json({ message: "Designation deleted successfully" })
  } catch (error) {
    console.error("Error deleting designation:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "Designation not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to delete designation" }, { status: 500 })
  }
}
