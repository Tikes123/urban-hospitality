import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { VENDOR_MENU_ITEMS, VENDOR_DROPDOWN_ITEMS } from "@/lib/vendorMenuConfig"

const ALL_MENU_ITEMS = [...VENDOR_MENU_ITEMS, ...VENDOR_DROPDOWN_ITEMS]

function requireSuperAdmin(request) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!auth) return null
  return prisma.session.findFirst({
    where: { sessionToken: auth, expiresAt: { gt: new Date() } },
    include: { adminUser: true },
  })
}

export async function GET(request) {
  try {
    const session = await requireSuperAdmin(request)
    if (!session || session.adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const adminUserId = request.nextUrl.searchParams.get("adminUserId")
    const id = adminUserId ? parseInt(adminUserId, 10) : null
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "adminUserId required" }, { status: 400 })
    }

    const permissions = await prisma.adminUserMenuPermission.findMany({
      where: { adminUserId: id },
    })
    const allowedMap = {}
    ALL_MENU_ITEMS.forEach((m) => { allowedMap[m.menuKey] = true })
    permissions.forEach((p) => { allowedMap[p.menuKey] = p.allowed })

    const items = ALL_MENU_ITEMS.map((m) => ({
      menuKey: m.menuKey,
      label: m.label,
      path: m.path,
      allowed: allowedMap[m.menuKey] !== false,
    }))

    return NextResponse.json({ adminUserId: id, items })
  } catch (error) {
    console.error("Menu permissions get:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await requireSuperAdmin(request)
    if (!session || session.adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { adminUserId, permissions } = body
    const id = adminUserId ? parseInt(adminUserId, 10) : null
    if (!id || isNaN(id) || !permissions || typeof permissions !== "object") {
      return NextResponse.json({ error: "adminUserId and permissions (object) required" }, { status: 400 })
    }

    for (const menuKey of Object.keys(permissions)) {
      const allowed = !!permissions[menuKey]
      await prisma.adminUserMenuPermission.upsert({
        where: {
          adminUserId_menuKey: { adminUserId: id, menuKey },
        },
        create: { adminUserId: id, menuKey, allowed },
        update: { allowed },
      })
    }

    const list = await prisma.adminUserMenuPermission.findMany({
      where: { adminUserId: id },
    })
    return NextResponse.json({ adminUserId: id, permissions: list.map((p) => ({ menuKey: p.menuKey, allowed: p.allowed })) })
  } catch (error) {
    console.error("Menu permissions put:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
