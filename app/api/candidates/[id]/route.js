import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { designation: true, cvLinks: true },
    })
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }
    return NextResponse.json({
      ...candidate,
      appliedDate: candidate.appliedDate.toISOString().split("T")[0],
      resumeUpdatedAt: candidate.resumeUpdatedAt?.toISOString() ?? null,
      updatedAt: candidate.updatedAt?.toISOString() ?? null,
      attachments: candidate.attachments ? (typeof candidate.attachments === "string" ? JSON.parse(candidate.attachments) : candidate.attachments) : [],
    })
  } catch (error) {
    console.error("Error fetching candidate:", error)
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const body = await request.json()
    const updateData = {}
    const fields = ["name", "email", "phone", "position", "designationId", "experience", "location", "availability", "salary", "skills", "education", "previousEmployer", "references", "notes", "status", "source", "rating", "resume", "attachments"]
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email || null
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.position !== undefined) updateData.position = body.position
    if (body.designationId !== undefined) updateData.designationId = body.designationId ? parseInt(body.designationId) : null
    if (body.experience !== undefined) updateData.experience = body.experience
    if (body.location !== undefined) updateData.location = body.location
    if (body.availability !== undefined) updateData.availability = body.availability
    if (body.salary !== undefined) updateData.salary = body.salary
    if (body.skills !== undefined) updateData.skills = body.skills
    if (body.education !== undefined) updateData.education = body.education
    if (body.previousEmployer !== undefined) updateData.previousEmployer = body.previousEmployer
    if (body.references !== undefined) updateData.references = body.references
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.status !== undefined) updateData.status = body.status
    if (body.source !== undefined) updateData.source = body.source
    if (body.rating !== undefined) updateData.rating = body.rating ? parseFloat(body.rating) : null
    if (body.resume !== undefined) {
      updateData.resume = body.resume
      updateData.resumeUpdatedAt = new Date()
    }
    if (body.attachments !== undefined) {
      const arr = Array.isArray(body.attachments) ? body.attachments : (typeof body.attachments === "string" ? JSON.parse(body.attachments || "[]") : [])
      updateData.attachments = typeof body.attachments === "string" ? body.attachments : JSON.stringify(arr)
      updateData.resumeUpdatedAt = new Date()
      if (arr.length > 0 && arr[0].path) updateData.resume = arr[0].path
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: { designation: true },
    })
    return NextResponse.json({
      ...candidate,
      appliedDate: candidate.appliedDate.toISOString().split("T")[0],
      resumeUpdatedAt: candidate.resumeUpdatedAt?.toISOString() ?? null,
      updatedAt: candidate.updatedAt?.toISOString() ?? null,
      attachments: candidate.attachments ? (typeof candidate.attachments === "string" ? JSON.parse(candidate.attachments) : candidate.attachments) : [],
    })
  } catch (error) {
    console.error("Error updating candidate:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    if (error.code === "P2002") return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    await prisma.candidate.delete({ where: { id } })
    return NextResponse.json({ message: "Candidate deleted successfully" })
  } catch (error) {
    console.error("Error deleting candidate:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 })
  }
}
