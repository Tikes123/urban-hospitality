"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, MoreHorizontal, Eye, Phone, Mail } from "lucide-react"

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionSearch, setPositionSearch] = useState("")

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
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesPosition =
      positionSearch === "" || candidate.position.toLowerCase().includes(positionSearch.toLowerCase())
    return matchesStatus && matchesPosition
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
              <Link href="/admin" className="text-green-600 font-medium">
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

      {/* Main Content */}
      <main className="p-6">
        {/* Welcome Section */}
        <div className="bg-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Hello, <span className="text-green-600">Trainee!</span> Welcome to the UHS Applicant Tracking System.
          </h2>
          <p className="text-gray-600">Schedule, track, and manage all your candidates here.</p>
        </div>

        {/* Candidate List Section */}
        <Card>
          <CardHeader className="bg-blue-500 text-white">
            <CardTitle className="text-xl">Recently Applied, Suggested and Backed-Out Candidate List!</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Filters */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Critical Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Critical Statuses</SelectItem>
                    <SelectItem value="recently-applied">Recently Applied</SelectItem>
                    <SelectItem value="suggested">Suggested</SelectItem>
                    <SelectItem value="backed-out">Backed Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Position:</label>
                <Input
                  placeholder="Type to search positions..."
                  value={positionSearch}
                  onChange={(e) => setPositionSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Button className="bg-green-600 hover:bg-green-700">Apply Filter</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all")
                  setPositionSearch("")
                }}
              >
                Clear All
              </Button>
            </div>

            {/* Candidates Grid */}
            <div className="grid gap-4">
              {filteredCandidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`/placeholder-user.jpg`} />
                          <AvatarFallback>
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{candidate.name}</h3>
                          <p className="text-gray-600">{candidate.position}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {candidate.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {candidate.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Experience</div>
                          <div className="font-medium">{candidate.experience}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Location</div>
                          <div className="font-medium">{candidate.location}</div>
                        </div>
                        {getStatusBadge(candidate.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-8 text-gray-500">No candidates found matching your filters.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
