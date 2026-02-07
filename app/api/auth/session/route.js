import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const body = await request.json()
    const { adminUserId, sessionToken, deviceInfo, expiresAt } = body
    if (!adminUserId || !sessionToken || !expiresAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.session.deleteMany({
      where: { adminUserId },
    })

    const expires = new Date(expiresAt)
    const session = await prisma.session.create({
      data: {
        adminUserId: Number(adminUserId),
        sessionToken,
        deviceInfo: deviceInfo || null,
        expiresAt: expires,
      },
    })

    return NextResponse.json({
      id: session.id,
      sessionToken: session.sessionToken,
      expiresAt: session.expiresAt.toISOString(),
    })
  } catch (error) {
    console.error("Session create error:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ?? request.nextUrl.searchParams.get("token")
    if (!token) {
      return NextResponse.json({ valid: false, error: "No token" }, { status: 401 })
    }

    const adminSession = await prisma.session.findFirst({
      where: { sessionToken: token, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })

    if (adminSession) {
      return NextResponse.json({
        valid: true,
        role: adminSession.adminUser.role || "vendor",
        user: {
          id: adminSession.adminUser.id,
          email: adminSession.adminUser.email,
          name: adminSession.adminUser.name,
          avatar: adminSession.adminUser.avatar,
          role: adminSession.adminUser.role || "vendor",
        },
      })
    }

    const userSession = await prisma.userSession.findFirst({
      where: { sessionToken: token, expiresAt: { gt: new Date() } },
      include: { user: true },
    })

    if (userSession) {
      return NextResponse.json({
        valid: true,
        role: "user",
        user: {
          id: userSession.user.id,
          email: userSession.user.email,
          name: userSession.user.name,
          avatar: userSession.user.avatar,
        },
      })
    }

    return NextResponse.json({ valid: false, error: "Invalid or expired session" }, { status: 401 })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
