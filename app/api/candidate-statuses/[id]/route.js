import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    const body = await request.json()
    const updateData = {}
    if (body.value !== undefined) {
      const valueSlug = String(body.value).trim().toLowerCase().replace(/\s+/g, "-")
      if (!valueSlug) return NextResponse.json({ error: "value cannot be empty" }, { status: 400 })
      updateData.value = valueSlug
    }
    if (body.label !== undefined) updateData.label = String(body.label).trim()
    if (body.color !== undefined) updateData.color = String(body.color).trim()
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder, 10) || 0

    const updated = await prisma.candidateStatus.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Candidate statuses PUT:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "Status not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    await prisma.candidateStatus.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Candidate statuses DELETE:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "Status not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to delete status" }, { status: 500 })
  }
}
