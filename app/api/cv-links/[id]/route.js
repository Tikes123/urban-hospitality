import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const cvLink = await prisma.cVLink.findUnique({
      where: { id },
      include: { candidate: true },
    })
    if (!cvLink) return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    const ids = cvLink.outletIds ? JSON.parse(cvLink.outletIds) : []
    const outlets = ids.length ? await prisma.outlet.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } }) : []
    const outletMap = Object.fromEntries(outlets.map((o) => [o.id, o.name]))
    return NextResponse.json({
      ...cvLink,
      createdDate: cvLink.createdDate.toISOString().split("T")[0],
      expiryDate: cvLink.expiryDate.toISOString().split("T")[0],
      lastViewed: cvLink.lastViewed?.toISOString().split("T")[0] || null,
      sharedWith: cvLink.sharedWith ? JSON.parse(cvLink.sharedWith) : [],
      outletIds: ids,
      outletNames: ids.map((id) => outletMap[id] || `#${id}`),
    })
  } catch (error) {
    console.error("Error fetching CV link:", error)
    return NextResponse.json({ error: "Failed to fetch CV link" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await request.json()
    const updateData = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.views !== undefined) updateData.views = body.views
    if (body.downloads !== undefined) updateData.downloads = body.downloads
    if (body.lastViewed !== undefined) updateData.lastViewed = body.lastViewed ? new Date(body.lastViewed) : null
    if (body.sharedWith !== undefined) updateData.sharedWith = Array.isArray(body.sharedWith) ? JSON.stringify(body.sharedWith) : JSON.stringify([])
    if (body.outletIds !== undefined) {
      const arr = Array.isArray(body.outletIds) ? body.outletIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)) : []
      updateData.outletIds = arr.length ? JSON.stringify(arr) : null
    }

    const cvLink = await prisma.cVLink.update({
      where: { id },
      data: updateData,
      include: { candidate: true },
    })

    const ids = cvLink.outletIds ? JSON.parse(cvLink.outletIds) : []
    const outlets = ids.length ? await prisma.outlet.findMany({ where: { id: { in: ids } }, select: { name: true } }) : []
    return NextResponse.json({
      ...cvLink,
      createdDate: cvLink.createdDate.toISOString().split("T")[0],
      expiryDate: cvLink.expiryDate.toISOString().split("T")[0],
      lastViewed: cvLink.lastViewed?.toISOString().split("T")[0] || null,
      sharedWith: cvLink.sharedWith ? JSON.parse(cvLink.sharedWith) : [],
      outletIds: ids,
      outletNames: outlets.map((o) => o.name),
    })
  } catch (error) {
    console.error("Error updating CV link:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to update CV link" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    await prisma.cVLink.delete({ where: { id } })
    return NextResponse.json({ message: "CV link deleted successfully" })
  } catch (error) {
    console.error("Error deleting CV link:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to delete CV link" }, { status: 500 })
  }
}
