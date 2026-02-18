import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { prisma } from "@/lib/prisma"

function parseBody(body) {
  const {
    name, email, phone, position, experience, location,
    availability, salary, skills, education, previousEmployer, references,
    notes, status, source, rating, resume, attachments,
  } = body
  let attachmentsStr = null
  if (attachments != null) {
    attachmentsStr = typeof attachments === "string" ? attachments : JSON.stringify(Array.isArray(attachments) ? attachments : [])
  }
  return {
    name: name || "",
    email: email || null,
    phone,
    position,
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
    attachments: attachmentsStr,
  }
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const position = searchParams.get("position")
    const positions = searchParams.getAll("positions").filter((p) => p && p !== "all")
    const search = searchParams.get("search")
    const location = searchParams.get("location")
    const locations = searchParams.getAll("locations").filter((l) => l && l.trim())
    const isActiveFilter = searchParams.get("isActive") // "all" | "active" | "inactive"
    const phone = searchParams.get("phone")
    const phoneExact = searchParams.get("phoneExact")
    const candidateId = searchParams.get("candidateId")
    const resumeNotUpdatedMonths = searchParams.get("resumeNotUpdatedMonths")
    const appliedDateFrom = searchParams.get("appliedDateFrom")
    const appliedDateTo = searchParams.get("appliedDateTo")
    const updatedAtFrom = searchParams.get("updatedAtFrom")
    const updatedAtTo = searchParams.get("updatedAtTo")
    const outletIds = searchParams.getAll("outletIds").map((v) => parseInt(v, 10)).filter((n) => !Number.isNaN(n))
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(10000, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)))

    const where = {}
    if (status && status !== "all") where.status = status
    if (positions.length > 0) {
      where.position = { in: positions }
    } else if (position && position !== "all") where.position = { contains: position }
    if (location && location.trim()) where.location = { contains: location.trim() }
    if (locations.length > 0) {
      where.AND = [...(where.AND || []), { OR: locations.map((loc) => ({ location: { contains: loc.trim() } })) }]
    }
    if (isActiveFilter === "active") where.isActive = true
    else if (isActiveFilter === "inactive") where.isActive = false
    if (phoneExact && phoneExact.trim()) where.phone = phoneExact.trim()
    else if (phone && phone.trim()) where.phone = { contains: phone.trim() }
    if (candidateId && candidateId.trim()) {
      const id = parseInt(candidateId.trim(), 10)
      if (!isNaN(id)) where.id = id
    }
    if (resumeNotUpdatedMonths && resumeNotUpdatedMonths.trim()) {
      const months = parseInt(resumeNotUpdatedMonths.trim(), 10)
      if (!isNaN(months) && months > 0) {
        const cutoff = new Date()
        cutoff.setMonth(cutoff.getMonth() - months)
        where.AND = [...(where.AND || []), { OR: [{ resumeUpdatedAt: null }, { resumeUpdatedAt: { lt: cutoff } }] }]
      }
    }
    if (search) {
      const searchClause = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { position: { contains: search } },
        { location: { contains: search } },
      ]
      const uid = parseInt(search.trim(), 10)
      if (!Number.isNaN(uid)) searchClause.push({ id: uid })
      where.AND = [...(where.AND || []), { OR: searchClause }]
    }
    if (appliedDateFrom && appliedDateFrom.trim()) {
      const d = new Date(appliedDateFrom.trim())
      if (!Number.isNaN(d.getTime())) where.AND = [...(where.AND || []), { appliedDate: { gte: d } }]
    }
    if (appliedDateTo && appliedDateTo.trim()) {
      const d = new Date(appliedDateTo.trim())
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999)
        where.AND = [...(where.AND || []), { appliedDate: { lte: d } }]
      }
    }
    if (updatedAtFrom && updatedAtFrom.trim()) {
      const d = new Date(updatedAtFrom.trim())
      if (!Number.isNaN(d.getTime())) where.AND = [...(where.AND || []), { updatedAt: { gte: d } }]
    }
    if (updatedAtTo && updatedAtTo.trim()) {
      const d = new Date(updatedAtTo.trim())
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999)
        where.AND = [...(where.AND || []), { updatedAt: { lte: d } }]
      }
    }
    if (outletIds.length > 0) {
      where.schedules = { some: { outletId: { in: outletIds } } }
    }

    const [total, candidates] = await Promise.all([
      prisma.candidate.count({ where }),
      prisma.candidate.findMany({
        where,
        include: { addedByHr: true },
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
      attachments: candidate.attachments ? (typeof candidate.attachments === "string" ? JSON.parse(candidate.attachments) : candidate.attachments) : [],
      addedByHr: candidate.addedByHr ? { id: candidate.addedByHr.id, name: candidate.addedByHr.name } : null,
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
      const attachmentFiles = formData.getAll("attachments").filter((v) => v instanceof File && v.size > 0)
      const dir = path.join(process.cwd(), "public", "uploads", "resumes")
      await mkdir(dir, { recursive: true })
      const uploadedPaths = []
      for (let i = 0; i < attachmentFiles.length; i++) {
        const value = attachmentFiles[i]
        const ext = path.extname(value.name) || ".pdf"
        const filename = `${Date.now()}-${i}-${value.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
        const filepath = path.join(dir, filename)
        const buf = Buffer.from(await value.arrayBuffer())
        await writeFile(filepath, buf)
        uploadedPaths.push({ path: `/uploads/resumes/${filename}`, name: value.name, order: i })
      }
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) continue
        body[key] = value
      }
      if (uploadedPaths.length > 0) {
        body.attachments = JSON.stringify(uploadedPaths)
        if (!body.resume) body.resume = uploadedPaths[0].path
      }
      data = parseBody(body)
    } else {
      const body = await request.json()
      data = parseBody(body)
    }

    const phoneDigits = String(data.phone || "").replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      return NextResponse.json({ error: "Phone must be exactly 10 digits; no spaces or other characters allowed." }, { status: 400 })
    }
    const normalizedPhone = phoneDigits

    const existing = await prisma.candidate.findFirst({
      where: { phone: normalizedPhone },
    })
    if (existing) {
      return NextResponse.json({ error: "A candidate with this mobile number already exists." }, { status: 400 })
    }

    const createData = {
      ...data,
      phone: normalizedPhone,
    }
    if (createData.resume || createData.attachments) createData.resumeUpdatedAt = new Date()

    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (auth) {
      const userSession = await prisma.userSession.findFirst({
        where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      })
      if (userSession) createData.userId = userSession.userId
    }

    const candidate = await prisma.candidate.create({
      data: createData,
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
