import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const hr = await prisma.hr.findUnique({ where: { id } })
    if (!hr) return NextResponse.json({ error: "HR not found" }, { status: 404 })

    return NextResponse.json({
      ...hr,
      createdAt: hr.createdAt.toISOString(),
      updatedAt: hr.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("HR get error:", error)
    return NextResponse.json({ error: "Failed to fetch HR" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const body = await request.json()
    const updateData = {}
    if (body.name !== undefined) updateData.name = String(body.name).trim()
    if (body.email !== undefined) updateData.email = String(body.email).trim()
    if (body.phone !== undefined) updateData.phone = body.phone ? String(body.phone).trim() : null

    const hr = await prisma.hr.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      ...hr,
      createdAt: hr.createdAt.toISOString(),
      updatedAt: hr.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("HR update error:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "HR not found" }, { status: 404 })
    if (error.code === "P2002") return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    return NextResponse.json({ error: "Failed to update HR" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    await prisma.hr.delete({ where: { id } })
    return NextResponse.json({ message: "HR deleted" })
  } catch (error) {
    console.error("HR delete error:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "HR not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to delete HR" }, { status: 500 })
  }
}
