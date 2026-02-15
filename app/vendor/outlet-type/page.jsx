"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { ArrowLeft, Plus, MoreHorizontal, Edit, Trash2, Loader2, Building2 } from "lucide-react"
import { toast } from "sonner"

function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return t ? { Authorization: "Bearer " + t } : {}
}

export default function OutletTypePage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchList = () => {
    setLoading(true)
    fetch("/api/vendor/outlet-types", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const value = name.trim()
    if (!value) return
    setSaving(true)
    try {
      const url = editing ? "/api/vendor/outlet-types/" + editing.id : "/api/vendor/outlet-types"
      const method = editing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name: value }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to save") }
      toast.success(editing ? "Outlet type updated" : "Outlet type added")
      setDialogOpen(false)
      setEditing(null)
      setName("")
      fetchList()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this outlet type?")) return
    try {
      const res = await fetch("/api/vendor/outlet-types/" + id, { method: "DELETE", headers: authHeaders() })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Deleted")
      fetchList()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const openEdit = (row) => {
    setEditing(row)
    setName(row.name)
    setDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/vendor" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Link>
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Outlet type
              </CardTitle>
              <CardDescription>Manage outlet types (e.g. hotel, restaurant, bar).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditing(null); setName(""); setDialogOpen(true); }} className="gap-2">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">No outlet types yet.</TableCell>
                      </TableRow>
                    ) : (
                      list.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(row)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(row.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit outlet type" : "Add outlet type"}</DialogTitle>
            <DialogDescription>Enter the name (e.g. Hotel, Restaurant, Bar).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="ot-name">Name</Label>
              <Input id="ot-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hotel" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
