"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { ArrowLeft, Loader2, Users, Save } from "lucide-react"
import { VENDOR_MENU_ITEMS, VENDOR_DROPDOWN_ITEMS, FEATURE_KEYS, ACTION_ITEM_KEYS } from "@/lib/vendorMenuConfig"
import { toast } from "sonner"

export default function VendorMenuPermissionsPage() {
  const [hrList, setHrList] = useState([])
  const [selectedHrId, setSelectedHrId] = useState(null)
  const [hrAllowedMap, setHrAllowedMap] = useState(null)
  const [hrLoading, setHrLoading] = useState(false)
  const [hrSaving, setHrSaving] = useState(false)

  useEffect(() => {
    let vendorId = null
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null
      if (raw) {
        const u = JSON.parse(raw)
        if (u?.id) vendorId = u.id
      }
    } catch (_) {}
    if (!vendorId) return
    fetch(`/api/hr?vendorId=${vendorId}&limit=200`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setHrList(data.data ?? []))
      .catch(() => setHrList([]))
  }, [])

  useEffect(() => {
    if (selectedHrId == null) {
      setHrAllowedMap(null)
      return
    }
    setHrLoading(true)
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!t) {
      setHrLoading(false)
      return
    }
    fetch(`/api/vendor/hr-permissions?hrId=${selectedHrId}`, { headers: { Authorization: `Bearer ${t}` } })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setHrAllowedMap(data.allowedMap || {}))
      .catch(() => setHrAllowedMap({}))
      .finally(() => setHrLoading(false))
  }, [selectedHrId])

  const handleHrToggle = (menuKey, checked) => {
    if (hrAllowedMap == null) return
    setHrAllowedMap((prev) => ({ ...prev, [menuKey]: !!checked }))
  }

  const handleHrSave = async () => {
    if (selectedHrId == null || hrAllowedMap == null) return
    setHrSaving(true)
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!t) {
      toast.error("Not authenticated")
      setHrSaving(false)
      return
    }
    try {
      const res = await fetch("/api/vendor/hr-permissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ hrId: selectedHrId, permissions: hrAllowedMap }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      if (data.allowedMap) setHrAllowedMap(data.allowedMap)
      toast.success("HR permissions saved successfully")
    } catch (err) {
      toast.error(err.message || "Failed to save HR permissions")
    } finally {
      setHrSaving(false)
    }
  }

  const isHrAllowed = (key) => hrAllowedMap != null && hrAllowedMap[key] !== false

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/vendor" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7" />
              Action menu control
            </h1>
            <p className="text-muted-foreground mt-1">
              Assign which menu items, features, and row actions each HR user can see. Select an HR below to edit their permissions.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                HR user permissions
              </CardTitle>
              <CardDescription>
                Choose an HR user, then toggle which menu items, features, and actions they can access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select HR user</Label>
                    <Select
                      value={selectedHrId != null ? String(selectedHrId) : ""}
                      onValueChange={(v) => setSelectedHrId(v ? parseInt(v, 10) : null)}
                    >
                      <SelectTrigger className="mt-2 max-w-md">
                        <SelectValue placeholder="Choose an HR user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {hrList.map((hr) => (
                          <SelectItem key={hr.id} value={String(hr.id)}>
                            {hr.name} ({hr.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedHrId != null && (
                    <>
                      <div className="flex justify-end">
                        <Button onClick={handleHrSave} disabled={hrSaving || hrLoading || hrAllowedMap == null} className="gap-2">
                          {hrSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save for this HR
                        </Button>
                      </div>
                      {hrLoading ? (
                        <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                      ) : hrAllowedMap != null ? (
                        <>
                          <div className="text-sm font-medium text-muted-foreground">Menu items</div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[80px]">Visible</TableHead>
                                <TableHead>Name</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {[...VENDOR_MENU_ITEMS, ...VENDOR_DROPDOWN_ITEMS].map((m) => (
                                <TableRow key={m.menuKey}>
                                  <TableCell>
                                    <Checkbox checked={isHrAllowed(m.menuKey)} onCheckedChange={(c) => handleHrToggle(m.menuKey, c)} aria-label={`Toggle ${m.label}`} />
                                  </TableCell>
                                  <TableCell>{m.label}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <div className="text-sm font-medium text-muted-foreground mt-4">Features</div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[80px]">Visible</TableHead>
                                <TableHead>Feature</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {FEATURE_KEYS.map((f) => (
                                <TableRow key={f.menuKey}>
                                  <TableCell>
                                    <Checkbox checked={isHrAllowed(f.menuKey)} onCheckedChange={(c) => handleHrToggle(f.menuKey, c)} aria-label={`Toggle ${f.label}`} />
                                  </TableCell>
                                  <TableCell>{f.label}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <div className="text-sm font-medium text-muted-foreground mt-4">Row action menu items</div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[80px]">Visible</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ACTION_ITEM_KEYS.map((a) => (
                                <TableRow key={a.menuKey}>
                                  <TableCell>
                                    <Checkbox checked={isHrAllowed(a.menuKey)} onCheckedChange={(c) => handleHrToggle(a.menuKey, c)} aria-label={`Toggle ${a.label}`} />
                                  </TableCell>
                                  <TableCell>{a.label}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </>
                      ) : null}
                    </>
                  )}
                  {hrList.length === 0 && <p className="text-sm text-muted-foreground">Add HR users in Manage HR first.</p>}
                </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
