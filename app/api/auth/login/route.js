import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth"

const SESSION_DAYS = 7
const APPLY_EMAIL_SUFFIX = "@apply.uhs.in"

function normalizePhone(str) {
  return String(str).replace(/\D/g, "").trim()
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const emailTrim = String(email).trim().toLowerCase()

    const adminUser = await prisma.adminUser.findUnique({
      where: { email: emailTrim },
    })

    if (adminUser) {
      const valid = await verifyPassword(password, adminUser.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      const existingSession = await prisma.session.findFirst({
        where: { adminUserId: adminUser.id, expiresAt: { gt: new Date() } },
      })
      if (existingSession) {
        return NextResponse.json(
          { error: "This account is already in use on another device. Please log out there first or use a single device." },
          { status: 403 }
        )
      }

      const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS)

      await prisma.session.create({
        data: {
          adminUserId: adminUser.id,
          sessionToken,
          expiresAt,
        },
      })

      return NextResponse.json({
        token: sessionToken,
        role: adminUser.role || "vendor",
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          avatar: adminUser.avatar,
          role: adminUser.role || "vendor",
        },
      })
    }

    let user = await prisma.user.findUnique({
      where: { email: emailTrim },
    })
    if (!user && /^[\d+]+$/.test(normalizePhone(emailTrim))) {
      const phoneDigits = normalizePhone(emailTrim)
      if (phoneDigits.length >= 10) {
        user = await prisma.user.findUnique({
          where: { email: `${phoneDigits}${APPLY_EMAIL_SUFFIX}` },
        })
      }
    }

    if (user) {
      const valid = await verifyPassword(password, user.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
      }

      const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS)

      await prisma.userSession.deleteMany({ where: { userId: user.id } })
      await prisma.userSession.create({
        data: { userId: user.id, sessionToken, expiresAt },
      })

      return NextResponse.json({
        token: sessionToken,
        role: "user",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      })
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
