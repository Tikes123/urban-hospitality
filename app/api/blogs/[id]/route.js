import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request, { params }) {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const blog = await prisma.blog.findFirst({
      where: { id, publishedAt: { not: null } },
    })
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      publishedAt: blog.publishedAt?.toISOString() ?? null,
      createdAt: blog.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Blog get:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
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

    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const body = await request.json()
    const updateData = {}
    if (body.title !== undefined) updateData.title = String(body.title)
    if (body.slug !== undefined) updateData.slug = String(body.slug)
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt ? String(body.excerpt) : null
    if (body.content !== undefined) updateData.content = body.content ? String(body.content) : null
    if (body.published !== undefined) updateData.publishedAt = body.published ? new Date() : null

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      publishedAt: blog.publishedAt?.toISOString() ?? null,
      createdAt: blog.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Blog update:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
