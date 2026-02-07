import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function GET(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session || session.adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const list = await prisma.adminUser.findMany({
      where: { role: "vendor" },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    return NextResponse.json(list.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })))
  } catch (error) {
    console.error("Super-admin vendors list:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session || session.adminUser.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name } = body
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const emailTrim = String(email).trim().toLowerCase()
    const existing = await prisma.adminUser.findUnique({ where: { email: emailTrim } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const passwordHash = await hashPassword(String(password))

    const vendor = await prisma.adminUser.create({
      data: {
        email: emailTrim,
        passwordHash,
        name: name ? String(name).trim() : null,
        role: "vendor",
      },
    })

    return NextResponse.json(
      { id: vendor.id, email: vendor.email, name: vendor.name, message: "Vendor account created." },
      { status: 201 }
    )
  } catch (error) {
    console.error("Super-admin create vendor:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
