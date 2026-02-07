"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function BlogPostPage() {
  const params = useParams()
  const id = params?.id
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(!!id)

  useEffect(() => {
    if (!id) return
    fetch(`/api/blogs/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--brand-light)]/20 to-white">
        <SiteHeader />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center"><p className="text-gray-500">Loading...</p></main>
        <SiteFooter />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--brand-light)]/20 to-white">
        <SiteHeader />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-600 mb-4">Post not found.</p>
          <Button variant="outline" asChild><Link href="/blogs">Back to Blogs</Link></Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-light)]/20 to-white">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/blogs" className="text-[var(--brand)] hover:underline text-sm mb-6 inline-block">← Back to Blogs</Link>
        <article>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
          <p className="text-gray-500 text-sm mb-6">
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN") : "Draft"}
          </p>
          <div className="text-gray-600 leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content?.replace(/\n/g, "<br />") || post.excerpt || "" }} />
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
