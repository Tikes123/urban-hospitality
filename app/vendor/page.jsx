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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  Plus,
  Loader2,
  History,
  Users,
  UserCheck,
  BarChart3,
  Link2,
  Copy,
  ChevronDown,
  Columns3,
  Upload,
} from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"
import { CANDIDATE_STATUSES, getStatusInfo, getStatusBadgeClass } from "@/lib/statusConfig"
import { getCvLinkUrl } from "@/lib/baseUrl"

export default function AdminDashboard() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [positionFilter, setPositionFilter] = useState([])
  const [positionOptions, setPositionOptions] = useState([])
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [viewMode, setViewMode] = useState("table")
  const [selectedCandidates, setSelectedCandidates] = useState([])
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
  const [exportingCsv, setExportingCsv] = useState(false)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [viewDetailsCandidate, setViewDetailsCandidate] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", position: "", status: "", location: "", salary: "", attachments: [] })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const MAX_UPLOAD_MB = 50
  const [todayStats, setTodayStats] = useState({ candidatesAddedToday: 0, interviewsScheduledToday: 0, hiredToday: 0 })
  const TABLE_COLUMNS = [
    { id: "uid", label: "UID" },
    { id: "candidate", label: "Candidate" },
    { id: "position", label: "Position" },
    { id: "status", label: "Status" },
    { id: "experience", label: "Experience" },
    { id: "location", label: "Location" },
    { id: "appliedDate", label: "Applied Date" },
    { id: "salary", label: "Expected Salary" },
    { id: "rating", label: "Rating" },
    { id: "lastUpdated", label: "Last Updated" },
    { id: "cvLink", label: "CV Link" },
  ]
  const COLUMNS_STORAGE_KEY = "vendor-home-visible-columns"
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const defaults = TABLE_COLUMNS.reduce((acc, c) => ({ ...acc, [c.id]: true }), {})
    if (typeof window === "undefined") return defaults
    try {
      const stored = localStorage.getItem(COLUMNS_STORAGE_KEY)
      if (!stored) return defaults
      const parsed = JSON.parse(stored)
      if (typeof parsed !== "object" || parsed === null) return defaults
      return TABLE_COLUMNS.reduce((acc, c) => ({
        ...acc,
        [c.id]: parsed[c.id] !== undefined ? !!parsed[c.id] : true,
      }), {})
    } catch {
      return defaults
    }
  })
  const [columnsPopoverOpen, setColumnsPopoverOpen] = useState(false)
  const [copiedCvLinkId, setCopiedCvLinkId] = useState(null)
  const [todayStatsLoading, setTodayStatsLoading] = useState(true)
  const [cvLinks, setCvLinks] = useState([])
  const [allowedMap, setAllowedMap] = useState({})

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
    } catch {}
  }, [visibleColumns])

  useEffect(() => {
    fetchOutlets()
    fetchCvLinks()
  }, [])

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (t) {
      const hrId = typeof window !== "undefined" ? localStorage.getItem("vendor_view_as_hr_id") : null
      const permUrl = hrId ? `/api/vendor/menu-permissions?hrId=${hrId}` : "/api/vendor/menu-permissions"
      fetch(permUrl, { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) => setAllowedMap(data.allowedMap || {}))
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    fetch("/api/candidates/positions")
      .then((res) => (res.ok ? res.json() : []))
      .then(setPositionOptions)
      .catch(() => setPositionOptions([]))
  }, [])

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    const headers = t ? { Authorization: `Bearer ${t}` } : {}
    fetch("/api/analytics?period=today", { headers })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setTodayStats(data))
      .catch(() => {})
      .finally(() => setTodayStatsLoading(false))
  }, [])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, positionFilter])

  useEffect(() => {
    fetchCandidates()
  }, [page, limit, statusFilter, positionFilter])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      positionFilter.forEach((p) => params.append("positions", p))
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

  const escapeCsv = (v) => {
    if (v == null || v === "") return ""
    const s = String(v)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const handleExportCsv = async () => {
    setExportingCsv(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      positionFilter.forEach((p) => params.append("positions", p))
      params.set("page", "1")
      params.set("limit", "10000")
      const res = await fetch(`/api/candidates?${params.toString()}`)
      if (!res.ok) throw new Error("Export failed")
      const json = await res.json()
      const list = json.data ?? []
      const headers = ["UID", "Name", "Phone", "Email", "Position", "Status", "Experience", "Location", "Applied Date", "Expected Salary"]
      const rows = list.map((c) => [
        c.id,
        c.name,
        c.phone,
        c.email ?? "",
        c.position ?? "",
        c.status ?? "",
        c.experience ?? "",
        c.location ?? "",
        c.appliedDate ?? "",
        c.salary ?? "",
      ])
      const csvContent = [headers.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\r\n")
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `candidates-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${list.length} candidate(s)`)
    } catch (err) {
      toast.error(err.message || "Export failed")
    } finally {
      setExportingCsv(false)
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

  const cvLinkByCandidateId = (id) => cvLinks.find((l) => l.candidateId === id && l.status === "active")

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
        const cvUrl = getCvLinkUrl(linkId)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 3)
        const res = await fetch("/api/cv-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: candidate.id,
            candidateName: candidate.name,
            position: candidate.position,
            linkId,
            shortUrl: cvUrl,
            fullUrl: cvUrl,
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

  const copyCvLink = (url, candidateId) => {
    navigator.clipboard.writeText(url)
    toast.success("CV link copied")
    if (candidateId != null) {
      setCopiedCvLinkId(candidateId)
      setTimeout(() => setCopiedCvLinkId(null), 2000)
    }
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
    if (candidate && candidate.isActive === false) {
      toast.error("Cannot schedule interview for an inactive candidate. Activate the candidate first.")
      return
    }
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
      toast.error("Add at least one slot with outlet and date/time")
      return
    }
    setScheduleSubmitting(true)
    try {
      const slots = valid.map((s) => ({
        outletId: parseInt(s.outletId, 10),
        scheduledAt: new Date(s.scheduledAt).toISOString(),
        type: s.type || null,
        status: s.status || null,
        remarks: s.remarks || null,
      }))
      const res = await fetch(`/api/candidates/${scheduleCandidate.id}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to schedule")
      toast.success(`Scheduled ${slots.length} interview(s)`)
      setScheduleModalOpen(false)
      setScheduleCandidate(null)
      setScheduleSlots([{ outletId: "", scheduledAt: "", type: "In-person", status: "standby-cv", remarks: "" }])
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
                <Users className="h-10 w-10 text-green-500" />
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
        {allowedMap.analytics !== false && (
          <div className="mb-6">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/vendor/analytics">
                <BarChart3 className="w-4 h-4" />
                View all analytics
              </Link>
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className="bg-green-600 text-white">
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
                <Popover open={positionDropdownOpen} onOpenChange={setPositionDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between font-normal min-h-10"
                    >
                      <span className="truncate">
                        {positionFilter.length === 0
                          ? "All positions"
                          : positionFilter.length === 1
                            ? positionFilter[0]
                            : `${positionFilter.length} positions selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {positionOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">No positions found</p>
                      ) : (
                        positionOptions.map((pos) => (
                          <label
                            key={pos}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                          >
                            <Checkbox
                              checked={positionFilter.includes(pos)}
                              onCheckedChange={(checked) => {
                                setPositionFilter((prev) =>
                                  checked ? [...prev, pos] : prev.filter((p) => p !== pos)
                                )
                              }}
                            />
                            <span className="truncate">{pos}</span>
                          </label>
                        ))
                      )}
                    </div>
                    {positionFilter.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setPositionFilter([])}
                      >
                        Clear selection
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => fetchCandidates()}
              >
                Apply Filter
              </Button>
              {allowedMap.export_csv !== false && (
                <Button
                  variant="outline"
                  onClick={handleExportCsv}
                  disabled={exportingCsv}
                >
                  {exportingCsv ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Export
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("all")
                  setPositionFilter([])
                }}
              >
                Clear All
              </Button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Candidates ({total})</span>
              <div className="flex gap-2 items-center">
                <Popover open={columnsPopoverOpen} onOpenChange={setColumnsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Columns3 className="w-4 h-4" /> Columns
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="end">
                    <p className="text-sm font-medium mb-2">Show / hide columns</p>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {TABLE_COLUMNS.map((col) => (
                        <label key={col.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-accent">
                          <Checkbox
                            checked={visibleColumns[col.id] !== false}
                            onCheckedChange={(checked) => setVisibleColumns((prev) => ({ ...prev, [col.id]: !!checked }))}
                          />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
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
                            {allowedMap.action_view_details !== false && <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>}
                            {allowedMap.action_edit !== false && <DropdownMenuItem onClick={() => { setEditCandidate(candidate); setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location, salary: candidate.salary || "" }); setEditModalOpen(true) }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>}
                            {allowedMap.action_call !== false && <DropdownMenuItem asChild><a href={`tel:${candidate.phone}`}><Phone className="w-4 h-4 mr-2" /> Call</a></DropdownMenuItem>}
                            {allowedMap.action_email !== false && <DropdownMenuItem asChild><a href={candidate.email ? `mailto:${candidate.email}` : "#"}><Mail className="w-4 h-4 mr-2" /> Email</a></DropdownMenuItem>}
                            {allowedMap.action_schedule_interview !== false && <DropdownMenuItem onClick={() => openScheduleModal(candidate)} disabled={candidate.isActive === false}><Calendar className="w-4 h-4 mr-2" /> Schedule Interview</DropdownMenuItem>}
                            {allowedMap.action_download_resume !== false && <DropdownMenuItem onClick={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")} disabled={!candidate.resume}><Download className="w-4 h-4 mr-2" /> Download Resume</DropdownMenuItem>}
                            {allowedMap.action_history !== false && <DropdownMenuItem onClick={() => openHistoryModal(candidate)}><History className="w-4 h-4 mr-2" /> History</DropdownMenuItem>}
                            {allowedMap.action_activate_cv_link !== false && <DropdownMenuItem onClick={() => handleActivateCvLink(candidate)}><Link2 className="w-4 h-4 mr-2" /> Activate CV Link</DropdownMenuItem>}
                            {allowedMap.action_deactivate_cv_link !== false && <DropdownMenuItem onClick={() => handleDeactivateCvLink(candidate)}><Link2 className="w-4 h-4 mr-2" /> Deactivate CV Link</DropdownMenuItem>}
                            {allowedMap.action_delete !== false && <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(candidate.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>}
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
                  {visibleColumns.uid !== false && <TableHead>UID</TableHead>}
                  {visibleColumns.candidate !== false && <TableHead>Candidate</TableHead>}
                  {visibleColumns.position !== false && <TableHead>Position</TableHead>}
                  {visibleColumns.status !== false && <TableHead>Status</TableHead>}
                  {visibleColumns.experience !== false && <TableHead>Experience</TableHead>}
                  {visibleColumns.location !== false && <TableHead>Location</TableHead>}
                  {visibleColumns.appliedDate !== false && <TableHead>Applied Date</TableHead>}
                  {visibleColumns.salary !== false && <TableHead>Expected Salary</TableHead>}
                  {visibleColumns.rating !== false && <TableHead>Rating</TableHead>}
                  {visibleColumns.lastUpdated !== false && <TableHead>Last Updated</TableHead>}
                  {visibleColumns.cvLink !== false && <TableHead>CV Link</TableHead>}
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2 + TABLE_COLUMNS.filter((c) => visibleColumns[c.id] !== false).length} className="text-center py-8">
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
                      {visibleColumns.uid !== false && <TableCell className="font-mono text-sm">{candidate.id}</TableCell>}
                      {visibleColumns.candidate !== false && (
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
                      )}
                      {visibleColumns.position !== false && <TableCell>{candidate.position}</TableCell>}
                      {visibleColumns.status !== false && <TableCell>{getStatusBadge(candidate.status)}</TableCell>}
                      {visibleColumns.experience !== false && <TableCell>{candidate.experience}</TableCell>}
                      {visibleColumns.location !== false && <TableCell>{candidate.location}</TableCell>}
                      {visibleColumns.appliedDate !== false && <TableCell>{candidate.appliedDate}</TableCell>}
                      {visibleColumns.salary !== false && <TableCell>{candidate.salary}</TableCell>}
                      {visibleColumns.rating !== false && (
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1 text-sm">{candidate.rating}</span>
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.lastUpdated !== false && (
                        <TableCell className="text-sm text-muted-foreground">
                          {formatLastUpdated(candidate.updatedAt)}
                        </TableCell>
                      )}
                      {visibleColumns.cvLink !== false && (
                        <TableCell>
                          {(() => {
                            const link = cvLinkByCandidateId(candidate.id)
                            if (!link) return <span className="text-muted-foreground">—</span>
                            const cvUrl = getCvLinkUrl(link.linkId)
                            const justCopied = copiedCvLinkId === candidate.id
                            return (
                              <div className="flex items-center gap-1">
                                <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[120px] text-green-600 hover:underline block" title={cvUrl}>{cvUrl}</a>
                                {justCopied ? (
                                  <span className="text-xs text-green-600 font-medium">Copied</span>
                                ) : (
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => copyCvLink(cvUrl, candidate.id)} title="Copy link"><Copy className="w-3 h-3" /></Button>
                                )}
                              </div>
                            )
                          })()}
                        </TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {allowedMap.action_view_details !== false && (
                              <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_edit !== false && (
                              <DropdownMenuItem onClick={() => {
                                setEditCandidate(candidate)
                                setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location, salary: candidate.salary || "", attachments: candidate.attachments || [] })
                                setEditModalOpen(true)
                              }}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_call !== false && (
                              <DropdownMenuItem asChild>
                                <a href={`tel:${candidate.phone}`}><Phone className="w-4 h-4 mr-2" /> Call</a>
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_email !== false && (
                              <DropdownMenuItem asChild>
                                <a href={candidate.email ? `mailto:${candidate.email}` : "#"}><Mail className="w-4 h-4 mr-2" /> Email</a>
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_schedule_interview !== false && (
                              <DropdownMenuItem onClick={() => openScheduleModal(candidate)} disabled={candidate.isActive === false}>
                                <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_download_resume !== false && (
                              <DropdownMenuItem onClick={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")} disabled={!candidate.resume}>
                                <Download className="w-4 h-4 mr-2" /> Download Resume
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_history !== false && (
                              <DropdownMenuItem onClick={() => openHistoryModal(candidate)}>
                                <History className="w-4 h-4 mr-2" /> History
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_activate_cv_link !== false && (
                              <DropdownMenuItem onClick={() => handleActivateCvLink(candidate)}>
                                <Link2 className="w-4 h-4 mr-2" /> Activate CV Link
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_deactivate_cv_link !== false && (
                              <DropdownMenuItem onClick={() => handleDeactivateCvLink(candidate)}>
                                <Link2 className="w-4 h-4 mr-2" /> Deactivate CV Link
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_delete !== false && (
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(candidate.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            )}
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
                {scheduleCandidate ? `Schedule interview(s) for ${scheduleCandidate.name}. Add multiple slots with different outlets and times.` : ""}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleSubmit} className="space-y-4 mt-4">
              {scheduleSlots.map((slot, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Slot {index + 1}</Label>
                    {scheduleSlots.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeScheduleSlot(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
                        required
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
                      <Select value={slot.status} onValueChange={(v) => updateScheduleSlot(index, "status", v)}>
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
              <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add another slot
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
                          <TableHead className="w-12">S.No</TableHead>
                          <TableHead>Outlets</TableHead>
                          <TableHead>Interview date</TableHead>
                          <TableHead>Tag date & time</TableHead>
                          <TableHead>Remark</TableHead>
                          <TableHead>Tagged by</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historySchedules
                          .slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE)
                          .map((s, idx) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-mono">{(historyPage - 1) * HISTORY_PAGE_SIZE + idx + 1}</TableCell>
                            <TableCell>{s.outlet?.name ?? "—"}</TableCell>
                            <TableCell>{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString("en-IN") : "—"}</TableCell>
                            <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleString("en-IN") : "—"}</TableCell>
                            <TableCell>{s.remarks ?? "—"}</TableCell>
                            <TableCell>{s.taggedBy?.name || s.taggedBy?.email || "—"}</TableCell>
                            <TableCell>{s.status ? getStatusBadge(s.status) : "—"}</TableCell>
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
                <p><span className="font-medium">Phone:</span> {viewDetailsCandidate.phone}</p>
                <p><span className="font-medium">Email:</span> {viewDetailsCandidate.email || "—"}</p>
                <p><span className="font-medium">Position:</span> {viewDetailsCandidate.position}</p>
                <p><span className="font-medium">Experience:</span> {viewDetailsCandidate.experience || "—"}</p>
                <p><span className="font-medium">Location:</span> {viewDetailsCandidate.location}</p>
                <p><span className="font-medium">Status:</span> {viewDetailsCandidate.status}</p>
                <p><span className="font-medium">Expected Salary:</span> {viewDetailsCandidate.salary || "—"}</p>
                <p><span className="font-medium">Source:</span> {viewDetailsCandidate.source || "—"}</p>
                {viewDetailsCandidate.skills && <p><span className="font-medium">Skills & Qualifications:</span> {viewDetailsCandidate.skills}</p>}
                {viewDetailsCandidate.education && <p><span className="font-medium">Education:</span> {viewDetailsCandidate.education}</p>}
                {viewDetailsCandidate.previousEmployer && <p><span className="font-medium">Previous Employer:</span> {viewDetailsCandidate.previousEmployer}</p>}
                {viewDetailsCandidate.notes && <p><span className="font-medium">Internal Notes:</span> {viewDetailsCandidate.notes}</p>}
                {(() => {
                  const att = viewDetailsCandidate.attachments || []
                  const firstPath = viewDetailsCandidate.resume || (att[0] && att[0].path)
                  const allFiles = att.length > 0 ? att : (viewDetailsCandidate.resume ? [{ path: viewDetailsCandidate.resume, name: "Resume" }] : [])
                  return (
                    <>
                      <p><span className="font-medium">Resume:</span>{" "}
                        {firstPath ? (
                          <a href={firstPath.startsWith("http") ? firstPath : firstPath} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">View / Download</a>
                        ) : (
                          <span className="text-muted-foreground">Unavailable</span>
                        )}
                      </p>
                      {allFiles.length > 1 && (
                        <p><span className="font-medium">Attached files:</span>{" "}
                          <span className="ml-2">
                            {allFiles.map((f, i) => (
                              <span key={i}>
                                <a href={(f.path || "").startsWith("http") ? f.path : f.path} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">{f.name || `File ${i + 1}`}</a>
                                {i < allFiles.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        </p>
                      )}
                      <p><span className="font-medium">Resume last updated:</span>{" "}
                        {viewDetailsCandidate.resumeUpdatedAt ? new Date(viewDetailsCandidate.resumeUpdatedAt).toLocaleString("en-IN") : "—"}
                      </p>
                      <p><span className="font-medium">Applied:</span> {viewDetailsCandidate.appliedDate}</p>
                      <p><span className="font-medium">Last updated:</span>{" "}
                        {viewDetailsCandidate.updatedAt ? new Date(viewDetailsCandidate.updatedAt).toLocaleString("en-IN") : "—"}
                      </p>
                    </>
                  )
                })()}
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
              <div>
                <Label>Attached files</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">Drag and drop or click to add. PDF, DOC, DOCX, or images (max {MAX_UPLOAD_MB}MB). Order the list below.</p>
                <label
                  htmlFor="edit-attachments"
                  className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-green-500") }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-green-500") }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove("border-green-500")
                    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.size > 0 && f.size <= MAX_UPLOAD_MB * 1024 * 1024)
                    if (files.length === 0) return
                    files.forEach((file) => {
                      const fd = new FormData()
                      fd.append("file", file)
                      fetch("/api/upload", { method: "POST", body: fd })
                        .then((res) => res.ok ? res.json() : Promise.reject())
                        .then(({ path, name }) => {
                          setEditForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), { path, name, order: (prev.attachments || []).length }] }))
                          toast.success(`${name} added`)
                        })
                        .catch(() => toast.error("Upload failed"))
                    })
                  }}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max {MAX_UPLOAD_MB}MB)</p>
                </label>
                <Input
                  id="edit-attachments"
                  type="file"
                  accept=".pdf,.doc,.docx,image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).filter((f) => f.size > 0 && f.size <= MAX_UPLOAD_MB * 1024 * 1024)
                    e.target.value = ""
                    files.forEach((file) => {
                      const fd = new FormData()
                      fd.append("file", file)
                      fetch("/api/upload", { method: "POST", body: fd })
                        .then((res) => res.ok ? res.json() : Promise.reject())
                        .then(({ path, name }) => {
                          setEditForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), { path, name, order: (prev.attachments || []).length }] }))
                          toast.success(`${name} added`)
                        })
                        .catch(() => toast.error("Upload failed"))
                    })
                  }}
                />
                {(editForm.attachments || []).length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {(editForm.attachments || []).map((a, idx) => (
                      <li key={idx} className="flex items-center gap-2 p-2 rounded border bg-muted/50">
                        <span className="text-sm truncate flex-1 font-medium">{a.name}</span>
                        <div className="flex gap-1 shrink-0">
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                            const list = [...(editForm.attachments || [])]
                            if (idx === 0) return
                            ;[list[idx - 1], list[idx]] = [list[idx], list[idx - 1]]
                            setEditForm((prev) => ({ ...prev, attachments: list }))
                          }} disabled={idx === 0}>↑</Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                            const list = [...(editForm.attachments || [])]
                            if (idx === list.length - 1) return
                            ;[list[idx], list[idx + 1]] = [list[idx + 1], list[idx]]
                            setEditForm((prev) => ({ ...prev, attachments: list }))
                          }} disabled={idx === (editForm.attachments?.length || 0) - 1}>↓</Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => setEditForm((prev) => ({ ...prev, attachments: (prev.attachments || []).filter((_, i) => i !== idx) }))}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
