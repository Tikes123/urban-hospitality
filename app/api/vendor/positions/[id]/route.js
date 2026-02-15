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

export async function GET(request, { params }) {
  try {
    const vendorId = await getVendorId(request)
    if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    const row = await prisma.vendorPosition.findFirst({
      where: { id, adminUserId: vendorId },
    })
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(row)
  } catch (error) {
    console.error("Vendor position GET:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const vendorId = await getVendorId(request)
    if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    const body = await request.json()
    const name = body.name != null ? String(body.name).trim() : ""
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 })
    const updated = await prisma.vendorPosition.updateMany({
      where: { id, adminUserId: vendorId },
      data: { name },
    })
    if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const row = await prisma.vendorPosition.findFirst({ where: { id, adminUserId: vendorId } })
    return NextResponse.json(row)
  } catch (error) {
    console.error("Vendor position PUT:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const vendorId = await getVendorId(request)
    if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const id = parseInt(params.id, 10)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    const deleted = await prisma.vendorPosition.deleteMany({
      where: { id, adminUserId: vendorId },
    })
    if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Vendor position DELETE:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
