"use client"

import { useState } from "react"
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
import {
  LogOut,
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
} from "lucide-react"

export default function OutletsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const outlets = [
    {
      id: 1,
      name: "Grand Plaza Hotel",
      type: "hotel",
      address: "123 Main St, New York, NY 10001",
      phone: "+1 (555) 123-4567",
      email: "info@grandplaza.com",
      manager: "Sarah Johnson",
      employees: 45,
      rating: 4.8,
      status: "active",
      description: "Luxury hotel in the heart of Manhattan",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "Bella Vista Restaurant",
      type: "restaurant",
      address: "456 Oak Ave, Los Angeles, CA 90210",
      phone: "+1 (555) 234-5678",
      email: "contact@bellavista.com",
      manager: "Michael Chen",
      employees: 28,
      rating: 4.6,
      status: "active",
      description: "Fine dining Italian restaurant with ocean views",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "The Rooftop Lounge",
      type: "bar",
      address: "789 Pine St, Miami, FL 33101",
      phone: "+1 (555) 345-6789",
      email: "hello@rooftopmiami.com",
      manager: "Emily Rodriguez",
      employees: 15,
      rating: 4.7,
      status: "active",
      description: "Trendy rooftop bar with craft cocktails",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      name: "Seaside Resort",
      type: "hotel",
      address: "321 Beach Blvd, San Diego, CA 92101",
      phone: "+1 (555) 456-7890",
      email: "reservations@seasideresort.com",
      manager: "David Thompson",
      employees: 67,
      rating: 4.5,
      status: "maintenance",
      description: "Beachfront resort with spa and conference facilities",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      name: "Urban Bistro",
      type: "restaurant",
      address: "654 Market St, San Francisco, CA 94102",
      phone: "+1 (555) 567-8901",
      email: "info@urbanbistro.com",
      manager: "Lisa Wang",
      employees: 22,
      rating: 4.4,
      status: "active",
      description: "Modern American cuisine in downtown SF",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const getTypeIcon = (type: string) => {
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

  const getStatusBadge = (status: string) => {
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

  const filteredOutlets = outlets.filter((outlet) => {
    const matchesSearch =
      searchQuery === "" ||
      outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet.manager.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || outlet.type === typeFilter
    return matchesSearch && matchesType
  })

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
              <Link href="/admin/outlets" className="text-green-600 font-medium">
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
              <Link href="/admin/client" className="text-gray-600 hover:text-gray-900">
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
          <h1 className="text-2xl font-bold text-gray-900">Outlets Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add New Outlet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Outlet</DialogTitle>
                <DialogDescription>Enter the details for the new outlet</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="outlet-name">Outlet Name</Label>
                    <Input id="outlet-name" placeholder="Enter outlet name" />
                  </div>
                  <div>
                    <Label htmlFor="outlet-type">Type</Label>
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
                <div>
                  <Label htmlFor="outlet-address">Address</Label>
                  <Input id="outlet-address" placeholder="Enter full address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="outlet-phone">Phone</Label>
                    <Input id="outlet-phone" placeholder="Phone number" />
                  </div>
                  <div>
                    <Label htmlFor="outlet-email">Email</Label>
                    <Input id="outlet-email" type="email" placeholder="Email address" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="outlet-manager">Manager</Label>
                  <Input id="outlet-manager" placeholder="Manager name" />
                </div>
                <div>
                  <Label htmlFor="outlet-description">Description</Label>
                  <Textarea id="outlet-description" placeholder="Brief description of the outlet" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">Add Outlet</Button>
                </div>
              </div>
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
                <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/90 rounded px-2 py-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{outlet.rating}</span>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(outlet.type)}
                    <CardTitle className="text-lg">{outlet.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{outlet.description}</CardDescription>
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

        {filteredOutlets.length === 0 && (
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
