import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const clientId = searchParams.get("clientId")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(200, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)))

    const where = {}
    const area = searchParams.get("area")
    if (type && type !== "all") where.type = type
    if (clientId) where.clientId = parseInt(clientId)
    if (area) {
      where.OR = [
        { area: { equals: area } },
        { address: { contains: area } },
      ]
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { manager: { contains: search } },
        { area: { contains: search } },
      ]
    }

    const [total, outlets] = await Promise.all([
      prisma.outlet.count({ where }),
      prisma.outlet.findMany({
        where,
        include: { client: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)
    const data = outlets.map((outlet) => ({
      ...outlet,
      createdAt: outlet.createdAt.toISOString(),
      updatedAt: outlet.updatedAt.toISOString(),
    }))

    return NextResponse.json({ data, total, page, limit, totalPages })
  } catch (error) {
    console.error("Error fetching outlets:", error)
    return NextResponse.json({ error: "Failed to fetch outlets" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, type, area, address, phone, email, manager, employees, openPositions, rating, status, description, image, clientId } = body
    const outlet = await prisma.outlet.create({
      data: {
        name,
        type,
        area: area || null,
        address,
        phone,
        email,
        manager,
        employees: employees || 0,
        openPositions: openPositions != null ? parseInt(openPositions) : 0,
        rating: rating ? parseFloat(rating) : null,
        status: status || "active",
        description: description || null,
        image: image || null,
        clientId: clientId ? parseInt(clientId) : null,
      },
      include: { client: true },
    })
    return NextResponse.json(outlet, { status: 201 })
  } catch (error) {
    console.error("Error creating outlet:", error)
    return NextResponse.json({ error: "Failed to create outlet" }, { status: 500 })
  }
}
