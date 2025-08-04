"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  LogOut,
  MoreHorizontal,
  Eye,
  Phone,
  Mail,
  Download,
  Calendar,
  Edit,
  Trash2,
  Filter,
  Search,
  Plus,
} from "lucide-react"

export default function ViewApplicantsPage() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")

  const candidates = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Hotel Manager",
      status: "recently-applied",
      email: "sarah.j@email.com",
      phone: "+1 (555) 123-4567",
      experience: "5 years",
      location: "New York, NY",
      appliedDate: "2024-01-15",
      salary: "$65,000",
      source: "Website",
      rating: 4.5,
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Head Chef",
      status: "suggested",
      email: "michael.c@email.com",
      phone: "+1 (555) 234-5678",
      experience: "8 years",
      location: "Los Angeles, CA",
      appliedDate: "2024-01-14",
      salary: "$75,000",
      source: "Referral",
      rating: 4.8,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Bartender",
      status: "backed-out",
      email: "emily.r@email.com",
      phone: "+1 (555) 345-6789",
      experience: "3 years",
      location: "Miami, FL",
      appliedDate: "2024-01-13",
      salary: "$45,000",
      source: "Job Board",
      rating: 4.2,
    },
    {
      id: 4,
      name: "David Thompson",
      position: "Front Desk Associate",
      status: "recently-applied",
      email: "david.t@email.com",
      phone: "+1 (555) 456-7890",
      experience: "2 years",
      location: "Chicago, IL",
      appliedDate: "2024-01-12",
      salary: "$40,000",
      source: "Social Media",
      rating: 4.0,
    },
    {
      id: 5,
      name: "Lisa Wang",
      position: "Server",
      status: "interview-scheduled",
      email: "lisa.w@email.com",
      phone: "+1 (555) 567-8901",
      experience: "4 years",
      location: "San Francisco, CA",
      appliedDate: "2024-01-11",
      salary: "$35,000",
      source: "Website",
      rating: 4.3,
    },
    {
      id: 6,
      name: "James Wilson",
      position: "Sous Chef",
      status: "hired",
      email: "james.w@email.com",
      phone: "+1 (555) 678-9012",
      experience: "6 years",
      location: "Seattle, WA",
      appliedDate: "2024-01-10",
      salary: "$55,000",
      source: "Referral",
      rating: 4.7,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "recently-applied":
        return <Badge className="bg-green-100 text-green-800">Recently Applied</Badge>
      case "suggested":
        return <Badge className="bg-blue-100 text-blue-800">Suggested</Badge>
      case "backed-out":
        return <Badge className="bg-red-100 text-red-800">Backed Out</Badge>
      case "interview-scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">Interview Scheduled</Badge>
      case "hired":
        return <Badge className="bg-purple-100 text-purple-800">Hired</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesPosition = positionFilter === "all" || candidate.position === positionFilter
    const matchesSearch =
      searchQuery === "" ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesPosition && matchesSearch
  })

  const handleSelectCandidate = (candidateId: number) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId],
    )
  }

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(filteredCandidates.map((c) => c.id))
    }
  }

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
              <Link href="/admin/applicants" className="text-green-600 font-medium">
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
          <h1 className="text-2xl font-bold text-gray-900">View Applicants</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link href="/admin/add-candidate">
              <Button className="bg-green-600 hover:bg-green-700" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="recently-applied">Recently Applied</SelectItem>
                    <SelectItem value="suggested">Suggested</SelectItem>
                    <SelectItem value="backed-out">Backed Out</SelectItem>
                    <SelectItem value="interview-scheduled">Interview Scheduled</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    <SelectItem value="Hotel Manager">Hotel Manager</SelectItem>
                    <SelectItem value="Head Chef">Head Chef</SelectItem>
                    <SelectItem value="Bartender">Bartender</SelectItem>
                    <SelectItem value="Front Desk Associate">Front Desk Associate</SelectItem>
                    <SelectItem value="Server">Server</SelectItem>
                    <SelectItem value="Sous Chef">Sous Chef</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all")
                    setPositionFilter("all")
                    setSearchQuery("")
                  }}
                >
                  Clear Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedCandidates.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{selectedCandidates.length} candidate(s) selected</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button variant="outline" size="sm">
                    Change Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Candidates ({filteredCandidates.length})</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCandidates.length === filteredCandidates.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Expected Salary</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => handleSelectCandidate(candidate.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`/placeholder-user.jpg`} />
                          <AvatarFallback>
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {candidate.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                    <TableCell>{candidate.experience}</TableCell>
                    <TableCell>{candidate.location}</TableCell>
                    <TableCell>{candidate.appliedDate}</TableCell>
                    <TableCell>{candidate.salary}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 text-sm">{candidate.rating}</span>
                      </div>
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
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download Resume
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

            {filteredCandidates.length === 0 && (
              <div className="text-center py-8 text-gray-500">No candidates found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
