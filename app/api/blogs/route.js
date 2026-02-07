import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const all = searchParams.get("all") === "1"
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")

    const where = all && auth ? {} : { publishedAt: { not: null } }
    if (all && auth) {
      const session = await prisma.session.findFirst({
        where: { sessionToken: auth, expiresAt: { gt: new Date() } },
        include: { adminUser: true },
      })
      if (!session) where.publishedAt = { not: null }
    }

    const list = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      where,
    })
    return NextResponse.json(
      list.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        publishedAt: b.publishedAt?.toISOString() ?? null,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }))
    )
  } catch (error) {
    console.error("Blogs list:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session || (session.adminUser.role !== "super_admin" && session.adminUser.role !== "vendor")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, slug, excerpt, content, published } = body
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })

    const slugVal = slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const blog = await prisma.blog.create({
      data: {
        title: String(title),
        slug: slugVal,
        excerpt: excerpt ? String(excerpt) : null,
        content: content ? String(content) : null,
        publishedAt: published ? new Date() : null,
      },
    })

    return NextResponse.json(
      { id: blog.id, title: blog.title, slug: blog.slug, excerpt: blog.excerpt, publishedAt: blog.publishedAt?.toISOString() ?? null, createdAt: blog.createdAt.toISOString() },
      { status: 201 }
    )
  } catch (error) {
    console.error("Blog create:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
