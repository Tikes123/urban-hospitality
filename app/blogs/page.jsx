"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BlogsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/blogs")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-light)]/20 to-white">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Blogs</h1>
          <p className="text-gray-600">Updates and insights for hospitality professionals.</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blogs/${post.id}`}>
                <Card className="border-gray-200 hover:shadow-md hover:border-[var(--brand)]/30 transition-all">
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription className="mt-1">{post.excerpt || ""}</CardDescription>
                    </div>
                    <span className="text-sm text-gray-500 shrink-0">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Draft"}
                    </span>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
