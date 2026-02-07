import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const candidateId = searchParams.get("candidateId")

    const where = {}
    if (status && status !== "all") where.status = status
    if (candidateId) where.candidateId = parseInt(candidateId)

    const cvLinks = await prisma.cVLink.findMany({
      where,
      include: { candidate: true },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(cvLinks.map((link) => ({
      ...link,
      createdDate: link.createdDate.toISOString().split("T")[0],
      expiryDate: link.expiryDate.toISOString().split("T")[0],
      lastViewed: link.lastViewed?.toISOString().split("T")[0] || null,
      sharedWith: link.sharedWith ? JSON.parse(link.sharedWith) : [],
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
    })))
  } catch (error) {
    console.error("Error fetching CV links:", error)
    return NextResponse.json({ error: "Failed to fetch CV links" }, { status: 500 })
  }
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000"
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { candidateId, candidateName, position, linkId, shortUrl, fullUrl, expiryDate, sharedWith } = body
    const baseUrl = getBaseUrl().replace(/\/$/, "")
    const resolvedShortUrl = shortUrl || (linkId ? `${baseUrl}/cv/${linkId}` : "")
    const resolvedFullUrl = fullUrl || resolvedShortUrl

    const cvLink = await prisma.cVLink.create({
      data: {
        candidateId: parseInt(candidateId),
        candidateName,
        position,
        linkId,
        shortUrl: resolvedShortUrl,
        fullUrl: resolvedFullUrl,
        expiryDate: new Date(expiryDate),
        status: "active",
        views: 0,
        downloads: 0,
        sharedWith: Array.isArray(sharedWith) ? JSON.stringify(sharedWith) : JSON.stringify([]),
      },
      include: { candidate: true },
    })

    return NextResponse.json({
      ...cvLink,
      createdDate: cvLink.createdDate.toISOString().split("T")[0],
      expiryDate: cvLink.expiryDate.toISOString().split("T")[0],
      sharedWith: JSON.parse(cvLink.sharedWith),
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating CV link:", error)
    return NextResponse.json({ error: "Failed to create CV link" }, { status: 500 })
  }
}
