"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  Filter,
  Search,
  Plus,
  Loader2,
  Upload,
  Send,
  History,
} from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"
import { CANDIDATE_STATUSES, getStatusInfo, getStatusBadgeClass } from "@/lib/statusConfig"

const initialAddForm = {
  name: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
  location: "",
  availability: "",
  salary: "",
  skills: "",
  education: "",
  previousEmployer: "",
  references: "",
  notes: "",
  status: "recently-applied",
  source: "",
  resume: null,
}

export default function ViewApplicantsPage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [viewMode, setViewMode] = useState("table")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addFormData, setAddFormData] = useState(initialAddForm)
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [outlets, setOutlets] = useState([])
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleCandidate, setScheduleCandidate] = useState(null)
  const [scheduleSlots, setScheduleSlots] = useState([{ outletId: "", scheduledAt: "", type: "In-person", status: "standby-cv", remarks: "" }])
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

  useEffect(() => {
    fetchCandidates()
    fetchOutlets()
  }, [])

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

  useEffect(() => {
    setPage(1)
  }, [searchQuery, statusFilter, positionFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(), searchQuery ? 300 : 0)
    return () => clearTimeout(t)
  }, [page, limit, searchQuery, statusFilter, positionFilter])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (positionFilter !== "all") params.append("position", positionFilter)
      if (searchQuery) params.append("search", searchQuery)
      params.append("page", String(page))
      params.append("limit", String(limit))

      const response = await fetch(`/api/candidates?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch candidates")
      const json = await response.json()
      setCandidates(json.data ?? [])
      setTotal(json.total ?? 0)
      setTotalPages(json.totalPages ?? 1)
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast.error("Failed to load candidates")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return

    try {
      const response = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete candidate")

      toast.success("Candidate deleted successfully")
      fetchCandidates()
    } catch (error) {
      console.error("Error deleting candidate:", error)
      toast.error("Failed to delete candidate")
    }
  }

  const getStatusBadge = (status) => {
    const info = getStatusInfo(status)
    return <Badge className={`border ${getStatusBadgeClass(status)}`}>{info.label}</Badge>
  }

  const filteredCandidates = candidates

  const handleSelectCandidate = (candidateId) => {
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

  const formatLastUpdated = (iso) => {
    if (!iso) return "—"
    const d = new Date(iso)
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    const isOld = d < sixMonthsAgo
    const str = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    return isOld ? `${str} (outdated)` : str
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

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setAddSubmitting(true)
    try {
      const hasResumeFile = addFormData.resume && typeof addFormData.resume === "object" && addFormData.resume.name
      let response
      if (hasResumeFile) {
        const formData = new FormData()
        const { resume, ...rest } = addFormData
        Object.keys(rest).forEach((key) => {
          const v = rest[key]
          if (v != null && v !== "") formData.append(key, v)
        })
        formData.append("resume", resume)
        response = await fetch("/api/candidates", {
          method: "POST",
          body: formData,
        })
      } else {
        const { resume, ...payload } = addFormData
        response = await fetch("/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to add candidate")
      }
      toast.success("Candidate added successfully")
      setAddFormData(initialAddForm)
      setAddModalOpen(false)
      fetchCandidates()
    } catch (error) {
      console.error("Error adding candidate:", error)
      toast.error(error.message || "Failed to add candidate")
    } finally {
      setAddSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">View Applicants</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Candidate
            </Button>
          </div>
        </div>

        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>Enter the candidate's details to add them to the system.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="add-name">Full Name *</Label>
                <Input id="add-name" required value={addFormData.name} onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-phone">Phone Number *</Label>
                  <Input id="add-phone" type="tel" required value={addFormData.phone} onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="add-email">Email (optional)</Label>
                  <Input id="add-email" type="email" value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Position *</Label>
                  <Select value={addFormData.position} onValueChange={(v) => setAddFormData({ ...addFormData, position: v })}>
                    <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel-manager">Hotel Manager</SelectItem>
                      <SelectItem value="front-desk">Front Desk Associate</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="head-chef">Head Chef</SelectItem>
                      <SelectItem value="sous-chef">Sous Chef</SelectItem>
                      <SelectItem value="line-cook">Line Cook</SelectItem>
                      <SelectItem value="server">Server</SelectItem>
                      <SelectItem value="bartender">Bartender</SelectItem>
                      <SelectItem value="host-hostess">Host/Hostess</SelectItem>
                      <SelectItem value="event-coordinator">Event Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Experience *</Label>
                  <Select value={addFormData.experience} onValueChange={(v) => setAddFormData({ ...addFormData, experience: v })}>
                    <SelectTrigger><SelectValue placeholder="Experience" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry Level (0-1 years)</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-salary">Expected Salary</Label>
                  <Input id="add-salary" placeholder="e.g. $50,000" value={addFormData.salary} onChange={(e) => setAddFormData({ ...addFormData, salary: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="add-location">Location *</Label>
                  <Input id="add-location" placeholder="City, State" required value={addFormData.location} onChange={(e) => setAddFormData({ ...addFormData, location: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Source</Label>
                <Select value={addFormData.source} onValueChange={(v) => setAddFormData({ ...addFormData, source: v })}>
                  <SelectTrigger><SelectValue placeholder="How did they find us?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="job-board">Job Board</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="walk-in">Walk-in</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Status *</Label>
                  <RadioGroup value={addFormData.status} onValueChange={(v) => setAddFormData({ ...addFormData, status: v })} className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recently-applied" id="add-status-recent" />
                      <Label htmlFor="add-status-recent" className="font-normal">Recently Applied</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suggested" id="add-status-suggested" />
                      <Label htmlFor="add-status-suggested" className="font-normal">Suggested</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="backed-out" id="add-status-backed" />
                      <Label htmlFor="add-status-backed" className="font-normal">Backed Out</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Availability *</Label>
                  <RadioGroup value={addFormData.availability} onValueChange={(v) => setAddFormData({ ...addFormData, availability: v })} className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="add-avail-immediate" />
                      <Label htmlFor="add-avail-immediate" className="font-normal">Immediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2-weeks" id="add-avail-2w" />
                      <Label htmlFor="add-avail-2w" className="font-normal">2 weeks notice</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-month" id="add-avail-1m" />
                      <Label htmlFor="add-avail-1m" className="font-normal">1 month notice</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div>
                <Label htmlFor="add-resume">Upload Resume</Label>
                <label htmlFor="add-resume" className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop resume</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                  {addFormData.resume && (
                    <p className="text-sm text-green-600 mt-2 font-medium">{addFormData.resume.name}</p>
                  )}
                </label>
                <Input
                  id="add-resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setAddFormData({ ...addFormData, resume: e.target.files?.[0] || null })}
                />
              </div>
              <div>
                <Label htmlFor="add-skills">Skills & Qualifications</Label>
                <Textarea id="add-skills" rows={2} placeholder="Skills, certifications..." value={addFormData.skills} onChange={(e) => setAddFormData({ ...addFormData, skills: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-education">Education</Label>
                  <Input id="add-education" placeholder="Highest education" value={addFormData.education} onChange={(e) => setAddFormData({ ...addFormData, education: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="add-prev">Previous Employer</Label>
                  <Input id="add-prev" placeholder="Most recent employer" value={addFormData.previousEmployer} onChange={(e) => setAddFormData({ ...addFormData, previousEmployer: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="add-notes">Internal Notes</Label>
                <Textarea id="add-notes" rows={2} placeholder="Internal notes..." value={addFormData.notes} onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={addSubmitting}>
                  {addSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Add Candidate
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
              <DialogDescription>
                {scheduleCandidate ? `Schedule interview(s) for ${scheduleCandidate.name}. Add multiple outlets and dates.` : ""}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4">
              {scheduleSlots.map((slot, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Slot {index + 1}</span>
                    {scheduleSlots.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeScheduleSlot(index)}>Remove</Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Outlet *</Label>
                      <Select value={slot.outletId} onValueChange={(v) => updateScheduleSlot(index, "outletId", v)}>
                        <SelectTrigger><SelectValue placeholder="Select outlet" /></SelectTrigger>
                        <SelectContent>
                          {outlets.map((o) => (
                            <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
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
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
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
                <Plus className="w-4 h-4 mr-2" /> Add another outlet / date
              </Button>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={scheduleSubmitting}>
                  {scheduleSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                  Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
          <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Interview History</DialogTitle>
              <DialogDescription>
                {historyCandidate ? `Previously scheduled / tagged for ${historyCandidate.name}` : ""}
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
                            <TableCell>{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString("en-IN") : "—"}</TableCell>
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

        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Candidate Details</DialogTitle>
              <DialogDescription>{viewDetailsCandidate?.name}</DialogDescription>
            </DialogHeader>
            {viewDetailsCandidate && (
              <div className="mt-4 space-y-3 text-sm">
                <p><span className="font-medium">Phone:</span> {viewDetailsCandidate.phone}</p>
                <p><span className="font-medium">Email:</span> {viewDetailsCandidate.email || "—"}</p>
                <p><span className="font-medium">Position:</span> {viewDetailsCandidate.position}</p>
                <p><span className="font-medium">Experience:</span> {viewDetailsCandidate.experience}</p>
                <p><span className="font-medium">Location:</span> {viewDetailsCandidate.location}</p>
                <p><span className="font-medium">Status:</span> {viewDetailsCandidate.status}</p>
                <p><span className="font-medium">Resume:</span> {viewDetailsCandidate.resume ? (
                  <a href={viewDetailsCandidate.resume.startsWith("/") ? viewDetailsCandidate.resume : viewDetailsCandidate.resume} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">View / Download</a>
                ) : (
                  <span className="text-muted-foreground">Unavailable</span>
                )}</p>
                <p><span className="font-medium">Resume last updated:</span> {viewDetailsCandidate.resumeUpdatedAt ? new Date(viewDetailsCandidate.resumeUpdatedAt).toLocaleString("en-IN") : "—"}</p>
                <p><span className="font-medium">Applied:</span> {viewDetailsCandidate.appliedDate}</p>
                <p><span className="font-medium">Last updated:</span> {viewDetailsCandidate.updatedAt ? new Date(viewDetailsCandidate.updatedAt).toLocaleString("en-IN") : "—"}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Candidate</DialogTitle>
              <DialogDescription>{editCandidate?.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input id="edit-name" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input id="edit-phone" type="tel" required value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-position">Position</Label>
                  <Input id="edit-position" value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
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
                  <Input id="edit-location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="edit-salary">Expected Salary</Label>
                  <Input id="edit-salary" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} />
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
                <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={editSubmitting}>{editSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
                  <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_STATUSES.filter((s) => s.value === "all" || !s.value.startsWith("all")).map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger><SelectValue placeholder="Filter by Position" /></SelectTrigger>
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
                <Button variant="outline" size="sm" onClick={() => { setStatusFilter("all"); setPositionFilter("all"); setSearchQuery("") }}>
                  Clear Filters
                </Button>
                <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> More Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCandidates.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{selectedCandidates.length} candidate(s) selected</span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm"><Mail className="w-4 h-4 mr-2" /> Send Email</Button>
                  <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-2" /> Schedule Interview</Button>
                  <Button variant="outline" size="sm">Change Status</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Candidates ({total})</span>
              <div className="flex items-center space-x-2">
                <Button variant={viewMode === "table" ? "default" : "outline"} size="sm" onClick={() => setViewMode("table")}>Table</Button>
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>Grid</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <Card key={candidate.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>{candidate.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.position}</div>
                            <div className="text-xs text-gray-400 flex items-center"><Phone className="w-3 h-3 mr-1" />{candidate.phone}</div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditCandidate(candidate); setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location, salary: candidate.salary || "" }); setEditModalOpen(true) }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={`tel:${candidate.phone}`}><Phone className="w-4 h-4 mr-2" /> Call</a></DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={candidate.email ? `mailto:${candidate.email}` : "#"}><Mail className="w-4 h-4 mr-2" /> Email</a></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openScheduleModal(candidate)}><Calendar className="w-4 h-4 mr-2" /> Schedule Interview</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")} disabled={!candidate.resume}><Download className="w-4 h-4 mr-2" /> Download Resume</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openHistoryModal(candidate)}><History className="w-4 h-4 mr-2" /> History</DropdownMenuItem>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={filteredCandidates.length > 0 && selectedCandidates.length === filteredCandidates.length} onCheckedChange={handleSelectAll} />
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
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
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
                            <AvatarFallback>{candidate.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditCandidate(candidate)
                              setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location, salary: candidate.salary || "" })
                              setEditModalOpen(true)
                            }}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`tel:${candidate.phone}`}><Phone className="w-4 h-4 mr-2" /> Call</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={candidate.email ? `mailto:${candidate.email}` : "#"}><Mail className="w-4 h-4 mr-2" /> Email</a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openScheduleModal(candidate)}>
                              <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")} disabled={!candidate.resume}>
                              <Download className="w-4 h-4 mr-2" /> Download Resume
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openHistoryModal(candidate)}>
                              <History className="w-4 h-4 mr-2" /> History
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(candidate.id)}>
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
              <div className="text-center py-8 text-gray-500">No candidates found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
