import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const outletId = searchParams.get("outletId")
    const replacedCandidateId = searchParams.get("replacedCandidateId")
    const replacementCandidateId = searchParams.get("replacementCandidateId")

    const where = {}
    if (outletId) {
      const id = parseInt(outletId, 10)
      if (!Number.isNaN(id)) where.outletId = id
    }
    if (replacedCandidateId) {
      const id = parseInt(replacedCandidateId, 10)
      if (!Number.isNaN(id)) where.replacedCandidateId = id
    }
    if (replacementCandidateId) {
      const id = parseInt(replacementCandidateId, 10)
      if (!Number.isNaN(id)) where.replacementCandidateId = id
    }

    const list = await prisma.candidateReplacement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        replacedCandidate: { select: { id: true, name: true, phone: true, position: true } },
        replacementCandidate: { select: { id: true, name: true, phone: true, position: true } },
        outlet: { select: { id: true, name: true } },
        replacedHr: { select: { id: true, name: true, email: true } },
        replacementHr: { select: { id: true, name: true, email: true } },
      },
    })

    const serialized = list.map((r) => ({
      ...r,
      dateOfJoining: r.dateOfJoining.toISOString(),
      exitDate: r.exitDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }))
    return NextResponse.json(serialized)
  } catch (error) {
    console.error("Error fetching replacements:", error)
    return NextResponse.json({ error: "Failed to fetch replacements" }, { status: 500 })
  }
}

async function getVendorSession(request) {
  const auth = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!auth) return null
  return prisma.session.findFirst({
    where: { sessionToken: auth, expiresAt: { gt: new Date() } },
    include: { adminUser: true },
  })
}

export async function POST(request) {
  try {
    const session = await getVendorSession(request)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const {
      replacedCandidateId,
      replacementCandidateId,
      outletId,
      position,
      replacedHrId,
      replacementHrId,
      dateOfJoining,
      exitDate,
      salary,
    } = body

    if (
      replacedCandidateId == null ||
      replacementCandidateId == null ||
      !outletId ||
      !position ||
      !dateOfJoining ||
      !exitDate
    ) {
      return NextResponse.json(
        { error: "replacedCandidateId, replacementCandidateId, outletId, position, dateOfJoining, exitDate are required" },
        { status: 400 }
      )
    }

    const replacedId = parseInt(replacedCandidateId, 10)
    const replacementId = parseInt(replacementCandidateId, 10)
    const outId = parseInt(outletId, 10)
    if (Number.isNaN(replacedId) || Number.isNaN(replacementId) || Number.isNaN(outId)) {
      return NextResponse.json({ error: "Invalid ids" }, { status: 400 })
    }
    if (replacedId === replacementId) {
      return NextResponse.json({ error: "Replaced and replacement candidate must be different" }, { status: 400 })
    }

    const candidateReplacementDelegate = prisma.candidateReplacement ?? prisma.CandidateReplacement
    if (!candidateReplacementDelegate) {
      console.error("Prisma client missing candidateReplacement delegate. Run: npx prisma generate and restart the server.")
      return NextResponse.json(
        { error: "Server configuration error. Please run: npx prisma generate and restart the dev server." },
        { status: 500 }
      )
    }

    const replacement = await candidateReplacementDelegate.create({
      data: {
        replacedCandidateId: replacedId,
        replacementCandidateId: replacementId,
        outletId: outId,
        position: String(position).trim(),
        replacedHrId: replacedHrId != null && replacedHrId !== "" ? parseInt(replacedHrId, 10) : null,
        replacementHrId: replacementHrId != null && replacementHrId !== "" ? parseInt(replacementHrId, 10) : null,
        dateOfJoining: new Date(dateOfJoining),
        exitDate: new Date(exitDate),
        salary: salary != null && String(salary).trim() !== "" ? String(salary).trim() : null,
      },
      include: {
        replacedCandidate: { select: { id: true, name: true, phone: true, position: true } },
        replacementCandidate: { select: { id: true, name: true, phone: true, position: true } },
        outlet: { select: { id: true, name: true } },
        replacedHr: { select: { id: true, name: true, email: true } },
        replacementHr: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      ...replacement,
      dateOfJoining: replacement.dateOfJoining.toISOString(),
      exitDate: replacement.exitDate.toISOString(),
      createdAt: replacement.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Error creating replacement:", error)
    if (error.code === "P2003") return NextResponse.json({ error: "Candidate or outlet not found" }, { status: 404 })
    return NextResponse.json({ error: "Failed to create replacement" }, { status: 500 })
  }
}
