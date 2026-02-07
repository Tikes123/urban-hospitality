import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const vendorId = searchParams.get("vendorId")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "10", 10)))

    const vid = vendorId ? parseInt(vendorId, 10) : 1
    if (isNaN(vid)) {
      return NextResponse.json({ error: "Invalid vendorId" }, { status: 400 })
    }

    const where = { vendorId: vid }
    const [total, list] = await Promise.all([
      prisma.hr.count({ where }),
      prisma.hr.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)
    const data = list.map((h) => ({
      ...h,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
    }))

    return NextResponse.json({ data, total, page, limit, totalPages })
  } catch (error) {
    console.error("HR list error:", error)
    return NextResponse.json({ error: "Failed to fetch HR list" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { vendorId, name, email, phone } = body
    const vid = vendorId ? parseInt(vendorId, 10) : 1
    if (isNaN(vid) || !name || !email) {
      return NextResponse.json({ error: "vendorId, name and email required" }, { status: 400 })
    }

    const hr = await prisma.hr.create({
      data: {
        vendorId: vid,
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
      },
    })

    return NextResponse.json({
      ...hr,
      createdAt: hr.createdAt.toISOString(),
      updatedAt: hr.updatedAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error("HR create error:", error)
    if (error.code === "P2002") return NextResponse.json({ error: "Email already exists for this vendor" }, { status: 400 })
    return NextResponse.json({ error: "Failed to create HR" }, { status: 500 })
  }
}
