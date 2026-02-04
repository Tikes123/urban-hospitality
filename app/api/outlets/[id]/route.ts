import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET single outlet by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const outlet = await prisma.outlet.findUnique({
      where: { id },
      include: {
        client: true,
      },
    })

    if (!outlet) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 })
    }

    return NextResponse.json(outlet)
  } catch (error) {
    console.error("Error fetching outlet:", error)
    return NextResponse.json({ error: "Failed to fetch outlet" }, { status: 500 })
  }
}

// PUT update outlet
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

    const outlet = await prisma.outlet.update({
      where: { id },
      data: {
        name,
        type,
        address,
        phone,
        email,
        manager,
        employees: employees !== undefined ? employees : undefined,
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        status,
        description,
        image,
        clientId: clientId !== undefined ? (clientId ? parseInt(clientId) : null) : undefined,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(outlet)
  } catch (error: any) {
    console.error("Error updating outlet:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update outlet" }, { status: 500 })
  }
}

// DELETE outlet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    await prisma.outlet.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Outlet deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting outlet:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete outlet" }, { status: 500 })
  }
}
