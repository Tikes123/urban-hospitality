"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  Users,
  DollarSign,
  TrendingUp,
  Briefcase,
  Hotel,
  UtensilsCrossed,
  Wine,
} from "lucide-react"

export default function DesignationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDesignation, setEditingDesignation] = useState<any>(null)

  const designations = [
    {
      id: 1,
      title: "Hotel Manager",
      category: "hotel",
      department: "Management",
      level: "Senior",
      minSalary: 60000,
      maxSalary: 90000,
      openPositions: 3,
      totalEmployees: 12,
      description: "Oversee daily hotel operations, manage staff, and ensure guest satisfaction",
      requirements: ["Bachelor's degree", "5+ years experience", "Leadership skills", "Customer service"],
      responsibilities: ["Manage hotel operations", "Supervise staff", "Handle guest complaints", "Budget management"],
      skills: ["Leadership", "Communication", "Problem-solving", "Budget management"],
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: 2,
      title: "Head Chef",
      category: "restaurant",
      department: "Kitchen",
      level: "Senior",
      minSalary: 55000,
      maxSalary: 80000,
      openPositions: 2,
      totalEmployees: 8,
      description: "Lead kitchen operations, menu planning, and culinary team management",
      requirements: ["Culinary degree", "8+ years experience", "Food safety certification"],
      responsibilities: ["Menu development", "Kitchen management", "Staff training", "Quality control"],
      skills: ["Culinary expertise", "Leadership", "Creativity", "Time management"],
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: 3,
      title: "Bartender",
      category: "bar",
      department: "Beverage",
      level: "Mid",
      minSalary: 35000,
      maxSalary: 50000,
      openPositions: 5,
      totalEmployees: 15,
      description: "Prepare and serve beverages, interact with customers, maintain bar area",
      requirements: ["High school diploma", "2+ years experience", "Mixology knowledge"],
      responsibilities: ["Prepare cocktails", "Serve customers", "Maintain inventory", "Clean bar area"],
      skills: ["Mixology", "Customer service", "Multitasking", "Product knowledge"],
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: 4,
      title: "Front Desk Associate",
      category: "hotel",
      department: "Front Office",
      level: "Entry",
      minSalary: 30000,
      maxSalary: 40000,
      openPositions: 4,
      totalEmployees: 20,
      description: "Handle guest check-in/out, reservations, and provide customer service",
      requirements: ["High school diploma", "Customer service experience", "Computer skills"],
      responsibilities: ["Guest check-in/out", "Handle reservations", "Answer phone calls", "Process payments"],
      skills: ["Customer service", "Communication", "Computer skills", "Problem-solving"],
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: 5,
      title: "Server",
      category: "restaurant",
      department: "Service",
      level: "Entry",
      minSalary: 25000,
      maxSalary: 35000,
      openPositions: 8,
      totalEmployees: 25,
      description: "Take orders, serve food and beverages, provide excellent customer service",
      requirements: ["High school diploma", "Food service experience preferred"],
      responsibilities: ["Take customer orders", "Serve food and drinks", "Process payments", "Maintain cleanliness"],
      skills: ["Customer service", "Multitasking", "Communication", "Teamwork"],
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: 6,
      title: "Event Coordinator",
      category: "hotel",
      department: "Events",
      level: "Mid",
      minSalary: 45000,
      maxSalary: 65000,
      openPositions: 1,
      totalEmployees: 3,
      description: "Plan and coordinate events, weddings, and conferences",
      requirements: ["Bachelor's degree", "Event planning experience", "Project management skills"],
      responsibilities: ["Plan events", "Coordinate vendors", "Manage budgets", "Client communication"],
      skills: ["Event planning", "Project management", "Communication", "Organization"],
      status: "paused",
      createdDate: "2024-01-01",
    },
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hotel":
        return <Hotel className="w-4 h-4" />
      case "restaurant":
        return <UtensilsCrossed className="w-4 h-4" />
      case "bar":
        return <Wine className="w-4 h-4" />
      default:
        return <Briefcase className="w-4 h-4" />
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "Entry":
        return <Badge className="bg-green-100 text-green-800">Entry Level</Badge>
      case "Mid":
        return <Badge className="bg-blue-100 text-blue-800">Mid Level</Badge>
      case "Senior":
        return <Badge className="bg-purple-100 text-purple-800">Senior Level</Badge>
      default:
        return <Badge variant="secondary">{level}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredDesignations = designations.filter((designation) => {
    const matchesSearch =
      searchQuery === "" ||
      designation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      designation.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || designation.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPositions = designations.reduce((sum, d) => sum + d.openPositions, 0)
  const totalEmployees = designations.reduce((sum, d) => sum + d.totalEmployees, 0)
  const avgSalary = Math.round(
    designations.reduce((sum, d) => sum + (d.minSalary + d.maxSalary) / 2, 0) / designations.length,
  )

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
              <Link href="/admin/designation" className="text-green-600 font-medium">
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
          <h1 className="text-2xl font-bold text-gray-900">Designation Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Designation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Designation</DialogTitle>
                <DialogDescription>Create a new job position/designation</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="designation-title">Job Title</Label>
                    <Input id="designation-title" placeholder="Enter job title" />
                  </div>
                  <div>
                    <Label htmlFor="designation-category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="designation-department">Department</Label>
                    <Input id="designation-department" placeholder="Department" />
                  </div>
                  <div>
                    <Label htmlFor="designation-level">Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entry">Entry Level</SelectItem>
                        <SelectItem value="Mid">Mid Level</SelectItem>
                        <SelectItem value="Senior">Senior Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="designation-positions">Open Positions</Label>
                    <Input id="designation-positions" type="number" placeholder="Number of positions" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="designation-min-salary">Minimum Salary</Label>
                    <Input id="designation-min-salary" type="number" placeholder="Minimum salary" />
                  </div>
                  <div>
                    <Label htmlFor="designation-max-salary">Maximum Salary</Label>
                    <Input id="designation-max-salary" type="number" placeholder="Maximum salary" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="designation-description">Description</Label>
                  <Textarea id="designation-description" placeholder="Job description" rows={3} />
                </div>
                <div>
                  <Label htmlFor="designation-requirements">Requirements</Label>
                  <Textarea id="designation-requirements" placeholder="Job requirements (one per line)" rows={3} />
                </div>
                <div>
                  <Label htmlFor="designation-responsibilities">Responsibilities</Label>
                  <Textarea
                    id="designation-responsibilities"
                    placeholder="Job responsibilities (one per line)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="designation-skills">Required Skills</Label>
                  <Textarea id="designation-skills" placeholder="Required skills (comma separated)" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">Add Designation</Button>
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
                  <p className="text-sm text-gray-600">Total Designations</p>
                  <p className="text-2xl font-bold">{designations.length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Positions</p>
                  <p className="text-2xl font-bold">{totalPositions}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold">{totalEmployees}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Salary</p>
                  <p className="text-2xl font-bold">${avgSalary.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Search designations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setCategoryFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Designations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Designations ({filteredDesignations.length})</CardTitle>
            <CardDescription>Manage job positions and roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Salary Range</TableHead>
                  <TableHead>Open Positions</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesignations.map((designation) => (
                  <TableRow key={designation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{designation.title}</div>
                        <div className="text-sm text-gray-500">{designation.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(designation.category)}
                        <span className="capitalize">{designation.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getLevelBadge(designation.level)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        ${designation.minSalary.toLocaleString()} - ${designation.maxSalary.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{designation.openPositions}</Badge>
                    </TableCell>
                    <TableCell>{designation.totalEmployees}</TableCell>
                    <TableCell>{getStatusBadge(designation.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingDesignation(designation)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="w-4 h-4 mr-2" />
                            View Employees
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Briefcase className="w-4 h-4 mr-2" />
                            View Applicants
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredDesignations.length === 0 && (
              <div className="text-center py-8 text-gray-500">No designations found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
