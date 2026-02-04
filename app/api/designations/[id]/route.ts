import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET single designation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const designation = await prisma.designation.findUnique({
      where: { id },
      include: {
        candidates: true,
      },
    })

    if (!designation) {
      return NextResponse.json({ error: "Designation not found" }, { status: 404 })
    }

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

// PUT update designation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const {
      title,
      category,
      department,
      level,
      minSalary,
      maxSalary,
      openPositions,
      totalEmployees,
      description,
      requirements,
      responsibilities,
      skills,
      status,
    } = body

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category
    if (department !== undefined) updateData.department = department
    if (level !== undefined) updateData.level = level
    if (minSalary !== undefined) updateData.minSalary = parseFloat(minSalary)
    if (maxSalary !== undefined) updateData.maxSalary = parseFloat(maxSalary)
    if (openPositions !== undefined) updateData.openPositions = openPositions
    if (totalEmployees !== undefined) updateData.totalEmployees = totalEmployees
    if (description !== undefined) updateData.description = description
    if (requirements !== undefined) {
      updateData.requirements = Array.isArray(requirements) ? JSON.stringify(requirements) : JSON.stringify([])
    }
    if (responsibilities !== undefined) {
      updateData.responsibilities = Array.isArray(responsibilities) ? JSON.stringify(responsibilities) : JSON.stringify([])
    }
    if (skills !== undefined) {
      updateData.skills = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([])
    }
    if (status !== undefined) updateData.status = status

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
  } catch (error: any) {
    console.error("Error updating designation:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Designation not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update designation" }, { status: 500 })
  }
}

// DELETE designation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    await prisma.designation.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Designation deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting designation:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Designation not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete designation" }, { status: 500 })
  }
}
