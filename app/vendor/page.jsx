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
import { CandidateActionMenu } from "@/components/modals/candidate-action-menu"
import { CandidateViewDetailsModal } from "@/components/modals/candidate-view-details-modal"
import { CandidateHistoryModal } from "@/components/modals/candidate-history-modal"
import { CandidateShareInfoModal } from "@/components/modals/candidate-share-info-modal"
import { CandidateMarkInactiveModal } from "@/components/modals/candidate-mark-inactive-modal"
import { CandidateDeleteConfirmModal } from "@/components/modals/candidate-delete-confirm-modal"

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
  const [samePositionOutlets, setSamePositionOutlets] = useState([])
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyCandidate, setHistoryCandidate] = useState(null)
  const [historySchedules, setHistorySchedules] = useState([])
  const [historyReplacements, setHistoryReplacements] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const HISTORY_PAGE_SIZE = 10
  const [exportingCsv, setExportingCsv] = useState(false)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [viewDetailsCandidate, setViewDetailsCandidate] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", position: "", status: "", location: "", salary: "", attachments: [] })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [replaceWithChecked, setReplaceWithChecked] = useState(false)
  const [replacementForm, setReplacementForm] = useState({
    replacementCandidateId: "", replacementCandidateName: "", outletId: "", position: "", replacedHrId: "", replacementHrId: "", dateOfJoining: "", exitDate: "", salary: "",
  })
  const [replacementCandidateSearch, setReplacementCandidateSearch] = useState("")
  const [replacementCandidateOptions, setReplacementCandidateOptions] = useState([])
  const [replacementCandidateDropdownOpen, setReplacementCandidateDropdownOpen] = useState(false)
  const [hrList, setHrList] = useState([])
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
  const [sessionUser, setSessionUser] = useState(null)
  const [shareInfoOpen, setShareInfoOpen] = useState(false)
  const [shareInfoCandidate, setShareInfoCandidate] = useState(null)
  const [inactiveModalOpen, setInactiveModalOpen] = useState(false)
  const [inactiveCandidate, setInactiveCandidate] = useState(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
    } catch {}
  }, [visibleColumns])

  useEffect(() => {
    fetchOutlets()
    fetchCvLinks()
    fetchSessionUser()
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (t) {
      fetch("/api/auth/session", { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => res.json())
        .then((data) => { if (data.valid && data.user?.id) fetch(`/api/hr?vendorId=${data.user.id}&limit=200`).then((r) => r.ok ? r.json() : {}).then((d) => setHrList(d.data ?? [])).catch(() => setHrList([])) })
        .catch(() => {})
    }
  }, [])

  const fetchSessionUser = async () => {
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      if (!t) return
      const res = await fetch("/api/auth/session", { headers: { Authorization: `Bearer ${t}` } })
      if (res.ok) {
        const data = await res.json()
        if (data.user) setSessionUser(data.user)
      }
    } catch (e) {
      console.error("Error fetching session:", e)
    }
  }

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

  useEffect(() => {
    if (!scheduleModalOpen || !scheduleCandidate?.position) {
      setSamePositionOutlets([])
      return
    }
    const pos = String(scheduleCandidate.position).trim()
    if (!pos) {
      setSamePositionOutlets([])
      return
    }
    fetch(`/api/outlets?position=${encodeURIComponent(pos)}&limit=200`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setSamePositionOutlets(Array.isArray(json) ? json : (json.data ?? [])))
      .catch(() => setSamePositionOutlets([]))
  }, [scheduleModalOpen, scheduleCandidate?.position])

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

  const handleDelete = (candidate) => {
    setDeleteCandidate(candidate)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async (candidate) => {
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Candidate deleted")
      fetchCandidates()
    } catch (e) {
      toast.error(e.message || "Failed to delete")
    }
  }

  const openShareInfo = (candidate) => {
    setShareInfoCandidate(candidate)
    setShareInfoOpen(true)
  }

  const handleMarkInactiveClick = (candidate) => {
    setInactiveCandidate(candidate)
    setInactiveModalOpen(true)
  }

  const handleSetActiveStatus = async (candidateId, active, reason, category) => {
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        body: JSON.stringify({
          isActive: active,
          ...(active === false && { inactiveReason: reason || null, inactiveReasonCategory: category || null }),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      toast.success(active ? "Candidate activated" : "Candidate marked inactive")
      setInactiveModalOpen(false)
      setInactiveCandidate(null)
      fetchCandidates()
    } catch (e) {
      toast.error(e.message || "Failed to update")
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

  const addScheduleSlotForOutlet = (outletId) => {
    setScheduleSlots((prev) => [...prev, { outletId: String(outletId), scheduledAt: "", type: "In-person", status: "standby-cv", remarks: "" }])
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
      const [schedRes, replRes] = await Promise.all([
        fetch(`/api/candidates/${candidate.id}/schedules`),
        fetch(`/api/candidates/${candidate.id}/replacements`),
      ])
      setHistorySchedules(schedRes.ok ? await schedRes.json() : [])
      setHistoryReplacements(replRes.ok ? await replRes.json() : [])
    } catch {
      setHistorySchedules([])
      setHistoryReplacements([])
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editCandidate) return
    if (replaceWithChecked && (!replacementForm.exitDate || !replacementForm.dateOfJoining || !replacementForm.outletId || !replacementForm.position || !replacementForm.replacementCandidateId)) {
      toast.error("When replacing: select replacement candidate, outlet, position, date of joining, and exit date (this candidate).")
      return
    }
    setEditSubmitting(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    try {
      const res = await fetch(`/api/candidates/${editCandidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      if (replaceWithChecked && replacementForm.replacementCandidateId && replacementForm.outletId && replacementForm.position && replacementForm.dateOfJoining && replacementForm.exitDate) {
        const replRes = await fetch("/api/replacements", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            replacedCandidateId: editCandidate.id,
            replacementCandidateId: parseInt(replacementForm.replacementCandidateId, 10),
            outletId: parseInt(replacementForm.outletId, 10),
            position: replacementForm.position.trim(),
            replacedHrId: replacementForm.replacedHrId || null,
            replacementHrId: replacementForm.replacementHrId || null,
            dateOfJoining: replacementForm.dateOfJoining,
            exitDate: replacementForm.exitDate,
            salary: replacementForm.salary?.trim() || null,
          }),
        })
        if (!replRes.ok) throw new Error((await replRes.json()).error || "Failed to create replacement")
        toast.success("Candidate updated and replacement recorded")
      } else {
        toast.success("Candidate updated")
      }
      setEditModalOpen(false)
      setEditCandidate(null)
      setReplaceWithChecked(false)
      setReplacementForm({ replacementCandidateId: "", replacementCandidateName: "", outletId: "", position: "", replacedHrId: "", replacementHrId: "", dateOfJoining: "", exitDate: "", salary: "" })
      syncLocationAndPositionToDataManagement(editForm.location, editForm.position)
      fetchCandidates()
    } catch (err) {
      toast.error(err.message || "Failed to update")
    } finally {
      setEditSubmitting(false)
    }
  }

  const syncLocationAndPositionToDataManagement = (location, position) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) return
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    if (location && String(location).trim()) {
      fetch("/api/vendor/locations", { method: "POST", headers, body: JSON.stringify({ value: String(location).trim() }) }).catch(() => {})
    }
    if (position && String(position).trim()) {
      fetch("/api/vendor/positions", { method: "POST", headers, body: JSON.stringify({ name: String(position).trim() }) }).catch(() => {})
    }
  }

  const searchReplacementCandidates = (q) => {
    if (!q || !q.trim()) { setReplacementCandidateOptions([]); return }
    fetch(`/api/candidates?search=${encodeURIComponent(q.trim())}&limit=20`)
      .then((res) => res.ok ? res.json() : { data: [] })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? [])
        const exclude = editCandidate?.id ? list.filter((c) => c.id !== editCandidate.id) : list
        setReplacementCandidateOptions(exclude)
      })
      .catch(() => setReplacementCandidateOptions([]))
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
                        <CandidateActionMenu
                          candidate={candidate}
                          allowedMap={allowedMap}
                          sessionUser={sessionUser}
                          onViewDetails={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}
                          onShareInfo={() => openShareInfo(candidate)}
                          onEdit={() => { setEditCandidate(candidate); setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location, salary: candidate.salary || "", attachments: candidate.attachments || [] }); setReplaceWithChecked(false); setReplacementForm({ replacementCandidateId: "", replacementCandidateName: "", outletId: "", position: candidate.position || "", replacedHrId: "", replacementHrId: "", dateOfJoining: "", exitDate: "", salary: "" }); setEditModalOpen(true) }}
                          onScheduleInterview={() => openScheduleModal(candidate)}
                          onHistory={() => openHistoryModal(candidate)}
                          onActivateCvLink={() => handleActivateCvLink(candidate)}
                          onDeactivateCvLink={() => handleDeactivateCvLink(candidate)}
                          onMarkInactive={() => handleMarkInactiveClick(candidate)}
                          onActivate={() => handleSetActiveStatus(candidate.id, true)}
                          onDelete={() => handleDelete(candidate)}
                          onDownloadResume={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")}
                        />
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
                        <CandidateActionMenu
                          candidate={candidate}
                          allowedMap={allowedMap}
                          sessionUser={sessionUser}
                          onViewDetails={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}
                          onShareInfo={() => openShareInfo(candidate)}
                          onEdit={() => {
                            setEditCandidate(candidate)
                            setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location, salary: candidate.salary || "", attachments: candidate.attachments || [] })
                            setReplaceWithChecked(false)
                            setReplacementForm({ replacementCandidateId: "", replacementCandidateName: "", outletId: "", position: "", replacedHrId: "", replacementHrId: "", dateOfJoining: "", exitDate: "", salary: "" })
                            setEditModalOpen(true)
                          }}
                          onScheduleInterview={() => openScheduleModal(candidate)}
                          onHistory={() => openHistoryModal(candidate)}
                          onActivateCvLink={() => handleActivateCvLink(candidate)}
                          onDeactivateCvLink={() => handleDeactivateCvLink(candidate)}
                          onMarkInactive={() => handleMarkInactiveClick(candidate)}
                          onActivate={() => handleSetActiveStatus(candidate.id, true)}
                          onDelete={() => handleDelete(candidate)}
                          onDownloadResume={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")}
                        />
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
              {scheduleCandidate?.position && (() => {
                const outletsToShow = samePositionOutlets.length > 0 ? samePositionOutlets : outlets
                const available = outletsToShow.filter((o) => !scheduleSlots.some((s) => s.outletId === String(o.id)))
                if (available.length === 0) return null
                return (
                  <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                    <p className="text-sm font-medium">
                      {samePositionOutlets.length > 0
                        ? `Tag to more outlets (same position: ${scheduleCandidate.position})`
                        : `Other outlets (add slot for position: ${scheduleCandidate.position})`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {samePositionOutlets.length > 0 ? "Add a slot for any outlet that has this position opening." : "Add a slot for another outlet."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {available.map((o) => (
                        <Button
                          key={o.id}
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => addScheduleSlotForOutlet(o.id)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          {o.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })()}
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

        <CandidateHistoryModal
          open={historyModalOpen}
          onOpenChange={setHistoryModalOpen}
          candidate={historyCandidate}
          schedules={historySchedules}
          replacements={historyReplacements}
          page={historyPage}
          onPageChange={setHistoryPage}
        />

        <CandidateViewDetailsModal
          open={viewDetailsOpen}
          onOpenChange={setViewDetailsOpen}
          candidate={viewDetailsCandidate}
        />

        <CandidateShareInfoModal
          open={shareInfoOpen}
          onOpenChange={setShareInfoOpen}
          candidate={shareInfoCandidate}
          cvLinks={cvLinks}
          onSaveIntro={() => fetchCandidates()}
          onRefresh={fetchCvLinks}
        />

        <CandidateMarkInactiveModal
          open={inactiveModalOpen}
          onOpenChange={(open) => { if (!open) { setInactiveModalOpen(false); setInactiveCandidate(null) } else setInactiveModalOpen(open) }}
          candidate={inactiveCandidate}
          onSubmit={async (candidateId, reason, category) => {
            await handleSetActiveStatus(candidateId, false, reason, category || null)
          }}
        />

        <CandidateDeleteConfirmModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          candidate={deleteCandidate}
          onConfirm={handleDeleteConfirm}
        />

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
                    placeholder="Add or edit salary"
                  />
                </div>
              </div>
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={replaceWithChecked} onCheckedChange={(c) => setReplaceWithChecked(!!c)} />
                  <span className="font-medium">Replace this candidate with</span>
                </label>
                {replaceWithChecked && (
                  <>
                    <div>
                      <Label>Replacement candidate (who is joining)</Label>
                      <Popover open={replacementCandidateDropdownOpen} onOpenChange={setReplacementCandidateDropdownOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-between font-normal mt-1">
                            <span className="truncate">{replacementForm.replacementCandidateName || "Search by name or phone..."}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                          <Input
                            placeholder="Type to search..."
                            value={replacementCandidateSearch}
                            onChange={(e) => { setReplacementCandidateSearch(e.target.value); searchReplacementCandidates(e.target.value) }}
                            onFocus={() => setReplacementCandidateDropdownOpen(true)}
                            className="mb-2 h-9"
                          />
                          <div className="max-h-48 overflow-y-auto space-y-1">
                            {replacementCandidateOptions.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="w-full flex flex-col items-start rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent"
                                onClick={() => {
                                  setReplacementForm((prev) => ({ ...prev, replacementCandidateId: String(c.id), replacementCandidateName: `${c.name} (${c.phone})` }))
                                  setReplacementCandidateDropdownOpen(false)
                                  setReplacementCandidateSearch("")
                                  setReplacementCandidateOptions([])
                                }}
                              >
                                <span className="font-medium">{c.name}</span>
                                <span className="text-xs text-muted-foreground">{c.phone} · {c.position}</span>
                              </button>
                            ))}
                            {replacementCandidateSearch.trim() && replacementCandidateOptions.length === 0 && <p className="text-sm text-muted-foreground py-2">No candidates found</p>}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Outlet</Label>
                        <Select value={replacementForm.outletId ? String(replacementForm.outletId) : ""} onValueChange={(v) => setReplacementForm((prev) => ({ ...prev, outletId: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select outlet" /></SelectTrigger>
                          <SelectContent className="z-[100]">
                            {outlets.map((o) => (<SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Position (at outlet)</Label>
                        <Select value={replacementForm.position || ""} onValueChange={(v) => setReplacementForm((prev) => ({ ...prev, position: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                          <SelectContent className="z-[100]">
                            {[...new Set([...(editCandidate?.position ? [editCandidate.position] : []), ...(positionOptions || [])])].filter(Boolean).map((pos) => (
                              <SelectItem key={pos} value={String(pos)}>{pos}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Replaced candidate HR (optional)</Label>
                        <Select value={replacementForm.replacedHrId ? String(replacementForm.replacedHrId) : "__none__"} onValueChange={(v) => setReplacementForm((prev) => ({ ...prev, replacedHrId: v === "__none__" ? "" : v }))}>
                          <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— None —</SelectItem>
                            {hrList.map((h) => (<SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Replacement candidate HR (optional)</Label>
                        <Select value={replacementForm.replacementHrId ? String(replacementForm.replacementHrId) : "__none__"} onValueChange={(v) => setReplacementForm((prev) => ({ ...prev, replacementHrId: v === "__none__" ? "" : v }))}>
                          <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— None —</SelectItem>
                            {hrList.map((h) => (<SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date of joining (replacement candidate)</Label>
                        <Input type="date" value={replacementForm.dateOfJoining} onChange={(e) => setReplacementForm((prev) => ({ ...prev, dateOfJoining: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Exit date (this candidate) *</Label>
                        <Input type="date" value={replacementForm.exitDate} onChange={(e) => setReplacementForm((prev) => ({ ...prev, exitDate: e.target.value }))} required={replaceWithChecked} />
                      </div>
                    </div>
                    <div>
                      <Label>Salary (for replacement)</Label>
                      <Input value={replacementForm.salary} onChange={(e) => setReplacementForm((prev) => ({ ...prev, salary: e.target.value }))} placeholder="Optional" />
                    </div>
                  </>
                )}
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
