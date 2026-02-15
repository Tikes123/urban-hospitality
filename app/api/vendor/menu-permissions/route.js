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

    const hrIdParam = request.nextUrl.searchParams.get("hrId")
    const hrId = hrIdParam ? parseInt(hrIdParam, 10) : null
    let allowedMap = getDefaultAllowedMap()

    if (hrId != null && !isNaN(hrId)) {
      const hr = await prisma.hr.findFirst({
        where: { id: hrId, vendorId: session.adminUserId },
      })
      if (hr) {
        const hrPerms = await prisma.hrMenuPermission.findMany({
          where: { hrId },
        })
        hrPerms.forEach((p) => { allowedMap[p.menuKey] = p.allowed })
      }
    } else {
      const permissions = await prisma.adminUserMenuPermission.findMany({
        where: { adminUserId: session.adminUserId },
      })
      permissions.forEach((p) => { allowedMap[p.menuKey] = p.allowed })
    }

    let menuItems = VENDOR_MENU_ITEMS.filter((m) => allowedMap[m.menuKey] !== false)
    if (hrId == null) {
      const hrCount = await prisma.hr.count({ where: { vendorId: session.adminUserId } })
      if (hrCount === 0) {
        menuItems = menuItems.filter((m) => m.menuKey !== "menu-permissions")
      }
    }
    const navLinks = menuItems.map((m) => ({
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

    return NextResponse.json({ navLinks, dropdownLinks, allowedMap })
  } catch (error) {
    console.error("Menu permissions get:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { permissions } = body
    if (!permissions || typeof permissions !== "object") {
      return NextResponse.json({ error: "permissions (object) required" }, { status: 400 })
    }

    const adminUserId = session.adminUserId

    for (const menuKey of Object.keys(permissions)) {
      const allowed = !!permissions[menuKey]
      await prisma.adminUserMenuPermission.upsert({
        where: {
          adminUserId_menuKey: { adminUserId, menuKey },
        },
        create: { adminUserId, menuKey, allowed },
        update: { allowed },
      })
    }

    const updatedPermissions = await prisma.adminUserMenuPermission.findMany({
      where: { adminUserId },
    })
    const allowedMap = getDefaultAllowedMap()
    updatedPermissions.forEach((p) => { allowedMap[p.menuKey] = p.allowed })

    return NextResponse.json({ success: true, allowedMap })
  } catch (error) {
    console.error("Menu permissions put:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
