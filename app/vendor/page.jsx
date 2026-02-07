"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VendorHeader } from "@/components/vendor/vendor-header"
import {
  MoreHorizontal,
  Eye,
  Phone,
  Mail,
  Download,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  History,
  Users,
  UserCheck,
  BarChart3,
  Link2,
  Copy,
} from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"
import { CANDIDATE_STATUSES, getStatusInfo, getStatusBadgeClass } from "@/lib/statusConfig"

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionSearch, setPositionSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [viewMode, setViewMode] = useState("table")
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [outlets, setOutlets] = useState([])
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleCandidate, setScheduleCandidate] = useState(null)
  const [scheduleSlots, setScheduleSlots] = useState([{ outletId: "", scheduledAt: "", type: "In-person", remarks: "" }])
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyCandidate, setHistoryCandidate] = useState(null)
  const [historySchedules, setHistorySchedules] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const HISTORY_PAGE_SIZE = 10
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [viewDetailsCandidate, setViewDetailsCandidate] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", position: "", status: "", location: "", salary: "" })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [todayStats, setTodayStats] = useState({ candidatesAddedToday: 0, interviewsScheduledToday: 0, hiredToday: 0 })
  const [todayStatsLoading, setTodayStatsLoading] = useState(true)
  const [cvLinks, setCvLinks] = useState([])

  useEffect(() => {
    fetchOutlets()
    fetchCvLinks()
  }, [])

  useEffect(() => {
    fetch("/api/analytics?period=today")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setTodayStats(data))
      .catch(() => {})
      .finally(() => setTodayStatsLoading(false))
  }, [])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, positionSearch])

  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(), positionSearch ? 300 : 0)
    return () => clearTimeout(t)
  }, [page, limit, statusFilter, positionSearch])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (positionSearch) params.append("search", positionSearch)
      params.append("page", String(page))
      params.append("limit", String(limit))
      const res = await fetch(`/api/candidates?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setCandidates(json.data ?? [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 1)
    } catch (e) {
      console.error(e)
      toast.error("Failed to load candidates")
    } finally {
      setLoading(false)
    }
  }

  const fetchOutlets = async () => {
    try {
      const res = await fetch("/api/outlets?limit=200")
      if (!res.ok) return
      const json = await res.json()
      setOutlets(Array.isArray(json) ? json : (json.data ?? []))
    } catch (e) {
      console.error("Failed to fetch outlets", e)
    }
  }

  const fetchCvLinks = async () => {
    try {
      const res = await fetch("/api/cv-links")
      if (!res.ok) return
      const data = await res.json()
      setCvLinks(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("Failed to fetch CV links", e)
    }
  }

  const cvLinkByCandidateId = (id) => cvLinks.find((l) => l.candidateId === id)

  const handleActivateCvLink = async (candidate) => {
    const existing = cvLinkByCandidateId(candidate.id)
    try {
      if (existing) {
        if (existing.status === "active") {
          toast.success("CV link is already active")
          return
        }
        const res = await fetch(`/api/cv-links/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active" }),
        })
        if (!res.ok) throw new Error("Failed to activate")
        toast.success("CV link activated")
      } else {
        const linkId = `cv-${candidate.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`
        const shortUrl = `https://uhs.link/${linkId}`
        const fullUrl = `https://urbanhospitality.com/cv/${linkId}`
        const expiryDate = new Date()
        expiryDate.setFullYear(expiryDate.getFullYear() + 1)
        const res = await fetch("/api/cv-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: candidate.id,
            candidateName: candidate.name,
            position: candidate.position,
            linkId,
            shortUrl,
            fullUrl,
            expiryDate: expiryDate.toISOString().split("T")[0],
            sharedWith: [],
          }),
        })
        if (!res.ok) throw new Error((await res.json()).error || "Failed to create")
        toast.success("CV link created and active")
      }
      fetchCvLinks()
    } catch (e) {
      toast.error(e.message || "Failed to activate CV link")
    }
  }

  const handleDeactivateCvLink = async (candidate) => {
    const existing = cvLinkByCandidateId(candidate.id)
    if (!existing) {
      toast.info("No CV link for this candidate")
      return
    }
    try {
      const res = await fetch(`/api/cv-links/${existing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      })
      if (!res.ok) throw new Error("Failed to deactivate")
      toast.success("CV link deactivated")
      fetchCvLinks()
    } catch (e) {
      toast.error(e.message || "Failed to deactivate CV link")
    }
  }

  const copyCvLink = (url) => {
    navigator.clipboard.writeText(url)
    toast.success("CV link copied")
  }

  const getStatusBadge = (status) => {
    const info = getStatusInfo(status)
    return <Badge className={`border ${getStatusBadgeClass(status)}`}>{info.label}</Badge>
  }

  const formatLastUpdated = (iso) => {
    if (!iso) return "—"
    const d = new Date(iso)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    const isOld = d < sixMonthsAgo
    const str = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    return isOld ? `${str} (outdated)` : str
  }

  const filteredCandidates = candidates

  const handleSelectCandidate = (id) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) setSelectedCandidates([])
    else setSelectedCandidates(filteredCandidates.map((c) => c.id))
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Candidate deleted")
      fetchCandidates()
    } catch (e) {
      toast.error(e.message || "Failed to delete")
    }
  }

  const openScheduleModal = (candidate) => {
    setScheduleCandidate(candidate)
    setScheduleSlots([{ outletId: "", scheduledAt: "", type: "In-person", status: "standby-cv", remarks: "" }])
    setScheduleModalOpen(true)
  }

  const addScheduleSlot = () => {
    setScheduleSlots((prev) => [...prev, { outletId: "", scheduledAt: "", type: "In-person", status: "standby-cv", remarks: "" }])
  }

  const updateScheduleSlot = (index, field, value) => {
    setScheduleSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const removeScheduleSlot = (index) => {
    setScheduleSlots((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    if (!scheduleCandidate) return
    const valid = scheduleSlots.filter((s) => s.outletId && s.scheduledAt)
    if (valid.length === 0) {
      toast.error("Add at least one outlet and date/time")
      return
    }
    setScheduleSubmitting(true)
    try {
      const res = await fetch(`/api/candidates/${scheduleCandidate.id}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slots: valid.map((s) => ({
            outletId: parseInt(s.outletId),
            scheduledAt: new Date(s.scheduledAt).toISOString(),
            type: s.type || null,
            status: s.status || null,
            remarks: s.remarks || null,
          })),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to schedule")
      toast.success("Interview(s) scheduled")
      setScheduleModalOpen(false)
      setScheduleCandidate(null)
      fetchCandidates()
    } catch (err) {
      toast.error(err.message || "Failed to schedule")
    } finally {
      setScheduleSubmitting(false)
    }
  }

  const openHistoryModal = async (candidate) => {
    setHistoryCandidate(candidate)
    setHistoryPage(1)
    setHistoryModalOpen(true)
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/schedules`)
      setHistorySchedules(res.ok ? await res.json() : [])
    } catch {
      setHistorySchedules([])
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editCandidate) return
    setEditSubmitting(true)
    try {
      const res = await fetch(`/api/candidates/${editCandidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      toast.success("Candidate updated")
      setEditModalOpen(false)
      setEditCandidate(null)
      fetchCandidates()
    } catch (err) {
      toast.error(err.message || "Failed to update")
    } finally {
      setEditSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="bg-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Hello, <span className="text-green-600">Trainee!</span> Welcome to the UHS Applicant Tracking System.
          </h2>
          <p className="text-gray-600">Schedule, track, and manage all your candidates here.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Candidates added today</p>
                  <p className="text-2xl font-bold">{todayStatsLoading ? "—" : todayStats.candidatesAddedToday ?? 0}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Interviews scheduled today</p>
                  <p className="text-2xl font-bold">{todayStatsLoading ? "—" : todayStats.interviewsScheduledToday ?? 0}</p>
                </div>
                <Calendar className="h-10 w-10 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hired today</p>
                  <p className="text-2xl font-bold">{todayStatsLoading ? "—" : todayStats.hiredToday ?? 0}</p>
                </div>
                <UserCheck className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mb-6">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/vendor/analytics">
              <BarChart3 className="w-4 h-4" />
              View all analytics
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="bg-blue-500 text-white">
            <CardTitle className="text-xl">Recently Applied, Suggested and Backed-Out Candidate List!</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Critical Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_STATUSES.filter((s) => s.value === "all" || !s.value.startsWith("all")).map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Filter by Position:</Label>
                <Input
                  placeholder="Type to search positions..."
                  value={positionSearch}
                  onChange={(e) => setPositionSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => fetchCandidates()}
              >
                Apply Filter
              </Button>
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

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Candidates ({total})</span>
              <div className="flex gap-2">
                <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>Table</Button>
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>Grid</Button>
              </div>
            </div>
            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {loading ? (
                  <div className="col-span-full flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <Card key={candidate.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarFallback>{candidate.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.position}</div>
                            <div className="text-xs text-gray-400 flex items-center"><Phone className="w-3 h-3 mr-1" />{candidate.phone}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditCandidate(candidate); setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location, salary: candidate.salary || "" }); setEditModalOpen(true) }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={`tel:${candidate.phone}`}><Phone className="w-4 h-4 mr-2" /> Call</a></DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={candidate.email ? `mailto:${candidate.email}` : "#"}><Mail className="w-4 h-4 mr-2" /> Email</a></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openScheduleModal(candidate)}><Calendar className="w-4 h-4 mr-2" /> Schedule Interview</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")} disabled={!candidate.resume}><Download className="w-4 h-4 mr-2" /> Download Resume</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openHistoryModal(candidate)}><History className="w-4 h-4 mr-2" /> History</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActivateCvLink(candidate)}><Link2 className="w-4 h-4 mr-2" /> Activate CV Link</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeactivateCvLink(candidate)}><Link2 className="w-4 h-4 mr-2" /> Deactivate CV Link</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(candidate.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        {getStatusBadge(candidate.status)}
                        <span className="text-xs text-muted-foreground">{candidate.location}</span>
                        <span className="text-xs text-muted-foreground">{candidate.appliedDate}</span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ) : (
            <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={filteredCandidates.length > 0 && selectedCandidates.length === filteredCandidates.length}
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
                  <TableHead>Last Updated</TableHead>
                  <TableHead>CV Link</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                      <span className="ml-2 text-gray-500">Loading candidates...</span>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCandidates.map((candidate) => (
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
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>
                              {candidate.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{candidate.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" /> {candidate.phone}
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
                      <TableCell className="text-sm text-muted-foreground">
                        {formatLastUpdated(candidate.updatedAt)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const link = cvLinkByCandidateId(candidate.id)
                          if (!link) return <span className="text-muted-foreground">—</span>
                          return (
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[120px]" title={link.shortUrl}>{link.shortUrl}</code>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => copyCvLink(link.shortUrl)} title="Copy link"><Copy className="w-3 h-3" /></Button>
                            </div>
                          )
                        })()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setViewDetailsCandidate(candidate)
                                setViewDetailsOpen(true)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditCandidate(candidate)
                                setEditForm({
                                  name: candidate.name,
                                  phone: candidate.phone,
                                  email: candidate.email || "",
                                  position: candidate.position,
                                  status: candidate.status,
                                  location: candidate.location,
                                  salary: candidate.salary || "",
                                })
                                setEditModalOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`tel:${candidate.phone}`}>
                                <Phone className="w-4 h-4 mr-2" /> Call
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={candidate.email ? `mailto:${candidate.email}` : "#"}>
                                <Mail className="w-4 h-4 mr-2" /> Email
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openScheduleModal(candidate)}>
                              <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                candidate.resume &&
                                window.open(
                                  candidate.resume.startsWith("/") ? candidate.resume : candidate.resume,
                                  "_blank"
                                )
                              }
                              disabled={!candidate.resume}
                            >
                              <Download className="w-4 h-4 mr-2" /> Download Resume
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openHistoryModal(candidate)}>
                              <History className="w-4 h-4 mr-2" /> History
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActivateCvLink(candidate)}>
                              <Link2 className="w-4 h-4 mr-2" /> Activate CV Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeactivateCvLink(candidate)}>
                              <Link2 className="w-4 h-4 mr-2" /> Deactivate CV Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(candidate.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
            {!loading && filteredCandidates.length === 0 && (
              <div className="text-center py-8 text-gray-500">No candidates found matching your filters.</div>
            )}
          </CardContent>
        </Card>

        {/* Schedule Interview modal */}
        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                {scheduleCandidate
                  ? `Schedule interview(s) for ${scheduleCandidate.name}. Add multiple outlets and dates.`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4">
              {scheduleSlots.map((slot, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Slot {index + 1}</span>
                    {scheduleSlots.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeScheduleSlot(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Outlet *</Label>
                      <Select value={slot.outletId} onValueChange={(v) => updateScheduleSlot(index, "outletId", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select outlet" />
                        </SelectTrigger>
                        <SelectContent>
                          {outlets.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date & Time *</Label>
                      <Input
                        type="datetime-local"
                        value={slot.scheduledAt}
                        onChange={(e) => updateScheduleSlot(index, "scheduledAt", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Interview type</Label>
                      <Select value={slot.type} onValueChange={(v) => updateScheduleSlot(index, "type", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In-person">In-person</SelectItem>
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status *</Label>
                      <Select value={slot.status || "standby-cv"} onValueChange={(v) => updateScheduleSlot(index, "status", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {CANDIDATE_STATUSES.filter((s) => s.value !== "all").map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Remarks</Label>
                    <Input
                      placeholder="Optional notes"
                      value={slot.remarks}
                      onChange={(e) => updateScheduleSlot(index, "remarks", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
                Add another outlet / date
              </Button>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={scheduleSubmitting}>
                  {scheduleSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4 mr-2" />
                  )}
                  Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* History modal */}
        <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
          <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Interview History</DialogTitle>
              <DialogDescription>
                {historyCandidate
                  ? `Previously scheduled / tagged for ${historyCandidate.name}`
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex flex-col flex-1 min-h-0">
              {historySchedules.length === 0 ? (
                <p className="text-muted-foreground text-sm">No scheduled interviews yet.</p>
              ) : (
                <>
                  <div className="overflow-x-auto overflow-y-auto flex-1 rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Outlet</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historySchedules
                          .slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE)
                          .map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>{s.outlet?.name ?? "—"}</TableCell>
                            <TableCell>
                              {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString("en-IN") : "—"}
                            </TableCell>
                            <TableCell>{s.type ?? "—"}</TableCell>
                            <TableCell>{s.status ? getStatusBadge(s.status) : "—"}</TableCell>
                            <TableCell>{s.remarks ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {historySchedules.length > HISTORY_PAGE_SIZE && (
                    <div className="flex items-center justify-between pt-3 border-t mt-3">
                      <span className="text-sm text-muted-foreground">
                        Showing {(historyPage - 1) * HISTORY_PAGE_SIZE + 1}-{Math.min(historyPage * HISTORY_PAGE_SIZE, historySchedules.length)} of {historySchedules.length}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage <= 1}>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setHistoryPage((p) => p + 1)} disabled={historyPage >= Math.ceil(historySchedules.length / HISTORY_PAGE_SIZE)}>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* View Details modal */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
              <DialogDescription>{viewDetailsCandidate?.name}</DialogDescription>
            </DialogHeader>
            {viewDetailsCandidate && (
              <div className="mt-4 space-y-3 text-sm">
                <p>
                  <span className="font-medium">Phone:</span> {viewDetailsCandidate.phone}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {viewDetailsCandidate.email || "—"}
                </p>
                <p>
                  <span className="font-medium">Position:</span> {viewDetailsCandidate.position}
                </p>
                <p>
                  <span className="font-medium">Experience:</span> {viewDetailsCandidate.experience}
                </p>
                <p>
                  <span className="font-medium">Location:</span> {viewDetailsCandidate.location}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {viewDetailsCandidate.status}
                </p>
                <p>
                  <span className="font-medium">Resume:</span>{" "}
                  {viewDetailsCandidate.resume ? (
                    <a href={viewDetailsCandidate.resume.startsWith("/") ? viewDetailsCandidate.resume : viewDetailsCandidate.resume} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">View / Download</a>
                  ) : (
                    <span className="text-muted-foreground">Unavailable</span>
                  )}
                </p>
                <p>
                  <span className="font-medium">Resume last updated:</span>{" "}
                  {viewDetailsCandidate.resumeUpdatedAt ? new Date(viewDetailsCandidate.resumeUpdatedAt).toLocaleString("en-IN") : "—"}
                </p>
                <p>
                  <span className="font-medium">Applied:</span> {viewDetailsCandidate.appliedDate}
                </p>
                <p>
                  <span className="font-medium">Last updated:</span>{" "}
                  {viewDetailsCandidate.updatedAt ? new Date(viewDetailsCandidate.updatedAt).toLocaleString("en-IN") : "—"}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Candidate</DialogTitle>
              <DialogDescription>{editCandidate?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-position">Position</Label>
                  <Input
                    id="edit-position"
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CANDIDATE_STATUSES.filter((s) => s.value !== "all").map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-salary">Expected Salary</Label>
                  <Input
                    id="edit-salary"
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                  />
                </div>
              </div>
              {editCandidate && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {editCandidate.resume ? (
                    <p>Resume: <a href={editCandidate.resume.startsWith("/") ? editCandidate.resume : editCandidate.resume} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">View / Download</a></p>
                  ) : (
                    <p>Resume: Unavailable</p>
                  )}
                  <p>Resume last updated: {editCandidate.resumeUpdatedAt ? new Date(editCandidate.resumeUpdatedAt).toLocaleString("en-IN") : "—"}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
