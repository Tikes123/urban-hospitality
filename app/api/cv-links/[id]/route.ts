import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET single CV link by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const cvLink = await prisma.cVLink.findUnique({
      where: { id },
      include: {
        candidate: true,
      },
    })

    if (!cvLink) {
      return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    }

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

// PUT update CV link
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const {
      status,
      views,
      downloads,
      lastViewed,
      sharedWith,
    } = body

    const updateData: any = {}
    
    if (status !== undefined) updateData.status = status
    if (views !== undefined) updateData.views = views
    if (downloads !== undefined) updateData.downloads = downloads
    if (lastViewed !== undefined) updateData.lastViewed = lastViewed ? new Date(lastViewed) : null
    if (sharedWith !== undefined) {
      updateData.sharedWith = Array.isArray(sharedWith) ? JSON.stringify(sharedWith) : JSON.stringify([])
    }

    const cvLink = await prisma.cVLink.update({
      where: { id },
      data: updateData,
      include: {
        candidate: true,
      },
    })

    return NextResponse.json({
      ...cvLink,
      createdDate: cvLink.createdDate.toISOString().split("T")[0],
      expiryDate: cvLink.expiryDate.toISOString().split("T")[0],
      lastViewed: cvLink.lastViewed?.toISOString().split("T")[0] || null,
      sharedWith: cvLink.sharedWith ? JSON.parse(cvLink.sharedWith) : [],
    })
  } catch (error: any) {
    console.error("Error updating CV link:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update CV link" }, { status: 500 })
  }
}

// DELETE CV link
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    await prisma.cVLink.delete({
      where: { id },
    })

    return NextResponse.json({ message: "CV link deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting CV link:", error)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete CV link" }, { status: 500 })
  }
}
