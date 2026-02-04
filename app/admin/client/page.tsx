"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  LogOut,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Building,
  MapPin,
  Phone,
  Mail,
  Users,
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  Hotel,
  UtensilsCrossed,
  Wine,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface Client {
  id: number
  name: string
  type: string
  contactPerson: string
  email: string
  phone: string
  address: string
  outlets: number
  employees: number
  contractValue: number
  contractStart: string
  contractEnd: string
  status: string
  rating: number | null
  services: string[]
  notes: string | null
  lastContact: string | null
}

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    outlets: "",
    employees: "",
    contractValue: "",
    contractStart: "",
    contractEnd: "",
    status: "active",
    rating: "",
    services: "",
    notes: "",
    lastContact: "",
  })

  // Fetch clients from API
  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (typeFilter !== "all") params.append("type", typeFilter)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/clients?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch clients")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast.error("Failed to load clients")
    } finally {
      setLoading(false)
    }
  }

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClients()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter, typeFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const clientData = {
        ...formData,
        outlets: parseInt(formData.outlets) || 0,
        employees: parseInt(formData.employees) || 0,
        contractValue: parseFloat(formData.contractValue) || 0,
        services: formData.services.split(",").map((s) => s.trim()).filter(Boolean),
        rating: formData.rating ? parseFloat(formData.rating) : null,
        lastContact: formData.lastContact || null,
      }

      const url = editingClient ? `/api/clients/${editingClient.id}` : "/api/clients"
      const method = editingClient ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save client")
      }

      toast.success(editingClient ? "Client updated successfully" : "Client created successfully")
      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingClient(null)
      resetForm()
      fetchClients()
    } catch (error: any) {
      console.error("Error saving client:", error)
      toast.error(error.message || "Failed to save client")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete client")

      toast.success("Client deleted successfully")
      fetchClients()
    } catch (error) {
      console.error("Error deleting client:", error)
      toast.error("Failed to delete client")
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      type: client.type,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      address: client.address,
      outlets: client.outlets.toString(),
      employees: client.employees.toString(),
      contractValue: client.contractValue.toString(),
      contractStart: client.contractStart,
      contractEnd: client.contractEnd,
      status: client.status,
      rating: client.rating?.toString() || "",
      services: client.services.join(", "),
      notes: client.notes || "",
      lastContact: client.lastContact || "",
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      outlets: "",
      employees: "",
      contractValue: "",
      contractStart: "",
      contractEnd: "",
      status: "active",
      rating: "",
      services: "",
      notes: "",
      lastContact: "",
    })
    setEditingClient(null)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return <Hotel className="w-4 h-4" />
      case "restaurant":
        return <UtensilsCrossed className="w-4 h-4" />
      case "bar":
        return <Wine className="w-4 h-4" />
      default:
        return <Building className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "trial":
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case "renewal-pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Renewal Pending</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case "paused":
        return <Badge className="bg-gray-100 text-gray-800">Paused</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === "active").length
  const totalRevenue = clients.reduce((sum, c) => sum + c.contractValue, 0)
  const avgRating =
    clients.length > 0
      ? (clients.reduce((sum, c) => sum + (c.rating || 0), 0) / clients.length).toFixed(1)
      : "0.0"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">URBAN</h1>
                  <p className="text-xs text-green-600 -mt-1">Hospitality SOLUTIONS</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Your Next Resort, Search Made Easy</span>
            </div>

            <nav className="flex items-center space-x-6">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/admin/add-candidate" className="text-gray-600 hover:text-gray-900">
                Add New Candidate
              </Link>
              <Link href="/admin/applicants" className="text-gray-600 hover:text-gray-900">
                View Applicants
              </Link>
              <Link href="/admin/outlets" className="text-gray-600 hover:text-gray-900">
                Outlets
              </Link>
              <Link href="/admin/calendar" className="text-gray-600 hover:text-gray-900">
                Calendar
              </Link>
              <Link href="/admin/cv-links" className="text-gray-600 hover:text-gray-900">
                Active CV Links
              </Link>
              <Link href="/admin/designation" className="text-gray-600 hover:text-gray-900">
                Designation
              </Link>
              <Link href="/admin/client" className="text-green-600 font-medium">
                Client
              </Link>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>Create a new client profile</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-name">Client Name</Label>
                      <Input
                        id="client-name"
                        placeholder="Enter client name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-type">Business Type</Label>
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
                      <Label htmlFor="contact-person">Contact Person</Label>
                      <Input
                        id="contact-person"
                        placeholder="Primary contact name"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="Contact email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-phone">Phone</Label>
                      <Input
                        id="contact-phone"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="outlets-count">Number of Outlets</Label>
                      <Input
                        id="outlets-count"
                        type="number"
                        placeholder="Number of outlets"
                        value={formData.outlets}
                        onChange={(e) => setFormData({ ...formData, outlets: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employees-count">Number of Employees</Label>
                      <Input
                        id="employees-count"
                        type="number"
                        placeholder="Number of employees"
                        value={formData.employees}
                        onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-address">Address</Label>
                      <Input
                        id="client-address"
                        placeholder="Business address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="contract-value">Contract Value</Label>
                      <Input
                        id="contract-value"
                        type="number"
                        placeholder="Annual contract value"
                        value={formData.contractValue}
                        onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contract-start">Contract Start Date</Label>
                      <Input
                        id="contract-start"
                        type="date"
                        value={formData.contractStart}
                        onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contract-end">Contract End Date</Label>
                      <Input
                        id="contract-end"
                        type="date"
                        value={formData.contractEnd}
                        onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="renewal-pending">Renewal Pending</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="client-rating">Rating</Label>
                      <Input
                        id="client-rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="Rating (0-5)"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="services">Services (comma-separated)</Label>
                    <Textarea
                      id="services"
                      placeholder="Staff Management, Training, Recruitment"
                      rows={2}
                      value={formData.services}
                      onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-notes">Notes</Label>
                    <Textarea
                      id="client-notes"
                      placeholder="Additional notes about the client"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-contact">Last Contact Date</Label>
                    <Input
                      id="last-contact"
                      type="date"
                      value={formData.lastContact}
                      onChange={(e) => setFormData({ ...formData, lastContact: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Add Client
                    </Button>
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
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription>Update client information</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-client-name">Client Name</Label>
                      <Input
                        id="edit-client-name"
                        placeholder="Enter client name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-client-type">Business Type</Label>
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
                      <Label htmlFor="edit-contact-person">Contact Person</Label>
                      <Input
                        id="edit-contact-person"
                        placeholder="Primary contact name"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-contact-email">Email</Label>
                      <Input
                        id="edit-contact-email"
                        type="email"
                        placeholder="Contact email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-contact-phone">Phone</Label>
                      <Input
                        id="edit-contact-phone"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-outlets-count">Number of Outlets</Label>
                      <Input
                        id="edit-outlets-count"
                        type="number"
                        placeholder="Number of outlets"
                        value={formData.outlets}
                        onChange={(e) => setFormData({ ...formData, outlets: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-employees-count">Number of Employees</Label>
                      <Input
                        id="edit-employees-count"
                        type="number"
                        placeholder="Number of employees"
                        value={formData.employees}
                        onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-client-address">Address</Label>
                      <Input
                        id="edit-client-address"
                        placeholder="Business address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-contract-value">Contract Value</Label>
                      <Input
                        id="edit-contract-value"
                        type="number"
                        placeholder="Annual contract value"
                        value={formData.contractValue}
                        onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-contract-start">Contract Start Date</Label>
                      <Input
                        id="edit-contract-start"
                        type="date"
                        value={formData.contractStart}
                        onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-contract-end">Contract End Date</Label>
                      <Input
                        id="edit-contract-end"
                        type="date"
                        value={formData.contractEnd}
                        onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-client-status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="renewal-pending">Renewal Pending</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-client-rating">Rating</Label>
                      <Input
                        id="edit-client-rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="Rating (0-5)"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-services">Services (comma-separated)</Label>
                    <Textarea
                      id="edit-services"
                      placeholder="Staff Management, Training, Recruitment"
                      rows={2}
                      value={formData.services}
                      onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-client-notes">Notes</Label>
                    <Textarea
                      id="edit-client-notes"
                      placeholder="Additional notes about the client"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-last-contact">Last Contact Date</Label>
                    <Input
                      id="edit-last-contact"
                      type="date"
                      value={formData.lastContact}
                      onChange={(e) => setFormData({ ...formData, lastContact: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Update Client
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold">{totalClients}</p>
                </div>
                <Building className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold">{activeClients}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Rating</p>
                  <p className="text-2xl font-bold">{avgRating}</p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="renewal-pending">Renewal Pending</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
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
                    setStatusFilter("all")
                    setTypeFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Clients ({filteredClients.length})</CardTitle>
            <CardDescription>Manage your client relationships and contracts</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading clients...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Outlets</TableHead>
                    <TableHead>Contract Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={`/placeholder-company.jpg`} />
                            <AvatarFallback>
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {client.address.split(",").slice(-2).join(",")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(client.type)}
                          <span className="capitalize">{client.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.contactPerson}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {client.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{client.outlets}</div>
                          <div className="text-sm text-gray-500">{client.employees} employees</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${client.contractValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          {client.contractStart} - {client.contractEnd}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>
                        {client.rating ? (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{client.rating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{client.lastContact || "-"}</div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(client)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Client
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="w-4 h-4 mr-2" />
                              Call Client
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Building className="w-4 h-4 mr-2" />
                              View Outlets
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(client.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Client
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!loading && filteredClients.length === 0 && (
              <div className="text-center py-8 text-gray-500">No clients found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
