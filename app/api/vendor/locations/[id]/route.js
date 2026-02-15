import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

async function getVendorId(request) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!auth) return null
  const session = await prisma.session.findFirst({
    where: { sessionToken: auth, expiresAt: { gt: new Date() } },
    include: { adminUser: true },
  })
  if (!session || (session.adminUser.role !== "vendor" && session.adminUser.role !== "super_admin")) return null
  return session.adminUserId
}

export async function PUT(request, { params }) {
  try {
    const vendorId = await getVendorId(request)
    if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    const body = await request.json()
    const value = body.value != null ? String(body.value).trim() : ""
    if (!value) return NextResponse.json({ error: "value is required" }, { status: 400 })
    const updated = await prisma.customLocation.updateMany({
      where: { id, createdByAdminUserId: vendorId },
      data: { value },
    })
    if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const row = await prisma.customLocation.findFirst({ where: { id, createdByAdminUserId: vendorId } })
    return NextResponse.json(row)
  } catch (error) {
    console.error("Vendor location PUT:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const vendorId = await getVendorId(request)
    if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    const deleted = await prisma.customLocation.deleteMany({
      where: { id, createdByAdminUserId: vendorId },
    })
    if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Vendor location DELETE:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
