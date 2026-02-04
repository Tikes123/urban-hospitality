"use client"

import { useState, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface CVLink {
  id: number
  candidateId: number
  candidateName: string
  position: string
  linkId: string
  shortUrl: string
  fullUrl: string
  createdDate: string
  expiryDate: string
  views: number
  downloads: number
  status: string
  lastViewed: string | null
  sharedWith: string[]
}

interface Candidate {
  id: number
  name: string
  position: string
}

export default function CVLinksPage() {
  const [cvLinks, setCvLinks] = useState<CVLink[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    candidateId: "",
    linkId: "",
    expiryDate: "",
    sharedWith: "",
  })

  useEffect(() => {
    fetchCvLinks()
    fetchCandidates()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCvLinks()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter])

  const fetchCvLinks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/cv-links?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch CV links")
      const data = await response.json()
      setCvLinks(data)
    } catch (error) {
      console.error("Error fetching CV links:", error)
      toast.error("Failed to load CV links")
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await fetch("/api/candidates")
      if (!response.ok) throw new Error("Failed to fetch candidates")
      const data = await response.json()
      setCandidates(data)
    } catch (error) {
      console.error("Error fetching candidates:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const selectedCandidate = candidates.find((c) => c.id === parseInt(formData.candidateId))
      if (!selectedCandidate) {
        toast.error("Please select a candidate")
        return
      }

      const linkId = formData.linkId || `cv-${selectedCandidate.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().getFullYear()}`
      const shortUrl = `https://uhs.link/${linkId}`
      const fullUrl = `https://urbanhospitality.com/cv/${linkId}`

      const cvLinkData = {
        candidateId: parseInt(formData.candidateId),
        candidateName: selectedCandidate.name,
        position: selectedCandidate.position,
        linkId,
        shortUrl,
        fullUrl,
        expiryDate: formData.expiryDate,
        sharedWith: formData.sharedWith.split(",").map((s) => s.trim()).filter(Boolean),
      }

      const response = await fetch("/api/cv-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cvLinkData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create CV link")
      }

      toast.success("CV link created successfully")
      setIsCreateDialogOpen(false)
      resetForm()
      fetchCvLinks()
    } catch (error: any) {
      console.error("Error creating CV link:", error)
      toast.error(error.message || "Failed to create CV link")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this CV link?")) return

    try {
      const response = await fetch(`/api/cv-links/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete CV link")

      toast.success("CV link deleted successfully")
      fetchCvLinks()
    } catch (error) {
      console.error("Error deleting CV link:", error)
      toast.error("Failed to delete CV link")
    }
  }

  const resetForm = () => {
    setFormData({
      candidateId: "",
      linkId: "",
      expiryDate: "",
      sharedWith: "",
    })
  }

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
    toast.success("Link copied to clipboard!")
  }

  const totalViews = cvLinks.reduce((sum, link) => sum + link.views, 0)
  const totalDownloads = cvLinks.reduce((sum, link) => sum + link.downloads, 0)
  const activeLinks = cvLinks.filter((link) => link.status === "active").length
  const avgViews = cvLinks.length > 0 ? Math.round(totalViews / cvLinks.length) : 0

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
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) resetForm()
          }}>
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
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="candidate-select">Select Candidate</Label>
                    <Select value={formData.candidateId} onValueChange={(value) => setFormData({ ...formData, candidateId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a candidate" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id.toString()}>
                            {candidate.name} - {candidate.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="link-id">Link ID (optional)</Label>
                      <Input
                        id="link-id"
                        placeholder="cv-candidate-name-2024"
                        value={formData.linkId}
                        onChange={(e) => setFormData({ ...formData, linkId: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input
                        id="expiry-date"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="share-with">Share With (Optional, comma-separated)</Label>
                    <Input
                      id="share-with"
                      placeholder="Grand Plaza Hotel, Seaside Resort"
                      value={formData.sharedWith}
                      onChange={(e) => setFormData({ ...formData, sharedWith: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsCreateDialogOpen(false)
                      resetForm()
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">Create Link</Button>
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
                  <p className="text-2xl font-bold">{avgViews}</p>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading CV links...</span>
              </div>
            ) : (
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
                          {link.sharedWith && link.sharedWith.length > 0 ? (
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
                            <DropdownMenuItem onClick={() => window.open(link.fullUrl, "_blank")}>
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
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(link.id)}>
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

            {!loading && filteredLinks.length === 0 && (
              <div className="text-center py-8 text-gray-500">No CV links found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
