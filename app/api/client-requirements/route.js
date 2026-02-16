import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")
    const outletId = searchParams.get("outletId")
    const status = searchParams.get("status")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)))

    const where = {}
    if (clientId) where.clientId = parseInt(clientId, 10)
    if (outletId) where.outletId = parseInt(outletId, 10)
    if (status && status !== "all") where.status = status

    const [total, requirements] = await Promise.all([
      prisma.clientRequirement.count({ where }),
      prisma.clientRequirement.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          outlet: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)
    const data = requirements.map((req) => ({
      ...req,
      perks: req.perks ? (typeof req.perks === "string" ? JSON.parse(req.perks) : req.perks) : [],
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
    }))

    return NextResponse.json({ data, total, page, limit, totalPages })
  } catch (error) {
    console.error("Error fetching client requirements:", error)
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      clientId,
      outletId,
      designationId,
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

    if (!clientId || !designation || !numberOfOpenings || !status) {
      return NextResponse.json({ error: "clientId, designation, numberOfOpenings, and status are required" }, { status: 400 })
    }

    const requirement = await prisma.clientRequirement.create({
      data: {
        clientId: parseInt(clientId, 10),
        outletId: outletId ? parseInt(outletId, 10) : null,
        designationId: designationId ? parseInt(designationId, 10) : null,
        designation,
        numberOfOpenings: parseInt(numberOfOpenings, 10),
        gender: gender || null,
        minSalary: minSalary ? parseFloat(minSalary) : null,
        maxSalary: maxSalary ? parseFloat(maxSalary) : null,
        perks: Array.isArray(perks) ? JSON.stringify(perks) : JSON.stringify([]),
        bothAvailable: bothAvailable || null,
        jdFile: jdFile || null,
        status,
        remark: remark || null,
      },
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
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating client requirement:", error)
    return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 })
  }
}
