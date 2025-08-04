"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LogOut,
  Plus,
  Copy,
  Eye,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  Download,
  Share,
  Trash2,
  Edit,
  BarChart3,
} from "lucide-react"

export default function CVLinksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const cvLinks = [
    {
      id: 1,
      candidateName: "Sarah Johnson",
      position: "Hotel Manager",
      linkId: "cv-sarah-johnson-2024",
      shortUrl: "https://uhs.link/cv-sarah-j",
      fullUrl: "https://urbanhospitality.com/cv/sarah-johnson-hotel-manager-2024",
      createdDate: "2024-01-15",
      expiryDate: "2024-02-15",
      views: 23,
      downloads: 8,
      status: "active",
      lastViewed: "2024-01-20",
      sharedWith: ["Grand Plaza Hotel", "Seaside Resort"],
    },
    {
      id: 2,
      candidateName: "Michael Chen",
      position: "Head Chef",
      linkId: "cv-michael-chen-2024",
      shortUrl: "https://uhs.link/cv-michael-c",
      fullUrl: "https://urbanhospitality.com/cv/michael-chen-head-chef-2024",
      createdDate: "2024-01-14",
      expiryDate: "2024-02-14",
      views: 45,
      downloads: 12,
      status: "active",
      lastViewed: "2024-01-21",
      sharedWith: ["Bella Vista Restaurant", "Urban Bistro"],
    },
    {
      id: 3,
      candidateName: "Emily Rodriguez",
      position: "Bartender",
      linkId: "cv-emily-rodriguez-2024",
      shortUrl: "https://uhs.link/cv-emily-r",
      fullUrl: "https://urbanhospitality.com/cv/emily-rodriguez-bartender-2024",
      createdDate: "2024-01-13",
      expiryDate: "2024-01-13",
      views: 15,
      downloads: 3,
      status: "expired",
      lastViewed: "2024-01-18",
      sharedWith: ["The Rooftop Lounge"],
    },
    {
      id: 4,
      candidateName: "David Thompson",
      position: "Front Desk Associate",
      linkId: "cv-david-thompson-2024",
      shortUrl: "https://uhs.link/cv-david-t",
      fullUrl: "https://urbanhospitality.com/cv/david-thompson-front-desk-2024",
      createdDate: "2024-01-12",
      expiryDate: "2024-02-12",
      views: 8,
      downloads: 2,
      status: "paused",
      lastViewed: "2024-01-19",
      sharedWith: ["Grand Plaza Hotel"],
    },
    {
      id: 5,
      candidateName: "Lisa Wang",
      position: "Server",
      linkId: "cv-lisa-wang-2024",
      shortUrl: "https://uhs.link/cv-lisa-w",
      fullUrl: "https://urbanhospitality.com/cv/lisa-wang-server-2024",
      createdDate: "2024-01-11",
      expiryDate: "2024-02-11",
      views: 31,
      downloads: 7,
      status: "active",
      lastViewed: "2024-01-21",
      sharedWith: ["Bella Vista Restaurant", "Urban Bistro", "Seaside Resort"],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredLinks = cvLinks.filter((link) => {
    const matchesSearch =
      searchQuery === "" ||
      link.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.linkId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || link.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Link copied to clipboard!")
  }

  const totalViews = cvLinks.reduce((sum, link) => sum + link.views, 0)
  const totalDownloads = cvLinks.reduce((sum, link) => sum + link.downloads, 0)
  const activeLinks = cvLinks.filter((link) => link.status === "active").length

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
              <Link href="/admin/cv-links" className="text-green-600 font-medium">
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
          <h1 className="text-2xl font-bold text-gray-900">Active CV Links</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create CV Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New CV Link</DialogTitle>
                <DialogDescription>Generate a shareable link for a candidate's CV</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="candidate-select">Select Candidate</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah-johnson">Sarah Johnson - Hotel Manager</SelectItem>
                      <SelectItem value="michael-chen">Michael Chen - Head Chef</SelectItem>
                      <SelectItem value="emily-rodriguez">Emily Rodriguez - Bartender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="link-id">Link ID</Label>
                    <Input id="link-id" placeholder="cv-candidate-name-2024" />
                  </div>
                  <div>
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input id="expiry-date" type="date" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="share-with">Share With (Optional)</Label>
                  <Input id="share-with" placeholder="Enter outlet names or email addresses" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">Create Link</Button>
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
                  <p className="text-sm text-gray-600">Active Links</p>
                  <p className="text-2xl font-bold">{activeLinks}</p>
                </div>
                <ExternalLink className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold">{totalDownloads}</p>
                </div>
                <Download className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Views</p>
                  <p className="text-2xl font-bold">{Math.round(totalViews / cvLinks.length)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
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
                  placeholder="Search CV links..."
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
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Links Table */}
        <Card>
          <CardHeader>
            <CardTitle>CV Links ({filteredLinks.length})</CardTitle>
            <CardDescription>Manage shareable CV links for candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Shared With</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={`/placeholder-user.jpg`} />
                          <AvatarFallback>
                            {link.candidateName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{link.candidateName}</div>
                          <div className="text-sm text-gray-500">{link.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{link.shortUrl}</code>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(link.shortUrl)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500">ID: {link.linkId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(link.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span>{link.views}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4 text-gray-400" />
                        <span>{link.downloads}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {link.expiryDate}
                        {link.status === "expired" && <div className="text-xs text-red-600">Expired</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {link.sharedWith.length > 0 ? (
                          <div>
                            <div>{link.sharedWith[0]}</div>
                            {link.sharedWith.length > 1 && (
                              <div className="text-xs text-gray-500">+{link.sharedWith.length - 1} more</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not shared</span>
                        )}
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
                          <DropdownMenuItem onClick={() => copyToClipboard(link.shortUrl)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="w-4 h-4 mr-2" />
                            Extend Expiry
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

            {filteredLinks.length === 0 && (
              <div className="text-center py-8 text-gray-500">No CV links found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
