import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET single candidate by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        designation: true,
        cvLinks: true,
      },
    })

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...candidate,
      appliedDate: candidate.appliedDate.toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 })
  }
}

// PUT update candidate
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const {
      firstName,
      lastName,
      email,
      phone,
      position,
      designationId,
      experience,
      location,
      availability,
      salary,
      skills,
      education,
      previousEmployer,
      references,
      notes,
      status,
      source,
      rating,
      resume,
    } = body

    const updateData: any = {}
    
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (firstName !== undefined || lastName !== undefined) {
      updateData.name = `${firstName || ""} ${lastName || ""}`.trim()
    }
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (position !== undefined) updateData.position = position
    if (designationId !== undefined) updateData.designationId = designationId ? parseInt(designationId) : null
    if (experience !== undefined) updateData.experience = experience
    if (location !== undefined) updateData.location = location
    if (availability !== undefined) updateData.availability = availability
    if (salary !== undefined) updateData.salary = salary
    if (skills !== undefined) updateData.skills = skills
    if (education !== undefined) updateData.education = education
    if (previousEmployer !== undefined) updateData.previousEmployer = previousEmployer
    if (references !== undefined) updateData.references = references
    if (notes !== undefined) updateData.notes = notes
    if (status !== undefined) updateData.status = status
    if (source !== undefined) updateData.source = source
    if (rating !== undefined) updateData.rating = rating ? parseFloat(rating) : null
    if (resume !== undefined) updateData.resume = resume

    const candidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: {
        designation: true,
      },
    })

    return NextResponse.json({
      ...candidate,
      appliedDate: candidate.appliedDate.toISOString().split("T")[0],
    })
  } catch (error: any) {
    console.error("Error updating candidate:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 })
  }
}

// DELETE candidate
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    await prisma.candidate.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Candidate deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting candidate:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 })
  }
}
