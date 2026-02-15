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
import { ArrowLeft, Plus, MoreHorizontal, Edit, Trash2, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"

function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return t ? { Authorization: "Bearer " + t } : {}
}

export default function LocationPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [value, setValue] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchList = () => {
    setLoading(true)
    fetch("/api/vendor/locations", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = value.trim()
    if (!v) return
    setSaving(true)
    try {
      if (editing) {
        const res = await fetch("/api/vendor/locations/" + editing.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ value: v }),
        })
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to update") }
        toast.success("Location updated")
      } else {
        const res = await fetch("/api/vendor/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ value: v }),
        })
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed to add") }
        toast.success("Location added")
      }
      setDialogOpen(false)
      setEditing(null)
      setValue("")
      fetchList()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this location?")) return
    try {
      const res = await fetch("/api/vendor/locations/" + id, { method: "DELETE", headers: authHeaders() })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Deleted")
      fetchList()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const openEdit = (row) => {
    setEditing(row)
    setValue(row.value)
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
                <MapPin className="w-5 h-5" />
                Location
              </CardTitle>
              <CardDescription>Manage locations/areas (used in filters and candidate location).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditing(null); setValue(""); setDialogOpen(true); }} className="gap-2">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground py-8">No locations yet.</TableCell>
                      </TableRow>
                    ) : (
                      list.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.value}</TableCell>
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
            <DialogTitle>{editing ? "Edit location" : "Add location"}</DialogTitle>
            <DialogDescription>Enter the location/area name (e.g. Whitefield, Koramangala).</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="loc-value">Value</Label>
              <Input id="loc-value" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Whitefield" required />
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
