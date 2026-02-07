import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, hashPassword } from "@/lib/auth"

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { currentPassword, newPassword } = body
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password required" }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 })
    }

    const valid = await verifyPassword(currentPassword, session.adminUser.passwordHash)
    if (!valid) return NextResponse.json({ error: "Current password is wrong" }, { status: 400 })

    const passwordHash = await hashPassword(newPassword)
    await prisma.adminUser.update({
      where: { id: session.adminUserId },
      data: { passwordHash },
    })

    return NextResponse.json({ message: "Password updated" })
  } catch (error) {
    console.error("Change password:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
