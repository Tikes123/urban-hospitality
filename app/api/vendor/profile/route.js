import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function getVendorFromToken(request) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!auth) return null
  return prisma.session.findFirst({
    where: { sessionToken: auth, expiresAt: { gt: new Date() } },
    include: { adminUser: true },
  })
}

export async function GET(request) {
  try {
    const session = await getVendorFromToken(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const u = session.adminUser
    return NextResponse.json({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
    })
  } catch (error) {
    console.error("Profile get:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await getVendorFromToken(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const contentType = request.headers.get("content-type") || ""
    let body = {}
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const name = formData.get("name")
      const file = formData.get("avatar")
      if (name != null) body.name = name
      if (file instanceof File && file.size > 0) {
        const { writeFile, mkdir } = await import("fs/promises")
        const path = await import("path")
        const dir = path.join(process.cwd(), "public", "uploads", "avatars")
        await mkdir(dir, { recursive: true })
        const filename = `vendor-${session.adminUserId}-${Date.now()}${path.extname(file.name) || ".jpg"}`
        const filepath = path.join(dir, filename)
        await writeFile(filepath, Buffer.from(await file.arrayBuffer()))
        body.avatar = `/uploads/avatars/${filename}`
      }
    } else {
      body = await request.json()
    }

    const updateData = {}
    if (body.name !== undefined) updateData.name = body.name ? String(body.name).trim() : null
    if (body.avatar !== undefined) updateData.avatar = body.avatar ? String(body.avatar) : null

    const updated = await prisma.adminUser.update({
      where: { id: session.adminUserId },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatar: updated.avatar,
    })
  } catch (error) {
    console.error("Profile update:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
