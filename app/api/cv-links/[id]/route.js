import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    const cvLink = await prisma.cVLink.findUnique({
      where: { id },
      include: { candidate: true },
    })
    if (!cvLink) return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    return NextResponse.json({
      ...cvLink,
      createdDate: cvLink.createdDate.toISOString().split("T")[0],
      expiryDate: cvLink.expiryDate.toISOString().split("T")[0],
      lastViewed: cvLink.lastViewed?.toISOString().split("T")[0] || null,
      sharedWith: cvLink.sharedWith ? JSON.parse(cvLink.sharedWith) : [],
    })
  } catch (error) {
    console.error("Error fetching CV link:", error)
    return NextResponse.json({ error: "Failed to fetch CV link" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const updateData = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.views !== undefined) updateData.views = body.views
    if (body.downloads !== undefined) updateData.downloads = body.downloads
    if (body.lastViewed !== undefined) updateData.lastViewed = body.lastViewed ? new Date(body.lastViewed) : null
    if (body.sharedWith !== undefined) updateData.sharedWith = Array.isArray(body.sharedWith) ? JSON.stringify(body.sharedWith) : JSON.stringify([])

    const cvLink = await prisma.cVLink.update({
      where: { id },
      data: updateData,
      include: { candidate: true },
    })

    return NextResponse.json({
      ...cvLink,
      createdDate: cvLink.createdDate.toISOString().split("T")[0],
      expiryDate: cvLink.expiryDate.toISOString().split("T")[0],
      lastViewed: cvLink.lastViewed?.toISOString().split("T")[0] || null,
      sharedWith: cvLink.sharedWith ? JSON.parse(cvLink.sharedWith) : [],
    })
  } catch (error) {
    console.error("Error updating CV link:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to update CV link" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)
    await prisma.cVLink.delete({ where: { id } })
    return NextResponse.json({ message: "CV link deleted successfully" })
  } catch (error) {
    console.error("Error deleting CV link:", error)
    if (error.code === "P2025") return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to delete CV link" }, { status: 500 })
  }
}
