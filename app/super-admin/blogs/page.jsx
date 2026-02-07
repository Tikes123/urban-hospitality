"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminBlogsPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", published: false })
  const [submitting, setSubmitting] = useState(false)

  const fetchList = () => {
    const token = localStorage.getItem("auth_token")
    fetch("/api/blogs?all=1", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => fetchList(), [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error("Title required")
      return
    }
    setSubmitting(true)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: form.slug.trim() || undefined,
          excerpt: form.excerpt.trim() || undefined,
          content: form.content.trim() || undefined,
          published: form.published,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("Blog post created")
      setOpen(false)
      setForm({ title: "", slug: "", excerpt: "", content: "", published: false })
      fetchList()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          Post blog
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published posts</CardTitle>
          <CardDescription>Only published posts appear on the public /blogs page.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground">No blog posts yet. Create one to publish.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell><Link href={`/blogs/${b.id}`} className="text-green-600 hover:underline">{b.title}</Link></TableCell>
                    <TableCell>{b.slug}</TableCell>
                    <TableCell>{b.publishedAt ? "Yes" : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post blog</DialogTitle>
            <DialogDescription>Create a new blog post. Set published to make it visible on /blogs.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Post title" />
            </div>
            <div>
              <Label>Slug (optional, auto from title)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="url-slug" />
            </div>
            <div>
              <Label>Excerpt (optional)</Label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary" />
            </div>
            <div>
              <Label>Content (optional)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Post content" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
