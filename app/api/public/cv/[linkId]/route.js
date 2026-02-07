import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { linkId } = await params
    if (!linkId) return NextResponse.json({ error: "Link ID required" }, { status: 400 })
    const cvLink = await prisma.cVLink.findUnique({
      where: { linkId },
      include: { candidate: true },
    })
    if (!cvLink) return NextResponse.json({ error: "CV link not found" }, { status: 404 })
    if (cvLink.status !== "active") return NextResponse.json({ error: "This link is not active" }, { status: 403 })
    const now = new Date()
    if (new Date(cvLink.expiryDate) < now) return NextResponse.json({ error: "This link has expired" }, { status: 410 })
    const candidate = cvLink.candidate
    const attachments = candidate.attachments ? (typeof candidate.attachments === "string" ? JSON.parse(candidate.attachments) : candidate.attachments) : []
    const files = []
    const seen = new Set()
    if (candidate.resume) {
      files.push({ path: candidate.resume, name: "Resume", order: 0 })
      seen.add(candidate.resume)
    }
    attachments.forEach((a, i) => {
      if (a.path && !seen.has(a.path)) {
        files.push({ path: a.path, name: a.name || `File ${i + 1}`, order: a.order != null ? a.order : files.length })
        seen.add(a.path)
      }
    })
    files.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    return NextResponse.json({
      linkId: cvLink.linkId,
      candidateName: candidate.name,
      position: candidate.position,
      resume: candidate.resume,
      files,
    })
  } catch (error) {
    console.error("Public CV fetch error:", error)
    return NextResponse.json({ error: "Failed to load CV" }, { status: 500 })
  }
}
