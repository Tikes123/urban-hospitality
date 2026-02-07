"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react"
import { toast } from "sonner"

const VENDOR_ID = 1

export default function ManageHRPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editHr, setEditHr] = useState(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "" })
  const [submitting, setSubmitting] = useState(false)
  const [hrMonthlyPrice, setHrMonthlyPrice] = useState(2000)

  useEffect(() => {
    fetchList()
  }, [page, limit])

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setHrMonthlyPrice(d.hrMailPrice ?? 2000))
      .catch(() => {})
  }, [])

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/hr?vendorId=${VENDOR_ID}&page=${page}&limit=${limit}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to fetch")
      setList(json.data ?? [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 1)
    } catch (e) {
      toast.error("Failed to load HR list")
      setList([])
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setForm({ name: "", email: "", phone: "" })
    setAddOpen(true)
  }

  const openEdit = (hr) => {
    setEditHr(hr)
    setForm({ name: hr.name, email: hr.email, phone: hr.phone || "" })
    setEditOpen(true)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: VENDOR_ID, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add")
      toast.success("HR added. ₹" + hrMonthlyPrice + "/month per HR will apply.")
      setAddOpen(false)
      fetchList()
    } catch (err) {
      toast.error(err.message || "Failed to add HR")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editHr) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/hr/${editHr.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      toast.success("HR updated")
      setEditOpen(false)
      setEditHr(null)
      fetchList()
    } catch (err) {
      toast.error(err.message || "Failed to update")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Remove this HR? Candidates linked to them will keep the link.")) return
    try {
      const res = await fetch(`/api/hr/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete")
      toast.success("HR removed")
      fetchList()
    } catch (err) {
      toast.error(err.message || "Failed to delete")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage HR</h1>
          <p className="text-gray-600 mb-6">HR contacts and team. Each HR costs ₹{hrMonthlyPrice.toLocaleString("en-IN")}/month.</p>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  HR list
                </CardTitle>
                <CardDescription>Add or remove HR emails. Billing: ₹{hrMonthlyPrice.toLocaleString("en-IN")}/month per HR.</CardDescription>
              </div>
              <Button onClick={openAdd} className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4" />
                Add HR
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No HR added yet. Click &quot;Add HR&quot; to add one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        list.map((hr) => (
                          <TableRow key={hr.id}>
                            <TableCell>{hr.name}</TableCell>
                            <TableCell>{hr.email}</TableCell>
                            <TableCell>{hr.phone || "—"}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(hr)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(hr.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      total={total}
                      limit={limit}
                      onPageChange={setPage}
                      onLimitChange={(l) => { setLimit(l); setPage(1) }}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add HR</DialogTitle>
            <DialogDescription>Cost: ₹{hrMonthlyPrice.toLocaleString("en-IN")}/month per HR. Payment can be managed in Billing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Full name" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="hr@example.com" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditHr(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit HR</DialogTitle>
            <DialogDescription>{editHr?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
