import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all candidates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const position = searchParams.get("position")
    const search = searchParams.get("search")

    const where: any = {}
    
    if (status && status !== "all") {
      where.status = status
    }
    
    if (position && position !== "all") {
      where.position = { contains: position, mode: "insensitive" }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ]
    }

    const candidates = await prisma.candidate.findMany({
      where,
      include: {
        designation: true,
      },
      orderBy: {
        appliedDate: "desc",
      },
    })

    return NextResponse.json(candidates.map((candidate) => ({
      ...candidate,
      appliedDate: candidate.appliedDate.toISOString().split("T")[0],
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
    })))
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 })
  }
}

// POST create new candidate
export async function POST(request: NextRequest) {
  try {
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

    const name = `${firstName} ${lastName}`.trim()

    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        name,
        email,
        phone,
        position,
        designationId: designationId ? parseInt(designationId) : null,
        experience,
        location,
        availability: availability || null,
        salary: salary || null,
        skills: skills || null,
        education: education || null,
        previousEmployer: previousEmployer || null,
        references: references || null,
        notes: notes || null,
        status: status || "recently-applied",
        source: source || null,
        rating: rating ? parseFloat(rating) : null,
        resume: resume || null,
      },
      include: {
        designation: true,
      },
    })

    return NextResponse.json({
      ...candidate,
      appliedDate: candidate.appliedDate.toISOString().split("T")[0],
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating candidate:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 })
  }
}
