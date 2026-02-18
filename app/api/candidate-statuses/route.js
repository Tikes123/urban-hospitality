import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const list = await prisma.candidateStatus.findMany({
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    })
    return NextResponse.json(list)
  } catch (error) {
    console.error("Candidate statuses GET:", error)
    return NextResponse.json({ error: "Failed to fetch statuses" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { value, label, color } = body
    const valueSlug = (value != null ? String(value).trim() : "").toLowerCase().replace(/\s+/g, "-")
    if (!valueSlug || !label) {
      return NextResponse.json({ error: "value and label are required" }, { status: 400 })
    }
    const existing = await prisma.candidateStatus.findUnique({
      where: { value: valueSlug },
    })
    if (existing) {
      return NextResponse.json({ error: "Status with this value already exists" }, { status: 409 })
    }
    const maxOrder = await prisma.candidateStatus.aggregate({
      _max: { sortOrder: true },
    })
    const created = await prisma.candidateStatus.create({
      data: {
        value: valueSlug,
        label: String(label).trim(),
        color: color && String(color).trim() ? String(color).trim() : "bg-gray-100 text-gray-800 border-gray-200",
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Candidate statuses POST:", error)
    return NextResponse.json({ error: "Failed to create status" }, { status: 500 })
  }
}
