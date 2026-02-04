import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all designations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: any = {}
    
    if (category && category !== "all") {
      where.category = category
    }
    
    if (status && status !== "all") {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ]
    }

    const designations = await prisma.designation.findMany({
      where,
      include: {
        candidates: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Parse JSON strings back to arrays
    const designationsWithParsedData = designations.map((designation) => ({
      ...designation,
      requirements: designation.requirements ? JSON.parse(designation.requirements) : [],
      responsibilities: designation.responsibilities ? JSON.parse(designation.responsibilities) : [],
      skills: designation.skills ? JSON.parse(designation.skills) : [],
      createdDate: designation.createdDate.toISOString().split("T")[0],
      createdAt: designation.createdAt.toISOString(),
      updatedAt: designation.updatedAt.toISOString(),
    }))

    return NextResponse.json(designationsWithParsedData)
  } catch (error) {
    console.error("Error fetching designations:", error)
    return NextResponse.json({ error: "Failed to fetch designations" }, { status: 500 })
  }
}

// POST create new designation
export async function POST(request: NextRequest) {
  try {
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

    const designation = await prisma.designation.create({
      data: {
        title,
        category,
        department,
        level,
        minSalary: parseFloat(minSalary),
        maxSalary: parseFloat(maxSalary),
        openPositions: openPositions || 0,
        totalEmployees: totalEmployees || 0,
        description,
        requirements: Array.isArray(requirements) ? JSON.stringify(requirements) : JSON.stringify([]),
        responsibilities: Array.isArray(responsibilities) ? JSON.stringify(responsibilities) : JSON.stringify([]),
        skills: Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([]),
        status: status || "active",
      },
    })

    return NextResponse.json({
      ...designation,
      requirements: JSON.parse(designation.requirements),
      responsibilities: JSON.parse(designation.responsibilities),
      skills: JSON.parse(designation.skills),
      createdDate: designation.createdDate.toISOString().split("T")[0],
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating designation:", error)
    return NextResponse.json({ error: "Failed to create designation" }, { status: 500 })
  }
}
