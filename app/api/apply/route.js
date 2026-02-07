import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

const APPLY_EMAIL_SUFFIX = "@apply.uhs.in"
const DEFAULT_PASSWORD = "welcome1"

function normalizePhone(phone) {
  return String(phone).replace(/\D/g, "").trim()
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let body = {}

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          if (value.size === 0) continue
          const dir = path.join(process.cwd(), "public", "uploads", "resumes")
          await mkdir(dir, { recursive: true })
          const ext = path.extname(value.name) || ".pdf"
          const filename = `${Date.now()}-${value.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
          const filepath = path.join(dir, filename)
          const buf = Buffer.from(await value.arrayBuffer())
          await writeFile(filepath, buf)
          body.resume = `/uploads/resumes/${filename}`
        } else {
          body[key] = value
        }
      }
    } else {
      body = await request.json()
    }

    const name = (body.fullName || body.name || "").trim()
    const phone = (body.phone || "").trim()
    const email = (body.email || "").trim() || null
    const position = (body.position || "").trim() || "General"
    const experience = (body.experience || "").trim() || ""
    const location = (body.location || "").trim() || ""
    const availability = (body.availability || "").trim() || null
    const coverLetter = (body.coverLetter || body.notes || "").trim() || null

    if (!name || !phone) {
      return NextResponse.json({ error: "Full name and phone number are required" }, { status: 400 })
    }

    const phoneDigits = normalizePhone(phone)
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 })
    }

    const applyEmail = `${phoneDigits}${APPLY_EMAIL_SUFFIX}`

    let user = await prisma.user.findUnique({ where: { email: applyEmail } })
    if (!user) {
      const passwordHash = await hashPassword(DEFAULT_PASSWORD)
      user = await prisma.user.create({
        data: {
          email: applyEmail,
          passwordHash,
          name,
        },
      })
    }

    const candidateData = {
      name,
      email: email || null,
      phone,
      position,
      experience,
      location,
      availability,
      notes: coverLetter,
      status: "recently-applied",
      source: "Website",
      resume: body.resume || null,
      userId: user.id,
    }
    if (candidateData.resume) candidateData.resumeUpdatedAt = new Date()

    const candidate = await prisma.candidate.create({
      data: candidateData,
    })

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
      message: "Application submitted. You can log in with your phone number and password “welcome1” to track applications. Change your password in your profile.",
    }, { status: 201 })
  } catch (error) {
    console.error("Apply error:", error)
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
  }
}
