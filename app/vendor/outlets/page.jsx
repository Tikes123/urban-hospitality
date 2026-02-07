"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { VendorHeader } from "@/components/vendor/vendor-header"
import {
  Plus,
  MapPin,
  Phone,
  Mail,
  Users,
  Star,
  Edit,
  Trash2,
  Building,
  UtensilsCrossed,
  Wine,
  Hotel,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"

export default function OutletsPage() {
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOutlet, setEditingOutlet] = useState(null)
  const [areas, setAreas] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    area: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
    employees: "",
    openPositions: "0",
    rating: "",
    status: "active",
    description: "",
    image: "",
    clientId: "",
  })

  useEffect(() => {
    fetch("/api/areas")
      .then((res) => (res.ok ? res.json() : []))
      .then(setAreas)
      .catch(() => setAreas([]))
  }, [])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, typeFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchOutlets(), searchQuery ? 300 : 0)
    return () => clearTimeout(t)
  }, [page, limit, searchQuery, typeFilter])

  const fetchOutlets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.append("type", typeFilter)
      if (searchQuery) params.append("search", searchQuery)
      params.append("page", String(page))
      params.append("limit", String(limit))
      const response = await fetch(`/api/outlets?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch outlets")
      const json = await response.json()
      setOutlets(json.data ?? [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 1)
    } catch (error) {
      console.error("Error fetching outlets:", error)
      toast.error("Failed to load outlets")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const outletData = {
        ...formData,
        employees: parseInt(formData.employees) || 0,
        openPositions: parseInt(formData.openPositions) || 0,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        clientId: formData.clientId ? parseInt(formData.clientId) : null,
      }

      const url = editingOutlet ? `/api/outlets/${editingOutlet.id}` : "/api/outlets"
      const method = editingOutlet ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(outletData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save outlet")
      }

      toast.success(editingOutlet ? "Outlet updated successfully" : "Outlet created successfully")
      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingOutlet(null)
      resetForm()
      fetchOutlets()
    } catch (error) {
      console.error("Error saving outlet:", error)
      toast.error(error.message || "Failed to save outlet")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this outlet?")) return

    try {
      const response = await fetch(`/api/outlets/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete outlet")

      toast.success("Outlet deleted successfully")
      fetchOutlets()
    } catch (error) {
      console.error("Error deleting outlet:", error)
      toast.error("Failed to delete outlet")
    }
  }

  const handleEdit = (outlet) => {
    setEditingOutlet(outlet)
    setFormData({
      name: outlet.name,
      type: outlet.type,
      area: outlet.area || "",
      address: outlet.address,
      phone: outlet.phone,
      email: outlet.email,
      manager: outlet.manager,
      employees: outlet.employees.toString(),
      openPositions: (outlet.openPositions ?? 0).toString(),
      rating: outlet.rating?.toString() || "",
      status: outlet.status,
      description: outlet.description || "",
      image: outlet.image || "",
      clientId: outlet.clientId?.toString() || "",
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      area: "",
      address: "",
      phone: "",
      email: "",
      manager: "",
      employees: "",
      openPositions: "0",
      rating: "",
      status: "active",
      description: "",
      image: "",
      clientId: "",
    })
    setEditingOutlet(null)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case "hotel":
        return <Hotel className="w-5 h-5" />
      case "restaurant":
        return <UtensilsCrossed className="w-5 h-5" />
      case "bar":
        return <Wine className="w-5 h-5" />
      default:
        return <Building className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredOutlets = outlets

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Outlets Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Outlet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Outlet</DialogTitle>
                <DialogDescription>Enter the details for the new outlet</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="outlet-name">Outlet Name *</Label>
                      <Input
                        id="outlet-name"
                        placeholder="Enter outlet name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="outlet-type">Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="bar">Bar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="outlet-area">Area / Location *</Label>
                      <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Same as find job by area" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="outlet-openPositions">Open positions</Label>
                      <Input
                        id="outlet-openPositions"
                        type="number"
                        min="0"
                        placeholder="Job openings at this venue"
                        value={formData.openPositions}
                        onChange={(e) => setFormData({ ...formData, openPositions: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="outlet-address">Address *</Label>
                    <Input
                      id="outlet-address"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="outlet-phone">Phone *</Label>
                      <Input
                        id="outlet-phone"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="outlet-email">Email *</Label>
                      <Input
                        id="outlet-email"
                        type="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="outlet-manager">Manager *</Label>
                      <Input
                        id="outlet-manager"
                        placeholder="Manager name"
                        value={formData.manager}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="outlet-employees">Employees</Label>
                      <Input
                        id="outlet-employees"
                        type="number"
                        placeholder="Number of employees"
                        value={formData.employees}
                        onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="outlet-rating">Rating</Label>
                      <Input
                        id="outlet-rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="Rating (0-5)"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="outlet-status">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="outlet-description">Description</Label>
                    <Textarea
                      id="outlet-description"
                      placeholder="Brief description of the outlet"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="outlet-image">Image URL</Label>
                    <Input
                      id="outlet-image"
                      placeholder="Image URL (optional)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddDialogOpen(false)
                      resetForm()
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">Add Outlet</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Outlet</DialogTitle>
                <DialogDescription>Update outlet information</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-outlet-name">Outlet Name *</Label>
                      <Input
                        id="edit-outlet-name"
                        placeholder="Enter outlet name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-outlet-type">Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="bar">Bar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-outlet-area">Area / Location *</Label>
                      <Select value={formData.area} onValueChange={(value) => setFormData({ ...formData, area: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Same as find job by area" />
                        </SelectTrigger>
                        <SelectContent>
                          {areas.map((a) => (
                            <SelectItem key={a} value={a}>{a}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-outlet-openPositions">Open positions</Label>
                      <Input
                        id="edit-outlet-openPositions"
                        type="number"
                        min="0"
                        value={formData.openPositions}
                        onChange={(e) => setFormData({ ...formData, openPositions: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-outlet-address">Address *</Label>
                    <Input
                      id="edit-outlet-address"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-outlet-phone">Phone *</Label>
                      <Input
                        id="edit-outlet-phone"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-outlet-email">Email *</Label>
                      <Input
                        id="edit-outlet-email"
                        type="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-outlet-manager">Manager *</Label>
                      <Input
                        id="edit-outlet-manager"
                        placeholder="Manager name"
                        value={formData.manager}
                        onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-outlet-employees">Employees</Label>
                      <Input
                        id="edit-outlet-employees"
                        type="number"
                        placeholder="Number of employees"
                        value={formData.employees}
                        onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-outlet-rating">Rating</Label>
                      <Input
                        id="edit-outlet-rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="Rating (0-5)"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-outlet-status">Status *</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-outlet-description">Description</Label>
                    <Textarea
                      id="edit-outlet-description"
                      placeholder="Brief description of the outlet"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-outlet-image">Image URL</Label>
                    <Input
                      id="edit-outlet-image"
                      placeholder="Image URL (optional)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsEditDialogOpen(false)
                      resetForm()
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">Update Outlet</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search outlets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hotel">Hotels</SelectItem>
                    <SelectItem value="restaurant">Restaurants</SelectItem>
                    <SelectItem value="bar">Bars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setTypeFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outlets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading outlets...</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOutlets.map((outlet) => (
              <Card key={outlet.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={outlet.image || "/placeholder.svg"}
                    alt={outlet.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">{getStatusBadge(outlet.status)}</div>
                  {outlet.rating && (
                    <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/90 rounded px-2 py-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{outlet.rating}</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(outlet.type)}
                      <CardTitle className="text-lg">{outlet.name}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(outlet)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(outlet.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {outlet.description && <CardDescription>{outlet.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {outlet.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {outlet.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {outlet.email}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-sm">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback className="text-xs">
                            {outlet.manager
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-600">Manager: {outlet.manager}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {outlet.employees}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
        />

        {!loading && filteredOutlets.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No outlets found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
