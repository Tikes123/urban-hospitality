import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all outlets
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const search = searchParams.get("search")
    const clientId = searchParams.get("clientId")

    const where: any = {}
    
    if (type && type !== "all") {
      where.type = type
    }
    
    if (clientId) {
      where.clientId = parseInt(clientId)
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { manager: { contains: search, mode: "insensitive" } },
      ]
    }

    const outlets = await prisma.outlet.findMany({
      where,
      include: {
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(outlets.map((outlet) => ({
      ...outlet,
      createdAt: outlet.createdAt.toISOString(),
      updatedAt: outlet.updatedAt.toISOString(),
    })))
  } catch (error) {
    console.error("Error fetching outlets:", error)
    return NextResponse.json({ error: "Failed to fetch outlets" }, { status: 500 })
  }
}

// POST create new outlet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      type,
      address,
      phone,
      email,
      manager,
      employees,
      rating,
      status,
      description,
      image,
      clientId,
    } = body

    const outlet = await prisma.outlet.create({
      data: {
        name,
        type,
        address,
        phone,
        email,
        manager,
        employees: employees || 0,
        rating: rating ? parseFloat(rating) : null,
        status: status || "active",
        description: description || null,
        image: image || null,
        clientId: clientId ? parseInt(clientId) : null,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(outlet, { status: 201 })
  } catch (error) {
    console.error("Error creating outlet:", error)
    return NextResponse.json({ error: "Failed to create outlet" }, { status: 500 })
  }
}
