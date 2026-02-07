"use client"

import { useState, useEffect } from "react"
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
import { AdminHeader } from "@/components/admin/admin-header"
import {
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
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"

export default function DesignationPage() {
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDesignation, setEditingDesignation] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    department: "",
    level: "",
    minSalary: "",
    maxSalary: "",
    openPositions: "",
    totalEmployees: "",
    description: "",
    requirements: "",
    responsibilities: "",
    skills: "",
    status: "active",
  })

  useEffect(() => {
    setPage(1)
  }, [searchQuery, categoryFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchDesignations(), searchQuery ? 300 : 0)
    return () => clearTimeout(t)
  }, [page, limit, searchQuery, categoryFilter])

  const fetchDesignations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (searchQuery) params.append("search", searchQuery)
      params.append("page", String(page))
      params.append("limit", String(limit))
      const response = await fetch(`/api/designations?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch designations")
      const json = await response.json()
      setDesignations(json.data ?? [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 1)
    } catch (error) {
      console.error("Error fetching designations:", error)
      toast.error("Failed to load designations")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const designationData = {
        ...formData,
        minSalary: parseFloat(formData.minSalary),
        maxSalary: parseFloat(formData.maxSalary),
        openPositions: parseInt(formData.openPositions) || 0,
        totalEmployees: parseInt(formData.totalEmployees) || 0,
        requirements: formData.requirements.split("\n").filter(Boolean),
        responsibilities: formData.responsibilities.split("\n").filter(Boolean),
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      }

      const url = editingDesignation ? `/api/designations/${editingDesignation.id}` : "/api/designations"
      const method = editingDesignation ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designationData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save designation")
      }

      toast.success(editingDesignation ? "Designation updated successfully" : "Designation created successfully")
      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setEditingDesignation(null)
      resetForm()
      fetchDesignations()
    } catch (error) {
      console.error("Error saving designation:", error)
      toast.error(error.message || "Failed to save designation")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this designation?")) return

    try {
      const response = await fetch(`/api/designations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete designation")

      toast.success("Designation deleted successfully")
      fetchDesignations()
    } catch (error) {
      console.error("Error deleting designation:", error)
      toast.error("Failed to delete designation")
    }
  }

  const handleEdit = (designation) => {
    setEditingDesignation(designation)
    setFormData({
      title: designation.title,
      category: designation.category,
      department: designation.department,
      level: designation.level,
      minSalary: designation.minSalary.toString(),
      maxSalary: designation.maxSalary.toString(),
      openPositions: designation.openPositions.toString(),
      totalEmployees: designation.totalEmployees.toString(),
      description: designation.description,
      requirements: designation.requirements.join("\n"),
      responsibilities: designation.responsibilities.join("\n"),
      skills: designation.skills.join(", "),
      status: designation.status,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      department: "",
      level: "",
      minSalary: "",
      maxSalary: "",
      openPositions: "",
      totalEmployees: "",
      description: "",
      requirements: "",
      responsibilities: "",
      skills: "",
      status: "active",
    })
    setEditingDesignation(null)
  }

  const getCategoryIcon = (category) => {
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

  const getLevelBadge = (level) => {
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

  const getStatusBadge = (status) => {
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

  const filteredDesignations = designations

  const totalPositions = designations.reduce((sum, d) => sum + d.openPositions, 0)
  const totalEmployees = designations.reduce((sum, d) => sum + d.totalEmployees, 0)
  const avgSalary =
    designations.length > 0
      ? Math.round(designations.reduce((sum, d) => sum + (d.minSalary + d.maxSalary) / 2, 0) / designations.length)
      : 0

  const renderForm = (isEdit = false) => (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${isEdit ? "edit-" : ""}designation-title`}>Job Title</Label>
            <Input
              id={`${isEdit ? "edit-" : ""}designation-title`}
              placeholder="Enter job title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${isEdit ? "edit-" : ""}designation-category`}>Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
            <Label htmlFor={`${isEdit ? "edit-" : ""}designation-department`}>Department</Label>
            <Input
              id={`${isEdit ? "edit-" : ""}designation-department`}
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${isEdit ? "edit-" : ""}designation-level`}>Level</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
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
            <Label htmlFor={`${isEdit ? "edit-" : ""}designation-positions`}>Open Positions</Label>
            <Input
              id={`${isEdit ? "edit-" : ""}designation-positions`}
              type="number"
              placeholder="Number of positions"
              value={formData.openPositions}
              onChange={(e) => setFormData({ ...formData, openPositions: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor={`${isEdit ? "edit-" : ""}designation-min-salary`}>Minimum Salary</Label>
            <Input
              id={`${isEdit ? "edit-" : ""}designation-min-salary`}
              type="number"
              placeholder="Minimum salary"
              value={formData.minSalary}
              onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${isEdit ? "edit-" : ""}designation-max-salary`}>Maximum Salary</Label>
            <Input
              id={`${isEdit ? "edit-" : ""}designation-max-salary`}
              type="number"
              placeholder="Maximum salary"
              value={formData.maxSalary}
              onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor={`${isEdit ? "edit-" : ""}designation-total-employees`}>Total Employees</Label>
            <Input
              id={`${isEdit ? "edit-" : ""}designation-total-employees`}
              type="number"
              placeholder="Total employees"
              value={formData.totalEmployees}
              onChange={(e) => setFormData({ ...formData, totalEmployees: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor={`${isEdit ? "edit-" : ""}designation-status`}>Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${isEdit ? "edit-" : ""}designation-description`}>Description</Label>
          <Textarea
            id={`${isEdit ? "edit-" : ""}designation-description`}
            placeholder="Job description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${isEdit ? "edit-" : ""}designation-requirements`}>Requirements (one per line)</Label>
          <Textarea
            id={`${isEdit ? "edit-" : ""}designation-requirements`}
            placeholder="Bachelor's degree&#10;5+ years experience&#10;Leadership skills"
            rows={3}
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${isEdit ? "edit-" : ""}designation-responsibilities`}>Responsibilities (one per line)</Label>
          <Textarea
            id={`${isEdit ? "edit-" : ""}designation-responsibilities`}
            placeholder="Manage hotel operations&#10;Supervise staff&#10;Handle guest complaints"
            rows={3}
            value={formData.responsibilities}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${isEdit ? "edit-" : ""}designation-skills`}>Required Skills (comma separated)</Label>
          <Textarea
            id={`${isEdit ? "edit-" : ""}designation-skills`}
            placeholder="Leadership, Communication, Problem-solving"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (isEdit) {
                setIsEditDialogOpen(false)
              } else {
                setIsAddDialogOpen(false)
              }
              resetForm()
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            {isEdit ? "Update" : "Add"} Designation
          </Button>
        </div>
      </div>
    </form>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Designation Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Designation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Designation</DialogTitle>
                <DialogDescription>Create a new job position/designation</DialogDescription>
              </DialogHeader>
              {renderForm(false)}
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Designation</DialogTitle>
                <DialogDescription>Update designation information</DialogDescription>
              </DialogHeader>
              {renderForm(true)}
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
            <CardTitle>Designations ({total})</CardTitle>
            <CardDescription>Manage job positions and roles</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading designations...</span>
              </div>
            ) : (
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
                            <DropdownMenuItem onClick={() => handleEdit(designation)}>
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
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(designation.id)}>
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
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
            />

            {!loading && filteredDesignations.length === 0 && (
              <div className="text-center py-8 text-gray-500">No designations found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
