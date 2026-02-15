import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getDefaultAllowedMap } from "@/lib/vendorMenuConfig"

async function getVendorSession(request) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!auth) return null
  const session = await prisma.session.findFirst({
    where: { sessionToken: auth, expiresAt: { gt: new Date() } },
    include: { adminUser: true },
  })
  if (!session || (session.adminUser.role !== "vendor" && session.adminUser.role !== "super_admin")) return null
  return session
}

/** GET /api/vendor/hr-permissions?hrId= — get permissions for an HR (vendor can only access their own HR) */
export async function GET(request) {
  try {
    const session = await getVendorSession(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const hrId = request.nextUrl.searchParams.get("hrId")
    const id = hrId ? parseInt(hrId, 10) : null
    if (!id || isNaN(id)) return NextResponse.json({ error: "hrId required" }, { status: 400 })

    const hr = await prisma.hr.findFirst({
      where: { id, vendorId: session.adminUserId },
    })
    if (!hr) return NextResponse.json({ error: "HR not found" }, { status: 404 })

    const permissions = await prisma.hrMenuPermission.findMany({
      where: { hrId: id },
    })
    const allowedMap = getDefaultAllowedMap()
    permissions.forEach((p) => { allowedMap[p.menuKey] = p.allowed })

    return NextResponse.json({ hrId: id, hr: { id: hr.id, name: hr.name, email: hr.email }, allowedMap })
  } catch (error) {
    console.error("HR permissions GET:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

/** PUT /api/vendor/hr-permissions — update permissions for an HR (body: { hrId, permissions }) */
export async function PUT(request) {
  try {
    const session = await getVendorSession(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { hrId, permissions } = body
    const id = hrId != null ? parseInt(hrId, 10) : null
    if (!id || isNaN(id) || !permissions || typeof permissions !== "object") {
      return NextResponse.json({ error: "hrId and permissions (object) required" }, { status: 400 })
    }

    const hr = await prisma.hr.findFirst({
      where: { id, vendorId: session.adminUserId },
    })
    if (!hr) return NextResponse.json({ error: "HR not found" }, { status: 404 })

    for (const menuKey of Object.keys(permissions)) {
      const allowed = !!permissions[menuKey]
      await prisma.hrMenuPermission.upsert({
        where: {
          hrId_menuKey: { hrId: id, menuKey },
        },
        create: { hrId: id, menuKey, allowed },
        update: { allowed },
      })
    }

    const updated = await prisma.hrMenuPermission.findMany({
      where: { hrId: id },
    })
    const allowedMap = getDefaultAllowedMap()
    updated.forEach((p) => { allowedMap[p.menuKey] = p.allowed })

    return NextResponse.json({ success: true, hrId: id, allowedMap })
  } catch (error) {
    console.error("HR permissions PUT:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
