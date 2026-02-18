import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET replacements where this candidate was replaced (exited) or is the replacement (joined)
export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params
    const candidateId = parseInt(rawId, 10)
    if (Number.isNaN(candidateId)) {
      return NextResponse.json({ error: "Invalid candidate id" }, { status: 400 })
    }

    const list = await prisma.candidateReplacement.findMany({
      where: {
        OR: [
          { replacedCandidateId: candidateId },
          { replacementCandidateId: candidateId },
        ],
      },
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
    console.error("Error fetching candidate replacements:", error)
    return NextResponse.json({ error: "Failed to fetch replacements" }, { status: 500 })
  }
}
