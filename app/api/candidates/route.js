import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"

function parseBody(body) {
  const {
    name, email, phone, position, designationId, experience, location,
    availability, salary, skills, education, previousEmployer, references,
    notes, status, source, rating, resume,
  } = body
  return {
    name: name || "",
    email: email || null,
    phone,
    position,
    designationId: designationId ? parseInt(designationId) : null,
    experience,
    location,
    availability: availability || null,
    salary: salary || null,
    skills: skills || null,
    education: education || null,
    previousEmployer: previousEmployer || null,
    references: references || null,
    notes: notes || null,
    status: status || "recently-applied",
    source: source || null,
    rating: rating ? parseFloat(rating) : null,
    resume: resume || null,
  }
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const position = searchParams.get("position")
    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const phone = searchParams.get("phone")
    const candidateId = searchParams.get("candidateId")
    const resumeNotUpdatedMonths = searchParams.get("resumeNotUpdatedMonths")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(200, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)))

    const where = {}
    if (status && status !== "all") where.status = status
    if (position && position !== "all") where.position = { contains: position }
    if (location && location.trim()) where.location = { contains: location.trim() }
    if (phone && phone.trim()) where.phone = { contains: phone.trim() }
    if (candidateId && candidateId.trim()) {
      const id = parseInt(candidateId.trim(), 10)
      if (!isNaN(id)) where.id = id
    }
    if (resumeNotUpdatedMonths && resumeNotUpdatedMonths.trim()) {
      const months = parseInt(resumeNotUpdatedMonths.trim(), 10)
      if (!isNaN(months) && months > 0) {
        const cutoff = new Date()
        cutoff.setMonth(cutoff.getMonth() - months)
        where.OR = [
          { resumeUpdatedAt: null },
          { resumeUpdatedAt: { lt: cutoff } },
        ]
      }
    }
    if (search) {
      const searchClause = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { position: { contains: search } },
      ]
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchClause }]
        delete where.OR
      } else {
        where.OR = searchClause
      }
    }

    const [total, candidates] = await Promise.all([
      prisma.candidate.count({ where }),
      prisma.candidate.findMany({
        where,
        include: { designation: true },
        orderBy: { appliedDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)
    const data = candidates.map((candidate) => ({
      ...candidate,
      appliedDate: candidate.appliedDate.toISOString().split("T")[0],
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
      resumeUpdatedAt: candidate.resumeUpdatedAt?.toISOString() ?? null,
    }))

    return NextResponse.json({ data, total, page, limit, totalPages })
  } catch (error) {
    console.error("Error fetching candidates:", error)
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let data

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const body = {}
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
      data = parseBody(body)
    } else {
      const body = await request.json()
      data = parseBody(body)
    }

    const createData = {
      ...data,
      designationId: data.designationId || null,
    }
    if (createData.resume) createData.resumeUpdatedAt = new Date()

    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (auth) {
      const userSession = await prisma.userSession.findFirst({
        where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      })
      if (userSession) createData.userId = userSession.userId
    }

    const candidate = await prisma.candidate.create({
      data: createData,
      include: { designation: true },
    })

    return NextResponse.json({
      ...candidate,
      appliedDate: candidate.appliedDate.toISOString().split("T")[0],
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating candidate:", error)
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 })
  }
}
