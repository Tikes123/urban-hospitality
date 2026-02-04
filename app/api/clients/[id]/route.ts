import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET single client by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        outletList: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...client,
      services: client.services ? JSON.parse(client.services) : [],
      contractStart: client.contractStart.toISOString().split("T")[0],
      contractEnd: client.contractEnd.toISOString().split("T")[0],
      lastContact: client.lastContact?.toISOString().split("T")[0] || null,
    })
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

// PUT update client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
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

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        type,
        contactPerson,
        email,
        phone,
        address,
        outlets: outlets !== undefined ? outlets : undefined,
        employees: employees !== undefined ? employees : undefined,
        contractValue: contractValue !== undefined ? parseFloat(contractValue) : undefined,
        contractStart: contractStart ? new Date(contractStart) : undefined,
        contractEnd: contractEnd ? new Date(contractEnd) : undefined,
        status,
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        services: Array.isArray(services) ? JSON.stringify(services) : undefined,
        notes,
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
    })
  } catch (error: any) {
    console.error("Error updating client:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

// DELETE client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting client:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
