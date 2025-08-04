"use client"

import { useState } from "react"
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
} from "lucide-react"

export default function ClientPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const clients = [
    {
      id: 1,
      name: "Grand Plaza Hotel Group",
      type: "hotel",
      contactPerson: "Sarah Johnson",
      email: "sarah@grandplaza.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY 10001",
      outlets: 3,
      employees: 150,
      contractValue: 250000,
      contractStart: "2024-01-01",
      contractEnd: "2024-12-31",
      status: "active",
      rating: 4.8,
      services: ["Staff Management", "Training", "Recruitment"],
      notes: "Premium client with multiple locations",
      lastContact: "2024-01-20",
    },
    {
      id: 2,
      name: "Bella Vista Restaurant Chain",
      type: "restaurant",
      contactPerson: "Michael Chen",
      email: "michael@bellavista.com",
      phone: "+1 (555) 234-5678",
      address: "456 Oak Ave, Los Angeles, CA 90210",
      outlets: 5,
      employees: 200,
      contractValue: 180000,
      contractStart: "2024-02-01",
      contractEnd: "2025-01-31",
      status: "active",
      rating: 4.6,
      services: ["Kitchen Management", "Staff Training", "Menu Consulting"],
      notes: "Growing chain with expansion plans",
      lastContact: "2024-01-18",
    },
    {
      id: 3,
      name: "Urban Nightlife Group",
      type: "bar",
      contactPerson: "Emily Rodriguez",
      email: "emily@urbannightlife.com",
      phone: "+1 (555) 345-6789",
      address: "789 Pine St, Miami, FL 33101",
      outlets: 4,
      employees: 80,
      contractValue: 120000,
      contractStart: "2024-01-15",
      contractEnd: "2024-07-15",
      status: "active",
      rating: 4.7,
      services: ["Bar Management", "Mixology Training", "Event Planning"],
      notes: "Trendy bar group focusing on craft cocktails",
      lastContact: "2024-01-19",
    },
    {
      id: 4,
      name: "Seaside Resort & Spa",
      type: "hotel",
      contactPerson: "David Thompson",
      email: "david@seasideresort.com",
      phone: "+1 (555) 456-7890",
      address: "321 Beach Blvd, San Diego, CA 92101",
      outlets: 1,
      employees: 120,
      contractValue: 200000,
      contractStart: "2023-06-01",
      contractEnd: "2024-05-31",
      status: "renewal-pending",
      rating: 4.5,
      services: ["Full Service Management", "Spa Operations", "Event Coordination"],
      notes: "Contract up for renewal, negotiations in progress",
      lastContact: "2024-01-15",
    },
    {
      id: 5,
      name: "Downtown Bistro",
      type: "restaurant",
      contactPerson: "Lisa Wang",
      email: "lisa@downtownbistro.com",
      phone: "+1 (555) 567-8901",
      address: "654 Market St, San Francisco, CA 94102",
      outlets: 1,
      employees: 35,
      contractValue: 60000,
      contractStart: "2024-03-01",
      contractEnd: "2024-08-31",
      status: "trial",
      rating: 4.2,
      services: ["Staff Training", "Operations Consulting"],
      notes: "New client on trial period",
      lastContact: "2024-01-21",
    },
    {
      id: 6,
      name: "Metropolitan Hotels",
      type: "hotel",
      contactPerson: "Robert Kim",
      email: "robert@metrohotels.com",
      phone: "+1 (555) 678-9012",
      address: "987 Business Ave, Chicago, IL 60601",
      outlets: 2,
      employees: 90,
      contractValue: 150000,
      contractStart: "2023-12-01",
      contractEnd: "2023-11-30",
      status: "expired",
      rating: 4.1,
      services: ["Management Consulting", "Staff Development"],
      notes: "Contract expired, follow-up needed",
      lastContact: "2024-01-10",
    },
  ]

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
    const matchesStatus = statusFilter === "all" || client.status === statusFilter
    const matchesType = typeFilter === "all" || client.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === "active").length
  const totalRevenue = clients.reduce((sum, c) => sum + c.contractValue, 0)
  const avgRating = (clients.reduce((sum, c) => sum + c.rating, 0) / clients.length).toFixed(1)

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input id="client-name" placeholder="Enter client name" />
                  </div>
                  <div>
                    <Label htmlFor="client-type">Business Type</Label>
                    <Select>
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
                    <Input id="contact-person" placeholder="Primary contact name" />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input id="contact-email" type="email" placeholder="Contact email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-phone">Phone</Label>
                    <Input id="contact-phone" placeholder="Phone number" />
                  </div>
                  <div>
                    <Label htmlFor="outlets-count">Number of Outlets</Label>
                    <Input id="outlets-count" type="number" placeholder="Number of outlets" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="client-address">Address</Label>
                  <Input id="client-address" placeholder="Business address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contract-value">Contract Value</Label>
                    <Input id="contract-value" type="number" placeholder="Annual contract value" />
                  </div>
                  <div>
                    <Label htmlFor="contract-start">Contract Start Date</Label>
                    <Input id="contract-start" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="services">Services</Label>
                  <Textarea id="services" placeholder="List of services provided" rows={2} />
                </div>
                <div>
                  <Label htmlFor="client-notes">Notes</Label>
                  <Textarea id="client-notes" placeholder="Additional notes about the client" rows={3} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">Add Client</Button>
                </div>
              </div>
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
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{client.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{client.lastContact}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
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
                          <DropdownMenuItem className="text-red-600">
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

            {filteredClients.length === 0 && (
              <div className="text-center py-8 text-gray-500">No clients found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
