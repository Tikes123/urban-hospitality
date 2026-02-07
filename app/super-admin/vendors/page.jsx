"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export default function SuperAdminVendorsPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ email: "", password: "", name: "" })
  const [submitting, setSubmitting] = useState(false)

  const fetchList = () => {
    setLoading(true)
    const token = localStorage.getItem("auth_token")
    fetch("/api/super-admin/vendors", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => fetchList(), [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setSubmitting(true)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/super-admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("Vendor account created. They can log in at /login.")
      setOpen(false)
      setForm({ email: "", password: "", name: "" })
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
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <Button onClick={() => setOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
          Create vendor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor accounts</CardTitle>
          <CardDescription>Only super-admin can create vendor accounts. Normal users cannot access vendor pages.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No vendors yet. Create one to allow them to log in to the vendor portal.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.name || "—"}</TableCell>
                      <TableCell>{v.email}</TableCell>
                      <TableCell>{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create vendor account</DialogTitle>
            <DialogDescription>They will use this to log in at /login and access /vendor.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-4">
            <div>
              <Label>Name (optional)</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vendor name" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="vendor@example.com" />
            </div>
            <div>
              <Label>Initial password * (min 6)</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
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
