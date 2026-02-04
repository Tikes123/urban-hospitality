import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all clients
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const search = searchParams.get("search")

    const where: any = {}
    
    if (status && status !== "all") {
      where.status = status
    }
    
    if (type && type !== "all") {
      where.type = type
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        outletList: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Parse JSON strings back to arrays
    const clientsWithParsedData = clients.map((client) => ({
      ...client,
      services: client.services ? JSON.parse(client.services) : [],
      contractStart: client.contractStart.toISOString().split("T")[0],
      contractEnd: client.contractEnd.toISOString().split("T")[0],
      lastContact: client.lastContact?.toISOString().split("T")[0] || null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    }))

    return NextResponse.json(clientsWithParsedData)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      type,
      contactPerson,
      email,
      phone,
      address,
      outlets,
      employees,
      contractValue,
      contractStart,
      contractEnd,
      status,
      rating,
      services,
      notes,
      lastContact,
    } = body

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
      include: {
        outletList: true,
      },
    })

    return NextResponse.json({
      ...client,
      services: JSON.parse(client.services),
      contractStart: client.contractStart.toISOString().split("T")[0],
      contractEnd: client.contractEnd.toISOString().split("T")[0],
      lastContact: client.lastContact?.toISOString().split("T")[0] || null,
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating client:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
