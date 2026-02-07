import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(200, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)))

    const where = {}
    if (status && status !== "all") where.status = status
    if (type && type !== "all") where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactPerson: { contains: search } },
      ]
    }

    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        include: { outletList: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)
    const data = clients.map((client) => ({
      ...client,
      services: client.services ? JSON.parse(client.services) : [],
      contractStart: client.contractStart.toISOString().split("T")[0],
      contractEnd: client.contractEnd.toISOString().split("T")[0],
      lastContact: client.lastContact?.toISOString().split("T")[0] || null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    }))

    return NextResponse.json({ data, total, page, limit, totalPages })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, type, contactPerson, email, phone, address, outlets, employees, contractValue, contractStart, contractEnd, status, rating, services, notes, lastContact } = body

    const client = await prisma.client.create({
      data: {
        name,
        type,
        contactPerson,
        email,
        phone,
        address,
        outlets: outlets || 0,
        employees: employees || 0,
        contractValue: parseFloat(contractValue),
        contractStart: new Date(contractStart),
        contractEnd: new Date(contractEnd),
        status: status || "active",
        rating: rating ? parseFloat(rating) : null,
        services: Array.isArray(services) ? JSON.stringify(services) : JSON.stringify([]),
        notes: notes || null,
        lastContact: lastContact ? new Date(lastContact) : null,
      },
      include: { outletList: true },
    })

    return NextResponse.json({
      ...client,
      services: JSON.parse(client.services),
      contractStart: client.contractStart.toISOString().split("T")[0],
      contractEnd: client.contractEnd.toISOString().split("T")[0],
      lastContact: client.lastContact?.toISOString().split("T")[0] || null,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    if (error.code === "P2002") return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
