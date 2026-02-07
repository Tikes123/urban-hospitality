import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { VENDOR_MENU_ITEMS, VENDOR_DROPDOWN_ITEMS, getDefaultAllowedMap } from "@/lib/vendorMenuConfig"

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const permissions = await prisma.adminUserMenuPermission.findMany({
      where: { adminUserId: session.adminUserId },
    })
    const allowedMap = getDefaultAllowedMap()
    permissions.forEach((p) => { allowedMap[p.menuKey] = p.allowed })

    const navLinks = VENDOR_MENU_ITEMS.filter((m) => allowedMap[m.menuKey] !== false).map((m) => ({
      menuKey: m.menuKey,
      label: m.label,
      path: m.path,
      allowed: true,
    }))
    const dropdownLinks = VENDOR_DROPDOWN_ITEMS.filter((m) => allowedMap[m.menuKey] !== false).map((m) => ({
      menuKey: m.menuKey,
      label: m.label,
      path: m.path,
      allowed: true,
    }))

    return NextResponse.json({ navLinks, dropdownLinks })
  } catch (error) {
    console.error("Menu permissions get:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
