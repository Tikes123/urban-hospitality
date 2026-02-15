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

export async function GET(request) {
  try {
    const vendorId = await getVendorId(request)
    if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const list = await prisma.customLocation.findMany({
      where: { createdByAdminUserId: vendorId },
      orderBy: { value: "asc" },
    })
    return NextResponse.json(list)
  } catch (error) {
    console.error("Vendor locations GET:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const vendorId = await getVendorId(request)
    if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    const value = body.value != null ? String(body.value).trim() : ""
    if (!value) return NextResponse.json({ error: "value is required" }, { status: 400 })
    const existing = await prisma.customLocation.findFirst({
      where: { value, createdByAdminUserId: vendorId },
    })
    if (existing) return NextResponse.json({ error: "Location already exists" }, { status: 409 })
    const created = await prisma.customLocation.create({
      data: { value, createdByAdminUserId: vendorId },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Vendor locations POST:", error)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
