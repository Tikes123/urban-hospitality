import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** GET /api/outlets/locations - returns distinct location values from outlets + custom locations (for dropdowns) */
export async function GET() {
  try {
    const outlets = await prisma.outlet.findMany({ select: { area: true, address: true } })
    const set = new Set()
    for (const o of outlets) {
      if (o.area && String(o.area).trim()) set.add(String(o.area).trim())
      if (o.address && String(o.address).trim()) set.add(String(o.address).trim())
    }
    try {
      if (prisma.customLocation) {
        const custom = await prisma.customLocation.findMany({ select: { value: true } })
        for (const c of custom) if (c.value && String(c.value).trim()) set.add(String(c.value).trim())
      }
    } catch (_) { /* customLocation table or model may not exist yet */ }
    const locations = [...set].sort((a, b) => a.localeCompare(b))
    return NextResponse.json(locations)
  } catch (error) {
    console.error("Error fetching outlet locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}

/** POST /api/outlets/locations - add a custom location (vendor only, requires auth) */
export async function POST(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session || (session.adminUser.role !== "vendor" && session.adminUser.role !== "super_admin")) {
      return NextResponse.json({ error: "Vendor or super_admin only" }, { status: 403 })
    }
    const body = await request.json()
    const value = body.value != null ? String(body.value).trim() : ""
    if (!value) return NextResponse.json({ error: "value is required" }, { status: 400 })
    let existing = null
    try {
      if (prisma.customLocation) {
        existing = await prisma.customLocation.findFirst({ where: { value, createdByAdminUserId: session.adminUserId } })
        if (existing) return NextResponse.json({ value: existing.value })
        const created = await prisma.customLocation.create({
          data: { value, createdByAdminUserId: session.adminUserId },
        })
        return NextResponse.json({ value: created.value }, { status: 201 })
      }
    } catch (e) {
      if (e.code === "P2021" || String(e.message || "").includes("customLocation")) {
        return NextResponse.json({ value }, { status: 201 })
      }
      throw e
    }
    return NextResponse.json({ value }, { status: 201 })
  } catch (error) {
    console.error("Error adding custom location:", error)
    return NextResponse.json({ error: "Failed to add location" }, { status: 500 })
  }
}
