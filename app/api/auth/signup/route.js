import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password, name } = body
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const emailTrim = String(email).trim().toLowerCase()
    const existing = await prisma.user.findUnique({ where: { email: emailTrim } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const passwordHash = await hashPassword(String(password))

    const user = await prisma.user.create({
      data: {
        email: emailTrim,
        passwordHash,
        name: name ? String(name).trim() : null,
      },
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      message: "Account created. Please log in.",
    }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
