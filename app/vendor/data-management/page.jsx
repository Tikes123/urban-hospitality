"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VendorHeader } from "@/components/vendor/vendor-header"
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  MapPin,
  Briefcase,
  Building2,
  Tag,
  Settings2,
} from "lucide-react"
import { toast } from "sonner"

function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return t ? { Authorization: "Bearer " + t } : {}
}

const VALID_TABS = ["location", "position", "outlet-type", "status"]

export default function DataManagementPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "location"
  )

  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) setActiveTab(tabParam)
  }, [tabParam])

  // Location
  const [locations, setLocations] = useState([])
  const [locationsLoading, setLocationsLoading] = useState(true)
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [locationEditing, setLocationEditing] = useState(null)
  const [locationValue, setLocationValue] = useState("")
  const [locationSaving, setLocationSaving] = useState(false)

  // Position
  const [positions, setPositions] = useState([])
  const [positionsLoading, setPositionsLoading] = useState(true)
  const [positionDialogOpen, setPositionDialogOpen] = useState(false)
  const [positionEditing, setPositionEditing] = useState(null)
  const [positionName, setPositionName] = useState("")
  const [positionSaving, setPositionSaving] = useState(false)

  // Outlet type
  const [outletTypes, setOutletTypes] = useState([])
  const [outletTypesLoading, setOutletTypesLoading] = useState(true)
  const [outletTypeDialogOpen, setOutletTypeDialogOpen] = useState(false)
  const [outletTypeEditing, setOutletTypeEditing] = useState(null)
  const [outletTypeName, setOutletTypeName] = useState("")
  const [outletTypeSaving, setOutletTypeSaving] = useState(false)

  // Status
  const [statuses, setStatuses] = useState([])
  const [statusesLoading, setStatusesLoading] = useState(true)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusEditing, setStatusEditing] = useState(null)
  const [statusValue, setStatusValue] = useState("")
  const [statusLabel, setStatusLabel] = useState("")
  const [statusColor, setStatusColor] = useState("bg-gray-100 text-gray-800 border-gray-200")
  const [statusSaving, setStatusSaving] = useState(false)

  const fetchLocations = () => {
    setLocationsLoading(true)
    fetch("/api/vendor/locations", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setLocations)
      .catch(() => setLocations([]))
      .finally(() => setLocationsLoading(false))
  }

  const fetchPositions = () => {
    setPositionsLoading(true)
    fetch("/api/vendor/positions", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setPositions)
      .catch(() => setPositions([]))
      .finally(() => setPositionsLoading(false))
  }

  const fetchOutletTypes = () => {
    setOutletTypesLoading(true)
    fetch("/api/vendor/outlet-types", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then(setOutletTypes)
      .catch(() => setOutletTypes([]))
      .finally(() => setOutletTypesLoading(false))
  }

  const fetchStatuses = () => {
    setStatusesLoading(true)
    fetch("/api/candidate-statuses")
      .then((r) => (r.ok ? r.json() : []))
      .then(setStatuses)
      .catch(() => setStatuses([]))
      .finally(() => setStatusesLoading(false))
  }

  useEffect(() => {
    fetchLocations()
    fetchPositions()
    fetchOutletTypes()
    fetchStatuses()
  }, [])

  // ——— Location ———
  const handleLocationSubmit = async (e) => {
    e.preventDefault()
    const v = locationValue.trim()
    if (!v) return
    setLocationSaving(true)
    try {
      if (locationEditing) {
        const res = await fetch("/api/vendor/locations/" + locationEditing.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ value: v }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to update")
        }
        toast.success("Location updated")
      } else {
        const res = await fetch("/api/vendor/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ value: v }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to add")
        }
        toast.success("Location added")
      }
      setLocationDialogOpen(false)
      setLocationEditing(null)
      setLocationValue("")
      fetchLocations()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLocationSaving(false)
    }
  }

  const handleLocationDelete = async (id) => {
    if (!confirm("Delete this location?")) return
    try {
      const res = await fetch("/api/vendor/locations/" + id, {
        method: "DELETE",
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Deleted")
      fetchLocations()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ——— Position ———
  const handlePositionSubmit = async (e) => {
    e.preventDefault()
    const v = positionName.trim()
    if (!v) return
    setPositionSaving(true)
    try {
      const url = positionEditing
        ? "/api/vendor/positions/" + positionEditing.id
        : "/api/vendor/positions"
      const method = positionEditing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name: v }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }
      toast.success(positionEditing ? "Position updated" : "Position added")
      setPositionDialogOpen(false)
      setPositionEditing(null)
      setPositionName("")
      fetchPositions()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setPositionSaving(false)
    }
  }

  const handlePositionDelete = async (id) => {
    if (!confirm("Delete this position?")) return
    try {
      const res = await fetch("/api/vendor/positions/" + id, {
        method: "DELETE",
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Deleted")
      fetchPositions()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ——— Outlet type ———
  const handleOutletTypeSubmit = async (e) => {
    e.preventDefault()
    const v = outletTypeName.trim()
    if (!v) return
    setOutletTypeSaving(true)
    try {
      const url = outletTypeEditing
        ? "/api/vendor/outlet-types/" + outletTypeEditing.id
        : "/api/vendor/outlet-types"
      const method = outletTypeEditing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name: v }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }
      toast.success(outletTypeEditing ? "Outlet type updated" : "Outlet type added")
      setOutletTypeDialogOpen(false)
      setOutletTypeEditing(null)
      setOutletTypeName("")
      fetchOutletTypes()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setOutletTypeSaving(false)
    }
  }

  const handleOutletTypeDelete = async (id) => {
    if (!confirm("Delete this outlet type?")) return
    try {
      const res = await fetch("/api/vendor/outlet-types/" + id, {
        method: "DELETE",
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Deleted")
      fetchOutletTypes()
    } catch (err) {
      toast.error(err.message)
    }
  }

  // ——— Status ———
  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    const v = (statusValue || "").trim().toLowerCase().replace(/\s+/g, "-")
    const label = (statusLabel || "").trim()
    if (!v || !label) {
      toast.error("Value and label are required")
      return
    }
    setStatusSaving(true)
    try {
      if (statusEditing) {
        const res = await fetch("/api/candidate-statuses/" + statusEditing.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: v, label, color: statusColor || "bg-gray-100 text-gray-800 border-gray-200" }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to update")
        }
        toast.success("Status updated")
      } else {
        const res = await fetch("/api/candidate-statuses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: v, label, color: statusColor || "bg-gray-100 text-gray-800 border-gray-200" }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to add")
        }
        toast.success("Status added")
      }
      setStatusDialogOpen(false)
      setStatusEditing(null)
      setStatusValue("")
      setStatusLabel("")
      setStatusColor("bg-gray-100 text-gray-800 border-gray-200")
      fetchStatuses()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setStatusSaving(false)
    }
  }

  const handleStatusDelete = async (id) => {
    if (!confirm("Delete this status? Candidates using it may show the raw value until updated.")) return
    try {
      const res = await fetch("/api/candidate-statuses/" + id, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Deleted")
      fetchStatuses()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm">
              <Link href="/vendor" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Manage locations, positions, outlet types, and view candidate statuses used across the app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="location" className="gap-1.5">
                    <MapPin className="w-4 h-4" /> Location
                  </TabsTrigger>
                  <TabsTrigger value="position" className="gap-1.5">
                    <Briefcase className="w-4 h-4" /> Position
                  </TabsTrigger>
                  <TabsTrigger value="outlet-type" className="gap-1.5">
                    <Building2 className="w-4 h-4" /> Outlet type
                  </TabsTrigger>
                  <TabsTrigger value="status" className="gap-1.5">
                    <Tag className="w-4 h-4" /> Status
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="location" className="mt-6">
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => {
                        setLocationEditing(null)
                        setLocationValue("")
                        setLocationDialogOpen(true)
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" /> Add location
                    </Button>
                  </div>
                  {locationsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Value</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {locations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                              No locations yet. Add one to use in filters and candidate location.
                            </TableCell>
                          </TableRow>
                        ) : (
                          locations.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.value}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setLocationEditing(row)
                                        setLocationValue(row.value)
                                        setLocationDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleLocationDelete(row.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="position" className="mt-6">
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => {
                        setPositionEditing(null)
                        setPositionName("")
                        setPositionDialogOpen(true)
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" /> Add position
                    </Button>
                  </div>
                  {positionsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                              No positions yet. Add job titles for candidates.
                            </TableCell>
                          </TableRow>
                        ) : (
                          positions.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setPositionEditing(row)
                                        setPositionName(row.name)
                                        setPositionDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handlePositionDelete(row.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="outlet-type" className="mt-6">
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => {
                        setOutletTypeEditing(null)
                        setOutletTypeName("")
                        setOutletTypeDialogOpen(true)
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" /> Add outlet type
                    </Button>
                  </div>
                  {outletTypesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {outletTypes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                              No outlet types yet. Add e.g. hotel, restaurant, bar.
                            </TableCell>
                          </TableRow>
                        ) : (
                          outletTypes.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{row.name}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setOutletTypeEditing(row)
                                        setOutletTypeName(row.name)
                                        setOutletTypeDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleOutletTypeDelete(row.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="status" className="mt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Add, edit, or remove candidate statuses. These are used in filters and candidate records. Run <code className="text-xs bg-muted px-1 rounded">npm run prisma:seed</code> if the list is empty.
                  </p>
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => {
                        setStatusEditing(null)
                        setStatusValue("")
                        setStatusLabel("")
                        setStatusColor("bg-gray-100 text-gray-800 border-gray-200")
                        setStatusDialogOpen(true)
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4" /> Add status
                    </Button>
                  </div>
                  {statusesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Value (stored)</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statuses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                              No statuses yet. Add one or run seed.
                            </TableCell>
                          </TableRow>
                        ) : (
                          statuses.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell className="font-mono text-sm">{row.value}</TableCell>
                              <TableCell>{row.label}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setStatusEditing(row)
                                        setStatusValue(row.value)
                                        setStatusLabel(row.label)
                                        setStatusColor(row.color || "bg-gray-100 text-gray-800 border-gray-200")
                                        setStatusDialogOpen(true)
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleStatusDelete(row.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Location dialog */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locationEditing ? "Edit location" : "Add location"}</DialogTitle>
            <DialogDescription>
              Used in filters and candidate location fields.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLocationSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="location-value">Value</Label>
              <Input
                id="location-value"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                placeholder="e.g. Koramangala, Whitefield"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setLocationDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={locationSaving} className="bg-green-600 hover:bg-green-700">
                {locationSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {locationEditing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Position dialog */}
      <Dialog open={positionDialogOpen} onOpenChange={setPositionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{positionEditing ? "Edit position" : "Add position"}</DialogTitle>
            <DialogDescription>
              Job title/position for candidates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePositionSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="position-name">Name</Label>
              <Input
                id="position-name"
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
                placeholder="e.g. Chef, Waiter, Manager"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPositionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={positionSaving} className="bg-green-600 hover:bg-green-700">
                {positionSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {positionEditing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Outlet type dialog */}
      <Dialog open={outletTypeDialogOpen} onOpenChange={setOutletTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{outletTypeEditing ? "Edit outlet type" : "Add outlet type"}</DialogTitle>
            <DialogDescription>
              Type of outlet (e.g. hotel, restaurant, bar).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOutletTypeSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="outlet-type-name">Name</Label>
              <Input
                id="outlet-type-name"
                value={outletTypeName}
                onChange={(e) => setOutletTypeName(e.target.value)}
                placeholder="e.g. Hotel, Restaurant"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOutletTypeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={outletTypeSaving} className="bg-green-600 hover:bg-green-700">
                {outletTypeSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {outletTypeEditing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{statusEditing ? "Edit status" : "Add status"}</DialogTitle>
            <DialogDescription>
              Value is stored in DB (slug); label is shown in the app. Use Tailwind classes for color (e.g. bg-green-100 text-green-800 border-green-200).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStatusSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="status-value">Value (slug) *</Label>
              <Input
                id="status-value"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                placeholder="e.g. interview-scheduled"
                disabled={!!statusEditing}
              />
              {statusEditing && <p className="text-xs text-muted-foreground mt-1">Value cannot be changed when editing.</p>}
            </div>
            <div>
              <Label htmlFor="status-label">Label *</Label>
              <Input
                id="status-label"
                value={statusLabel}
                onChange={(e) => setStatusLabel(e.target.value)}
                placeholder="e.g. Interview Scheduled"
              />
            </div>
            <div>
              <Label htmlFor="status-color">Color (Tailwind classes)</Label>
              <Input
                id="status-color"
                value={statusColor}
                onChange={(e) => setStatusColor(e.target.value)}
                placeholder="bg-gray-100 text-gray-800 border-gray-200"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={statusSaving} className="bg-green-600 hover:bg-green-700">
                {statusSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {statusEditing ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
