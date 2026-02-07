"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminMenuPermissionsPage() {
  const [vendors, setVendors] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [items, setItems] = useState([])
  const [loadingVendors, setLoadingVendors] = useState(true)
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    fetch("/api/super-admin/vendors", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setVendors)
      .catch(() => setVendors([]))
      .finally(() => setLoadingVendors(false))
  }, [])

  useEffect(() => {
    if (selectedId == null) {
      setItems([])
      return
    }
    setLoadingPerms(true)
    const token = localStorage.getItem("auth_token")
    fetch(`/api/super-admin/menu-permissions?adminUserId=${selectedId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoadingPerms(false))
  }, [selectedId])

  const handleToggle = (menuKey, checked) => {
    setItems((prev) =>
      prev.map((i) => (i.menuKey === menuKey ? { ...i, allowed: !!checked } : i))
    )
  }

  const handleSave = async () => {
    if (selectedId == null) return
    setSaving(true)
    const token = localStorage.getItem("auth_token")
    const permissions = {}
    items.forEach((i) => {
      permissions[i.menuKey] = i.allowed
    })
    try {
      const res = await fetch("/api/super-admin/menu-permissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminUserId: selectedId, permissions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast.success("Menu permissions saved.")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const selectedVendor = vendors.find((v) => v.id === selectedId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Menu permissions</h1>
        <p className="text-muted-foreground mt-1">
          Control which menu items each vendor sees in their header (name and route).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor</CardTitle>
          <CardDescription>Select a vendor to edit their visible menu items.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingVendors ? (
            <p className="text-muted-foreground">Loading vendors...</p>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[200px]">
                <Label className="text-muted-foreground">Vendor account</Label>
                <Select
                  value={selectedId != null ? String(selectedId) : ""}
                  onValueChange={(v) => setSelectedId(v ? parseInt(v, 10) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.name || v.email} ({v.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedVendor && (
                <Button onClick={handleSave} disabled={saving || loadingPerms}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save permissions
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedId != null && (
        <Card>
          <CardHeader>
            <CardTitle>Menu items</CardTitle>
            <CardDescription>
              Show or hide each menu for this vendor. Uncheck to hide the menu name and route from their header.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPerms ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Visible</TableHead>
                    <TableHead>Menu name</TableHead>
                    <TableHead>Route</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No menu items. Select another vendor or check the API.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.menuKey}>
                        <TableCell>
                          <Checkbox
                            checked={item.allowed}
                            onCheckedChange={(checked) => handleToggle(item.menuKey, checked)}
                            aria-label={`Toggle ${item.label}`}
                          />
                        </TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{item.path}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
