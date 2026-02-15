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
    const list = await prisma.outletType.findMany({
      where: { adminUserId: vendorId },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(list)
  } catch (error) {
    console.error("Outlet types GET:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const vendorId = await getVendorId(request)
    if (!vendorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    const name = body.name != null ? String(body.name).trim() : ""
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 })
    const created = await prisma.outletType.create({
      data: { name, adminUserId: vendorId },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Outlet types POST:", error)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
