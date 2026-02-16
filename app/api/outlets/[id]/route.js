import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const outlet = await prisma.outlet.findUnique({
      where: { id },
      include: { client: true },
    })
    if (!outlet) return NextResponse.json({ error: "Outlet not found" }, { status: 404 })
    return NextResponse.json(outlet)
  } catch (error) {
    console.error("Error fetching outlet:", error)
    return NextResponse.json({ error: "Failed to fetch outlet" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    const body = await request.json()
    const { name, type, area, address, phone, email, manager, employees, openPositions, rating, status, description, image, googleMapLocation, clientId } = body
    const outlet = await prisma.outlet.update({
      where: { id },
      data: {
        name,
        type,
        area: area !== undefined ? (area || null) : undefined,
        address,
        phone,
        email,
        manager,
        employees: employees !== undefined ? employees : undefined,
        openPositions: openPositions !== undefined ? parseInt(openPositions) : undefined,
        rating: rating !== undefined ? parseFloat(rating) : undefined,
        status,
        description,
        image,
        googleMapLocation: googleMapLocation !== undefined ? (googleMapLocation || null) : undefined,
        clientId: clientId !== undefined ? (clientId ? parseInt(clientId) : null) : undefined,
      },
      include: { client: true },
    })
    return NextResponse.json(outlet)
  } catch (error) {
    console.error("Error updating outlet:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "Outlet not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to update outlet" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    await prisma.outlet.delete({ where: { id } })
    return NextResponse.json({ message: "Outlet deleted successfully" })
  } catch (error) {
    console.error("Error deleting outlet:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "Outlet not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to delete outlet" }, { status: 500 })
  }
}
