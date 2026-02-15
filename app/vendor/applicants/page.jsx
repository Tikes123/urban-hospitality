"use client"

import { useState, useEffect, useMemo } from "react"
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
  Filter,
  Search,
  Plus,
  Loader2,
  Upload,
  Send,
  History,
  Link2,
  Copy,
  Columns3,
  Share2,
  Check,
  ChevronDown,
  UserX,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"
import { CANDIDATE_STATUSES, getStatusInfo, getStatusBadgeClass } from "@/lib/statusConfig"
import { getCvLinkUrl } from "@/lib/baseUrl"

const INACTIVE_REASON_CATEGORIES = [
  { value: "behaviour", label: "Behaviour or discipline issues (misconduct, attitude, substance use)" },
  { value: "theft_fraud", label: "Theft, fraud, or other legal issues" },
  { value: "absconded", label: "Absconded, no-show, or left immediately after joining" },
  { value: "skill_mismatch", label: "Skill mismatch or failed trial / performance issues" },
]

const MAX_UPLOAD_MB = 50
const initialAddForm = {
  name: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
  location: [], // multi-select; stored as array, sent as comma-separated
  salary: "",
  skills: "",
  education: "",
  previousEmployer: "",
  references: "",
  notes: "",
  source: "",
  resume: null,
  attachmentFiles: [], // { id, file, name } - multiple files with order
}

export default function ViewApplicantsPage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [positionFilter, setPositionFilter] = useState([]) // array of selected positions; empty = all
  const [positionOptions, setPositionOptions] = useState([]) // from API
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false)
  const [positionSearchInput, setPositionSearchInput] = useState("") // type to filter list
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [viewMode, setViewMode] = useState("table")
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addFormData, setAddFormData] = useState(initialAddForm)
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [addPhoneError, setAddPhoneError] = useState("")
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
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", position: "", status: "", location: [], salary: "", attachments: [] })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [filterLocation, setFilterLocation] = useState("")
  const [locationFilter, setLocationFilter] = useState([]) // multi-select; empty = all
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearchInput, setLocationSearchInput] = useState("")
  const [filterPhone, setFilterPhone] = useState("")
  const [filterCandidateId, setFilterCandidateId] = useState("")
  const [filterResumeNotUpdated6, setFilterResumeNotUpdated6] = useState(false)
  const [appliedDateFrom, setAppliedDateFrom] = useState("")
  const [appliedDateTo, setAppliedDateTo] = useState("")
  const [updatedAtFrom, setUpdatedAtFrom] = useState("")
  const [updatedAtTo, setUpdatedAtTo] = useState("")
  const [outletFilter, setOutletFilter] = useState([]) // outlet IDs: candidates scheduled at any of these
  const [outletFilterSearch, setOutletFilterSearch] = useState("") // search filter for outlets
  const [isActiveFilter, setIsActiveFilter] = useState("all") // "all" | "active" | "inactive"
  const [sessionUser, setSessionUser] = useState(null) // { id, role } for activate permission
  const [inactiveModalOpen, setInactiveModalOpen] = useState(false)
  const [inactiveCandidate, setInactiveCandidate] = useState(null)
  const [inactiveReasonCategory, setInactiveReasonCategory] = useState("")
  const [inactiveReason, setInactiveReason] = useState("")
  const [inactiveSubmitting, setInactiveSubmitting] = useState(false)
  const [cvLinks, setCvLinks] = useState([])
  const [locationOptions, setLocationOptions] = useState([]) // from outlets + custom
  const [uploadProgress, setUploadProgress] = useState(null) // { current, total, percent }
  const [exportingCsv, setExportingCsv] = useState(false)
  const TABLE_COLUMNS = [
    { id: "uid", label: "UID" },
    { id: "candidate", label: "Candidate" },
    { id: "position", label: "Position" },
    { id: "status", label: "Status" },
    { id: "experience", label: "Experience" },
    { id: "location", label: "Location" },
    { id: "active", label: "Active" },
    { id: "appliedDate", label: "Applied Date" },
    { id: "salary", label: "Expected Salary" },
    { id: "rating", label: "Rating" },
    { id: "remark", label: "Remark" },
    { id: "addedBy", label: "Added by" },
    { id: "lastUpdated", label: "Last Updated" },
    { id: "cvLink", label: "CV Link" },
    { id: "viewCv", label: "View CV" },
  ]
  const COLUMNS_STORAGE_KEY = "vendor-applicants-visible-columns"
  const [copiedCvLinkId, setCopiedCvLinkId] = useState(null)
  const [shareInfoOpen, setShareInfoOpen] = useState(false)
  const [shareInfoCandidate, setShareInfoCandidate] = useState(null)
  const [shareInfoIntro, setShareInfoIntro] = useState("")
  const [shareInfoIntroSaving, setShareInfoIntroSaving] = useState(false)
  const [shareInfoFields, setShareInfoFields] = useState({ name: true, phone: true, email: false, position: true, experience: false, location: true, appliedDate: false, salary: true, status: false, cvLink: true, interview: false })
  const [shareInfoCopied, setShareInfoCopied] = useState(false)
  const [shareInfoSchedules, setShareInfoSchedules] = useState([])
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
  const [allowedMap, setAllowedMap] = useState({})

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns))
    } catch {}
  }, [visibleColumns])

  useEffect(() => {
    fetchCandidates()
    fetchOutlets()
    fetchCvLinks()
    fetch("/api/outlets/locations")
      .then((res) => (res.ok ? res.json() : []))
      .then(setLocationOptions)
      .catch(() => setLocationOptions([]))
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (t) {
      fetch("/api/auth/session", { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => res.json())
        .then((data) => { if (data.valid && data.user) setSessionUser({ id: data.user.id, role: data.role }) })
        .catch(() => {})
      const hrId = typeof window !== "undefined" ? localStorage.getItem("vendor_view_as_hr_id") : null
      const permUrl = hrId ? `/api/vendor/menu-permissions?hrId=${hrId}` : "/api/vendor/menu-permissions"
      fetch(permUrl, { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) => setAllowedMap(data.allowedMap || {}))
        .catch(() => {})
    }
    fetch("/api/candidates/positions")
      .then((res) => (res.ok ? res.json() : []))
      .then(setPositionOptions)
      .catch(() => setPositionOptions([]))
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

  const fetchCvLinks = async () => {
    try {
      const res = await fetch("/api/cv-links")
      if (!res.ok) return []
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setCvLinks(list)
      return list
    } catch (e) {
      console.error("Failed to fetch CV links", e)
      return []
    }
  }

  const cvLinkByCandidateId = (id, linksList) => {
    const list = linksList ?? cvLinks
    return list.find((l) => l.candidateId === id && l.status === "active")
  }

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

  const openShareInfo = async (candidate) => {
    setShareInfoCandidate(candidate)
    setShareInfoIntro(candidate.shareIntro ?? "")
    setShareInfoOpen(true)
    setShareInfoSchedules([])
    if (cvLinkByCandidateId(candidate.id)) {
      setShareInfoFields((prev) => ({ ...prev, cvLink: true }))
    }
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/schedules`)
      if (res.ok) {
        const list = await res.json()
        const arr = Array.isArray(list) ? list : []
        const withDate = arr.filter((s) => s && s.scheduledAt)
        const now = new Date()
        const upcoming = withDate.filter((s) => new Date(s.scheduledAt) >= now).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        // Use next upcoming, or if none then most recent (so {{interviewDate}}/{{interviewTime}} still show)
        const forPlaceholders = upcoming.length > 0 ? upcoming : withDate.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)).slice(0, 1)
        setShareInfoSchedules(forPlaceholders)
      }
    } catch {}
  }

  const copyCvLinkInShareModal = () => {
    if (!shareInfoCandidate) return
    const link = cvLinkByCandidateId(shareInfoCandidate.id)
    if (!link) {
      toast.error("No active CV link for this candidate")
      return
    }
    const cvUrl = getCvLinkUrl(link.linkId)
    navigator.clipboard.writeText(cvUrl)
    setShareInfoFields((prev) => ({ ...prev, cvLink: true }))
    toast.success("CV link copied – included in Copy all")
  }

  const buildShareText = (cvLinksOverride, schedulesOverride) => {
    if (!shareInfoCandidate) return ""
    const c = shareInfoCandidate
    const schedules = schedulesOverride !== undefined ? schedulesOverride : shareInfoSchedules
    const lines = []
    if (shareInfoFields.name) lines.push(`Name: ${c.name}`)
    if (shareInfoFields.phone) lines.push(`Phone: ${c.phone}`)
    if (shareInfoFields.email) lines.push(`Email: ${c.email || "—"}`)
    if (shareInfoFields.position) lines.push(`Position: ${c.position || "—"}`)
    if (shareInfoFields.experience) lines.push(`Experience: ${c.experience || "—"}`)
    if (shareInfoFields.location) lines.push(`Location: ${c.location || "—"}`)
    if (shareInfoFields.appliedDate) lines.push(`Applied Date: ${c.appliedDate || "—"}`)
    if (shareInfoFields.salary) lines.push(`Expected Salary: ${c.salary || "—"}`)
    if (shareInfoFields.status) lines.push(`Status: ${c.status || "—"}`)
    if (shareInfoFields.cvLink) {
      const link = cvLinkByCandidateId(c.id, cvLinksOverride)
      const cvUrl = link ? getCvLinkUrl(link.linkId) : "—"
      lines.push(`CV Link: ${cvUrl}`)
    }
    if (shareInfoFields.interview && schedules.length > 0) {
      const next = schedules[0]
      const dt = next.scheduledAt ? new Date(next.scheduledAt) : null
      const dateStr = dt ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}` : ""
      const timeStr = dt ? `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}` : ""
      lines.push(`Above candidate will be coming for Interview on ${dateStr} at ${timeStr}, Please share the feedback once the interview is done.`)
    }
    const introRaw = (shareInfoIntro ?? "").trim()
    if (introRaw) {
      let intro = introRaw
      const nextSchedule = schedules[0]
      const dt = nextSchedule?.scheduledAt ? new Date(nextSchedule.scheduledAt) : null
      const dateStr = dt ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}` : ""
      const timeStr = dt ? `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}` : ""
      intro = intro.replace(/\{\{interviewDate\}\}/gi, dateStr).replace(/\{\{interviewTime\}\}/gi, timeStr).replace(/\{\{interviewDateTime\}\}/gi, dateStr && timeStr ? `${dateStr} at ${timeStr}` : intro)
      lines.push("", intro)
    }
    return lines.join("\n")
  }

  const ensureCvLinkThenBuildShareText = async () => {
    let linksList = null
    if (shareInfoCandidate && shareInfoFields.cvLink && !cvLinkByCandidateId(shareInfoCandidate.id)) {
      try {
        await handleActivateCvLink(shareInfoCandidate)
        linksList = await fetchCvLinks()
      } catch (_) {
        // continue – buildShareText will show "—" for CV Link
      }
    }
    // Refetch schedules when copying so {{interviewDate}}/{{interviewTime}} use latest data
    let schedulesForCopy = []
    if (shareInfoCandidate) {
      try {
        const res = await fetch(`/api/candidates/${shareInfoCandidate.id}/schedules`)
        if (res.ok) {
          const list = await res.json()
          const arr = Array.isArray(list) ? list : []
          const withDate = arr.filter((s) => s && s.scheduledAt)
          const now = new Date()
          const upcoming = withDate.filter((s) => new Date(s.scheduledAt) >= now).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
          schedulesForCopy = upcoming.length > 0 ? upcoming : withDate.slice().sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)).slice(0, 1)
        }
      } catch (_) {}
    }
    return buildShareText(linksList ?? undefined, schedulesForCopy)
  }

  const saveShareIntro = async () => {
    if (!shareInfoCandidate) return
    setShareInfoIntroSaving(true)
    try {
      const res = await fetch(`/api/candidates/${shareInfoCandidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareIntro: shareInfoIntro }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save")
      setShareInfoCandidate((prev) => prev ? { ...prev, shareIntro: shareInfoIntro } : null)
      setCandidates((prev) => prev.map((c) => (c.id === shareInfoCandidate.id ? { ...c, shareIntro: shareInfoIntro } : c)))
      toast.success("Highlight / Intro saved")
    } catch (err) {
      toast.error(err.message || "Failed to save")
    } finally {
      setShareInfoIntroSaving(false)
    }
  }

  const copyShareInfo = async () => {
    const text = await ensureCvLinkThenBuildShareText()
    if (!text.trim()) {
      toast.error("Add a highlight/intro or select at least one field to copy")
      return
    }
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard – ready to paste in WhatsApp")
    setShareInfoCopied(true)
    setTimeout(() => setShareInfoCopied(false), 2500)
  }

  const shareViaWhatsApp = async () => {
    const text = await ensureCvLinkThenBuildShareText()
    if (!text.trim()) {
      toast.error("Add a highlight/intro or select at least one field to share")
      return
    }
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer")
  }

  const shareNative = async () => {
    const text = await ensureCvLinkThenBuildShareText()
    if (!text.trim()) {
      toast.error("Add a highlight/intro or select at least one field to share")
      return
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: "Candidate info", text }).catch(() => toast.error("Share cancelled or failed"))
    } else {
      copyShareInfo()
    }
  }

  useEffect(() => {
    setPage(1)
  }, [searchQuery, positionFilter, filterLocation, filterPhone, filterCandidateId, filterResumeNotUpdated6, appliedDateFrom, appliedDateTo, updatedAtFrom, updatedAtTo, outletFilter])

  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(), searchQuery ? 300 : 0)
    return () => clearTimeout(t)
  }, [page, limit, searchQuery, positionFilter, locationFilter, isActiveFilter, filterLocation, filterPhone, filterCandidateId, filterResumeNotUpdated6, appliedDateFrom, appliedDateTo, updatedAtFrom, updatedAtTo, outletFilter])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      positionFilter.forEach((p) => params.append("positions", p))
      if (searchQuery) params.append("search", searchQuery)
      locationFilter.forEach((loc) => params.append("locations", loc))
      if (isActiveFilter !== "all") params.append("isActive", isActiveFilter)
      if (filterLocation.trim()) params.append("location", filterLocation.trim())
      if (filterPhone.trim()) params.append("phone", filterPhone.trim())
      if (filterCandidateId.trim()) params.append("candidateId", filterCandidateId.trim())
      if (filterResumeNotUpdated6) params.append("resumeNotUpdatedMonths", "6")
      if (appliedDateFrom.trim()) params.append("appliedDateFrom", appliedDateFrom.trim())
      if (appliedDateTo.trim()) params.append("appliedDateTo", appliedDateTo.trim())
      if (updatedAtFrom.trim()) params.append("updatedAtFrom", updatedAtFrom.trim())
      if (updatedAtTo.trim()) params.append("updatedAtTo", updatedAtTo.trim())
      outletFilter.forEach((oid) => params.append("outletIds", String(oid)))
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
      positionFilter.forEach((p) => params.append("positions", p))
      if (searchQuery) params.append("search", searchQuery)
      locationFilter.forEach((loc) => params.append("locations", loc))
      if (isActiveFilter !== "all") params.append("isActive", isActiveFilter)
      if (filterLocation.trim()) params.append("location", filterLocation.trim())
      if (filterPhone.trim()) params.append("phone", filterPhone.trim())
      if (filterCandidateId.trim()) params.append("candidateId", filterCandidateId.trim())
      if (filterResumeNotUpdated6) params.append("resumeNotUpdatedMonths", "6")
      if (appliedDateFrom.trim()) params.append("appliedDateFrom", appliedDateFrom.trim())
      if (appliedDateTo.trim()) params.append("appliedDateTo", appliedDateTo.trim())
      if (updatedAtFrom.trim()) params.append("updatedAtFrom", updatedAtFrom.trim())
      if (updatedAtTo.trim()) params.append("updatedAtTo", updatedAtTo.trim())
      outletFilter.forEach((oid) => params.append("outletIds", String(oid)))
      params.set("page", "1")
      params.set("limit", "10000")
      const res = await fetch(`/api/candidates?${params.toString()}`)
      if (!res.ok) throw new Error("Export failed")
      const json = await res.json()
      const list = json.data ?? []
      const headers = ["UID", "Name", "Phone", "Email", "Position", "Status", "Experience", "Location", "Active", "Applied Date", "Expected Salary", "Rating", "Remark", "Added by", "Last Updated"]
      const rows = list.map((c) => [
        c.id,
        c.name,
        c.phone,
        c.email ?? "",
        c.position ?? "",
        c.status ?? "",
        c.experience ?? "",
        c.location ?? "",
        c.isActive !== false ? "Active" : "Inactive",
        c.appliedDate ?? "",
        c.salary ?? "",
        c.rating ?? "",
        c.remark ?? "",
        (c.addedBy || (c.addedByHr && c.addedByHr.name)) ?? "",
        c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
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
      console.error(err)
      toast.error(err.message || "Export failed")
    } finally {
      setExportingCsv(false)
    }
  }

  const filteredOutlets = useMemo(() => {
    if (!outletFilterSearch.trim()) return outlets
    const search = outletFilterSearch.toLowerCase()
    return outlets.filter((o) => o.name.toLowerCase().includes(search))
  }, [outlets, outletFilterSearch])

  const filteredCandidates = candidates
  const moreFiltersCount = [locationFilter.length > 0, outletFilter.length > 0, filterPhone.trim(), filterCandidateId.trim(), filterResumeNotUpdated6, appliedDateFrom.trim(), appliedDateTo.trim(), updatedAtFrom.trim(), updatedAtTo.trim()].filter(Boolean).length

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

  const removeScheduleSlot = (index) => {
    setScheduleSlots((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const updateScheduleSlot = (index, field, value) => {
    setScheduleSlots((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
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

  const handleSetActiveStatus = async (candidateId, isActive, reason, category) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) { toast.error("Please log in to change active status"); return }
    const body = { isActive }
    if (isActive === false) {
      if (reason != null) body.inactiveReason = String(reason).trim() || null
      if (category && ["behaviour", "theft_fraud", "absconded", "skill_mismatch"].includes(category)) body.inactiveReasonCategory = category
    }
    const res = await fetch(`/api/candidates/${candidateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Failed to update")
    }
    toast.success(isActive ? "Candidate activated" : "Candidate marked inactive")
    setInactiveModalOpen(false)
    setInactiveCandidate(null)
    setInactiveReasonCategory("")
    setInactiveReason("")
    fetchCandidates()
  }

  const handleMarkInactiveClick = (candidate) => {
    setInactiveCandidate(candidate)
    setInactiveReasonCategory("")
    setInactiveReason("")
    setInactiveModalOpen(true)
  }

  const handleInactiveModalSubmit = async () => {
    if (!inactiveCandidate) return
    setInactiveSubmitting(true)
    try {
      await handleSetActiveStatus(inactiveCandidate.id, false, inactiveReason, inactiveReasonCategory || null)
    } catch (err) {
      toast.error(err.message || "Failed to update")
    } finally {
      setInactiveSubmitting(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editCandidate) return
    setEditSubmitting(true)
    try {
      const payload = { ...editForm }
      if (Array.isArray(payload.location)) payload.location = payload.location.filter(Boolean).join(", ")
      const res = await fetch(`/api/candidates/${editCandidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const addAttachmentFiles = (files) => {
    const list = Array.from(files || []).filter((f) => f && f.size > 0 && f.size <= MAX_UPLOAD_MB * 1024 * 1024)
    const newItems = list.map((file) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, name: file.name }))
    setAddFormData((prev) => ({ ...prev, attachmentFiles: [...(prev.attachmentFiles || []), ...newItems] }))
  }
  const removeAttachmentFile = (id) => {
    setAddFormData((prev) => ({ ...prev, attachmentFiles: (prev.attachmentFiles || []).filter((a) => a.id !== id) }))
  }
  const moveAttachment = (index, dir) => {
    const list = [...(addFormData.attachmentFiles || [])]
    const ni = dir === "up" ? index - 1 : index + 1
    if (ni < 0 || ni >= list.length) return
    ;[list[index], list[ni]] = [list[ni], list[index]]
    setAddFormData((prev) => ({ ...prev, attachmentFiles: list }))
  }

  const handleAddSubmit = async (e, options = {}) => {
    e.preventDefault()
    const { openScheduleAfter } = options
    setAddPhoneError("")
    if (!addFormData.name?.trim()) {
      toast.error("Name is required")
      return
    }
    const phoneDigits = String(addFormData.phone || "").replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      setAddPhoneError("Mobile number must be exactly 10 digits; no spaces allowed.")
      return
    }
    try {
      const checkRes = await fetch(`/api/candidates?phoneExact=${encodeURIComponent(phoneDigits)}&limit=1`)
      if (checkRes.ok) {
        const checkJson = await checkRes.json()
        if ((checkJson.data || []).length > 0) {
          setAddPhoneError("A candidate with this mobile number already exists.")
          return
        }
      }
    } catch {
      // continue; API will also validate on create
    }
    if (!addFormData.position?.trim()) {
      toast.error("Position is required")
      return
    }
    const locArr = Array.isArray(addFormData.location) ? addFormData.location : (addFormData.location ? [addFormData.location] : [])
    if (locArr.length === 0) {
      toast.error("At least one location is required")
      return
    }
    const files = addFormData.attachmentFiles || []
    if (files.length === 0) {
      toast.error("Please upload at least one file (resume or document)")
      return
    }
    setAddSubmitting(true)
    setUploadProgress(null)
    try {
      let attachments = []
      if (files.length > 0) {
        setUploadProgress({ current: 0, total: files.length, percent: 0 })
        for (let i = 0; i < files.length; i++) {
          setUploadProgress({ current: i + 1, total: files.length, percent: Math.round(((i + 1) / files.length) * 100) })
          const fd = new FormData()
          fd.append("file", files[i].file)
          const up = await fetch("/api/upload", { method: "POST", body: fd })
          if (!up.ok) throw new Error((await up.json()).error || "Upload failed")
          const { path, name } = await up.json()
          attachments.push({ path, name, order: i })
        }
        setUploadProgress(null)
      }
      const hasResumeFile = addFormData.resume && typeof addFormData.resume === "object" && addFormData.resume.name
      const locationStr = Array.isArray(addFormData.location) ? addFormData.location.filter(Boolean).join(", ") : (addFormData.location || "")
      const payloadPhone = phoneDigits
      let response
      if (hasResumeFile && attachments.length === 0) {
        const formData = new FormData()
        const { resume, attachmentFiles, location: _loc, phone: _p, ...rest } = addFormData
        Object.keys(rest).forEach((key) => {
          const v = rest[key]
          if (v != null && v !== "") formData.append(key, v)
        })
        formData.append("location", locationStr)
        formData.append("phone", payloadPhone)
        formData.append("resume", resume)
        response = await fetch("/api/candidates", { method: "POST", body: formData })
      } else {
        const { resume, attachmentFiles, ...payload } = addFormData
        payload.location = locationStr
        payload.phone = payloadPhone
        if (attachments.length > 0) {
          payload.attachments = attachments
          if (!payload.resume) payload.resume = attachments[0]?.path
        }
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
      const created = await response.json()
      toast.success("Candidate added successfully")
      setAddFormData(initialAddForm)
      setAddModalOpen(false)
      setAddPhoneError("")
      fetchCandidates()
      if (openScheduleAfter && created && created.id) {
        setScheduleCandidate({ ...created, appliedDate: created.appliedDate || created.appliedDate })
        setScheduleSlots([{ outletId: "", scheduledAt: "", type: "In-person", status: "standby-cv", remarks: "" }])
        setScheduleModalOpen(true)
      }
    } catch (error) {
      console.error("Error adding candidate:", error)
      toast.error(error.message || "Failed to add candidate")
      setUploadProgress(null)
    } finally {
      setAddSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Applicants</h1>
          <div className="flex items-center space-x-2">
            {allowedMap.export_csv !== false && (
              <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exportingCsv}>
                {exportingCsv ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export
              </Button>
            )}
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
                  <Input
                    id="add-phone"
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10 digits, no spaces"
                    value={addFormData.phone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 10)
                      setAddFormData({ ...addFormData, phone: v })
                      if (addPhoneError) setAddPhoneError("")
                    }}
                  />
                  {addPhoneError && <p className="text-sm text-red-600 mt-1">{addPhoneError}</p>}
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
                  <Label>Experience (optional)</Label>
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
                  <Label>Location *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between font-normal min-h-10 flex-wrap h-auto py-2 gap-1">
                        <span className="truncate text-left">
                          {(Array.isArray(addFormData.location) ? addFormData.location : []).length === 0
                            ? "Select locations..."
                            : (Array.isArray(addFormData.location) ? addFormData.location : []).length === 1
                              ? (Array.isArray(addFormData.location) ? addFormData.location : [])[0]
                              : `${(Array.isArray(addFormData.location) ? addFormData.location : []).length} locations`}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                      <Input placeholder="Type to search or add..." value={addFormData.locationSearchInput ?? ""} onChange={(e) => setAddFormData((prev) => ({ ...prev, locationSearchInput: e.target.value }))} className="mb-2 h-9" />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {(addFormData.locationSearchInput ?? "").trim() && !locationOptions.some((l) => l.toLowerCase() === (addFormData.locationSearchInput ?? "").trim().toLowerCase()) && (
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent"
                            onClick={async () => {
                              const val = (addFormData.locationSearchInput ?? "").trim()
                              const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
                              if (token) {
                                try {
                                  const r = await fetch("/api/outlets/locations", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ value: val }) })
                                  if (r.ok) fetch("/api/outlets/locations").then((res) => (res.ok ? res.json() : [])).then(setLocationOptions)
                                } catch (_) {}
                              }
                              setAddFormData((prev) => ({ ...prev, location: [...(Array.isArray(prev.location) ? prev.location : []), val], locationSearchInput: "" }))
                            }}
                          >
                            <Plus className="h-4 w-4 shrink-0" /> Add &quot;{(addFormData.locationSearchInput ?? "").trim()}&quot;
                          </button>
                        )}
                        {locationOptions.filter((loc) => !(addFormData.locationSearchInput ?? "").trim() || loc.toLowerCase().includes((addFormData.locationSearchInput ?? "").toLowerCase())).map((loc) => {
                          const sel = Array.isArray(addFormData.location) ? addFormData.location : []
                          return (
                            <label key={loc} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent">
                              <Checkbox checked={sel.includes(loc)} onCheckedChange={(c) => setAddFormData((prev) => ({ ...prev, location: c ? [...(Array.isArray(prev.location) ? prev.location : []), loc] : (Array.isArray(prev.location) ? prev.location : []).filter((l) => l !== loc) }))} />
                              <span className="truncate">{loc}</span>
                            </label>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
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
              <div>
                <Label>Upload resume / files *</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">At least one file required. PDF, DOC, DOCX, or images (max {MAX_UPLOAD_MB}MB each). Order the list to set display order.</p>
                <label
                  htmlFor="add-attachments"
                  className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-green-500") }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-green-500") }}
                  onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-green-500"); addAttachmentFiles(e.dataTransfer.files) }}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max {MAX_UPLOAD_MB}MB)</p>
                </label>
                <Input
                  id="add-attachments"
                  type="file"
                  accept=".pdf,.doc,.docx,image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  multiple
                  onChange={(e) => { addAttachmentFiles(e.target.files); e.target.value = "" }}
                />
                {(addFormData.attachmentFiles || []).length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {(addFormData.attachmentFiles || []).map((a, idx) => (
                      <li key={a.id} className="flex items-center gap-2 p-2 rounded border bg-muted/50">
                        <span className="text-sm font-medium truncate flex-1">{a.name}</span>
                        <div className="flex gap-1 shrink-0">
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => moveAttachment(idx, "up")} disabled={idx === 0}>↑</Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => moveAttachment(idx, "down")} disabled={idx === (addFormData.attachmentFiles?.length || 0) - 1}>↓</Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => removeAttachmentFile(a.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {uploadProgress && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm font-medium text-green-800">Uploading file {uploadProgress.current} of {uploadProgress.total}…</p>
                    <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 transition-all duration-300" style={{ width: `${uploadProgress.percent}%` }} />
                    </div>
                  </div>
                )}
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
                <Button
                  type="button"
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 border-green-600 text-white"
                  disabled={addSubmitting}
                  onClick={(e) => handleAddSubmit(e, { openScheduleAfter: true })}
                >
                  {addSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                  Add candidate & schedule Interview
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

        <Dialog open={shareInfoOpen} onOpenChange={(open) => { setShareInfoOpen(open); if (!open) setShareInfoCopied(false) }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share info</DialogTitle>
              <DialogDescription>
                Select fields to include, then copy. Paste in WhatsApp to share with client.
              </DialogDescription>
            </DialogHeader>
            {shareInfoCandidate && (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="share-intro">Highlight / Intro</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Editable text – included at the bottom when you Copy all. Use {"{{interviewDate}}"} and {"{{interviewTime}}"} for auto date/time from next interview. Save to keep for this candidate.</p>
                  <Textarea
                    id="share-intro"
                    placeholder="e.g. Above candidate will be coming for Interview on {{interviewDate}} at {{interviewTime}}, Please share the feedback once the interview is done."
                    value={shareInfoIntro}
                    onChange={(e) => setShareInfoIntro(e.target.value)}
                    className="mt-2 min-h-[80px] resize-y"
                    rows={3}
                  />
                  <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={saveShareIntro} disabled={shareInfoIntroSaving}>
                    {shareInfoIntroSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save intro
                  </Button>
                </div>
                <p className="text-sm font-medium">Include in copy:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "name", label: "Name" },
                    { key: "phone", label: "Phone" },
                    { key: "email", label: "Email" },
                    { key: "position", label: "Position" },
                    { key: "experience", label: "Experience" },
                    { key: "location", label: "Location" },
                    { key: "appliedDate", label: "Applied Date" },
                    { key: "salary", label: "Expected Salary" },
                    { key: "status", label: "Status" },
                    { key: "cvLink", label: "CV Link" },
                    { key: "interview", label: "Interview (next schedule)" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={shareInfoFields[key] !== false}
                        onCheckedChange={(checked) => setShareInfoFields((prev) => ({ ...prev, [key]: !!checked }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="flex flex-col gap-3 pt-2 border-t">
                <div className="flex flex-wrap gap-2 items-center">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={copyShareInfo} disabled={shareInfoCopied}>
                    {shareInfoCopied ? (
                      <><Check className="w-4 h-4 mr-2" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copy all</>
                    )}
                  </Button>
                  {shareInfoCandidate && cvLinkByCandidateId(shareInfoCandidate.id) && (
                    <Button variant="outline" size="sm" onClick={copyCvLinkInShareModal} className="gap-1.5">
                      <Link2 className="w-4 h-4" /> Copy link
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShareInfoOpen(false)}>Close</Button>
                </div>
                <p className="text-xs text-muted-foreground">Click &quot;Copy link&quot; to copy the CV link and auto-include it in &quot;Copy all&quot;.</p>
                <p className="text-xs text-muted-foreground">Share via</p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={shareViaWhatsApp}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </Button>
                  {typeof navigator !== "undefined" && navigator.share && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={shareNative}>
                      <Share2 className="w-4 h-4" /> Share
                    </Button>
                  )}
                </div>
              </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={inactiveModalOpen} onOpenChange={(open) => { if (!open) { setInactiveModalOpen(false); setInactiveCandidate(null); setInactiveReasonCategory(""); setInactiveReason("") } else setInactiveModalOpen(open) }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Mark candidate inactive</DialogTitle>
              <DialogDescription>
                {inactiveCandidate ? `Select a category and optionally add a remark for why ${inactiveCandidate.name} is being marked inactive. This will be visible to other vendors and HR.` : "Select a category (optional) and add a remark (optional)."}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <Label>Reason category (optional)</Label>
                <Select value={inactiveReasonCategory || "none"} onValueChange={(v) => setInactiveReasonCategory(v === "none" ? "" : v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {INACTIVE_REASON_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inactive-reason">Remark / additional reason (optional)</Label>
                <Textarea
                  id="inactive-reason"
                  placeholder="e.g. Additional details..."
                  value={inactiveReason}
                  onChange={(e) => setInactiveReason(e.target.value)}
                  className="mt-2 min-h-[80px]"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setInactiveModalOpen(false); setInactiveCandidate(null); setInactiveReasonCategory(""); setInactiveReason("") }}>Cancel</Button>
                <Button disabled={inactiveSubmitting} onClick={handleInactiveModalSubmit}>
                  {inactiveSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserX className="w-4 h-4 mr-2" />}
                  Mark inactive
                </Button>
              </div>
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
                <p><span className="font-medium">Expected Salary:</span> {viewDetailsCandidate.salary || "—"}</p>
                <p><span className="font-medium">Source:</span> {viewDetailsCandidate.source || "—"}</p>
                {viewDetailsCandidate.skills && <p><span className="font-medium">Skills & Qualifications:</span> {viewDetailsCandidate.skills}</p>}
                {viewDetailsCandidate.education && <p><span className="font-medium">Education:</span> {viewDetailsCandidate.education}</p>}
                {viewDetailsCandidate.previousEmployer && <p><span className="font-medium">Previous Employer:</span> {viewDetailsCandidate.previousEmployer}</p>}
                {viewDetailsCandidate.notes && <p><span className="font-medium">Internal Notes:</span> {viewDetailsCandidate.notes}</p>}
                {viewDetailsCandidate.isActive === false && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Inactive</p>
                    {viewDetailsCandidate.inactiveReasonCategory && (
                      <p className="mt-1 text-muted-foreground">
                        <span className="font-medium">Category:</span> {INACTIVE_REASON_CATEGORIES.find((c) => c.value === viewDetailsCandidate.inactiveReasonCategory)?.label ?? viewDetailsCandidate.inactiveReasonCategory}
                      </p>
                    )}
                    {viewDetailsCandidate.inactiveReason ? (
                      <p className="mt-1 text-muted-foreground"><span className="font-medium">Remark:</span> {viewDetailsCandidate.inactiveReason}</p>
                    ) : viewDetailsCandidate.inactiveReasonCategory ? null : (
                      <p className="mt-1 text-muted-foreground">No reason provided.</p>
                    )}
                  </div>
                )}
                {(() => {
                  const att = viewDetailsCandidate.attachments || []
                  const firstPath = viewDetailsCandidate.resume || (att[0] && att[0].path)
                  const allFiles = att.length > 0 ? att : (viewDetailsCandidate.resume ? [{ path: viewDetailsCandidate.resume, name: "Resume" }] : [])
                  return (
                    <>
                      <p><span className="font-medium">Resume:</span> {firstPath ? (
                        <a href={firstPath.startsWith("http") ? firstPath : firstPath} target="_blank" rel="noopener noreferrer" className="text-green-600 underline">View / Download</a>
                      ) : (
                        <span className="text-muted-foreground">Unavailable</span>
                      )}</p>
                      {allFiles.length > 1 && (
                        <p><span className="font-medium">Attached files:</span>
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
                      <p><span className="font-medium">Resume last updated:</span> {viewDetailsCandidate.resumeUpdatedAt ? new Date(viewDetailsCandidate.resumeUpdatedAt).toLocaleString("en-IN") : "—"}</p>
                      <p><span className="font-medium">Applied:</span> {viewDetailsCandidate.appliedDate}</p>
                      <p><span className="font-medium">Last updated:</span> {viewDetailsCandidate.updatedAt ? new Date(viewDetailsCandidate.updatedAt).toLocaleString("en-IN") : "—"}</p>
                    </>
                  )
                })()}
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
                  <Label>Location</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between font-normal min-h-10 flex-wrap h-auto py-2 gap-1">
                        <span className="truncate text-left">
                          {(Array.isArray(editForm.location) ? editForm.location : []).length === 0
                            ? "Select locations..."
                            : (Array.isArray(editForm.location) ? editForm.location : []).length === 1
                              ? (Array.isArray(editForm.location) ? editForm.location : [])[0]
                              : `${(Array.isArray(editForm.location) ? editForm.location : []).length} locations`}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                      <Input placeholder="Type to search or add..." value={editForm.locationSearchInput ?? ""} onChange={(e) => setEditForm((prev) => ({ ...prev, locationSearchInput: e.target.value }))} className="mb-2 h-9" />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {(editForm.locationSearchInput ?? "").trim() && !locationOptions.some((l) => l.toLowerCase() === (editForm.locationSearchInput ?? "").trim().toLowerCase()) && (
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent"
                            onClick={async () => {
                              const val = (editForm.locationSearchInput ?? "").trim()
                              const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
                              if (token) {
                                try {
                                  const r = await fetch("/api/outlets/locations", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ value: val }) })
                                  if (r.ok) fetch("/api/outlets/locations").then((res) => (res.ok ? res.json() : [])).then(setLocationOptions)
                                } catch (_) {}
                              }
                              setEditForm((prev) => ({ ...prev, location: [...(Array.isArray(prev.location) ? prev.location : []), val], locationSearchInput: "" }))
                            }}
                          >
                            <Plus className="h-4 w-4 shrink-0" /> Add &quot;{(editForm.locationSearchInput ?? "").trim()}&quot;
                          </button>
                        )}
                        {locationOptions.filter((loc) => !(editForm.locationSearchInput ?? "").trim() || loc.toLowerCase().includes((editForm.locationSearchInput ?? "").toLowerCase())).map((loc) => {
                          const sel = Array.isArray(editForm.location) ? editForm.location : []
                          return (
                            <label key={loc} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent">
                              <Checkbox checked={sel.includes(loc)} onCheckedChange={(c) => setEditForm((prev) => ({ ...prev, location: c ? [...(Array.isArray(prev.location) ? prev.location : []), loc] : (Array.isArray(prev.location) ? prev.location : []).filter((l) => l !== loc) }))} />
                              <span className="truncate">{loc}</span>
                            </label>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="edit-salary">Expected Salary</Label>
                  <Input id="edit-salary" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} />
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
                            if (idx <= 0) return
                            ;[list[idx - 1], list[idx]] = [list[idx], list[idx - 1]]
                            setEditForm((prev) => ({ ...prev, attachments: list }))
                          }} disabled={idx === 0}>↑</Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                            const list = [...(editForm.attachments || [])]
                            if (idx >= list.length - 1) return
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
              {editCandidate && (
                <div className="text-sm text-muted-foreground space-y-1">
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
              <div className="min-w-[200px]">
                <Popover open={positionDropdownOpen} onOpenChange={setPositionDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-normal min-h-10 flex-wrap h-auto py-2 gap-1">
                      <span className="truncate text-left">
                        {positionFilter.length === 0
                          ? "All Positions"
                          : positionFilter.length === 1
                            ? positionFilter[0]
                            : `${positionFilter.length} positions`}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                    <Input
                      placeholder="Type to search..."
                      value={positionSearchInput}
                      onChange={(e) => setPositionSearchInput(e.target.value)}
                      className="mb-2 h-9"
                    />
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {positionSearchInput.trim() &&
                        !positionOptions.some((p) => p.toLowerCase() === positionSearchInput.trim().toLowerCase()) &&
                        !positionFilter.some((p) => p.toLowerCase() === positionSearchInput.trim().toLowerCase()) && (
                          <button
                            type="button"
                            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent"
                            onClick={() => {
                              setPositionFilter((prev) => [...prev, positionSearchInput.trim()])
                              setPositionSearchInput("")
                            }}
                          >
                            <Plus className="h-4 w-4 shrink-0" />
                            Add &quot;{positionSearchInput.trim()}&quot;
                          </button>
                        )}
                      {positionOptions
                        .filter((pos) => !positionSearchInput.trim() || pos.toLowerCase().includes(positionSearchInput.toLowerCase()))
                        .map((pos) => (
                          <label key={pos} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent">
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
                        ))}
                      {positionOptions.filter((pos) => !positionSearchInput.trim() || pos.toLowerCase().includes(positionSearchInput.toLowerCase())).length === 0 &&
                        !(positionSearchInput.trim() && !positionOptions.some((p) => p.toLowerCase() === positionSearchInput.trim().toLowerCase())) && (
                          <p className="text-sm text-muted-foreground py-2 px-2">No positions match</p>
                        )}
                    </div>
                    {positionFilter.length > 0 && (
                      <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setPositionFilter([])}>
                        Clear selection
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
              <div className="min-w-[140px]">
                <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                  <SelectTrigger><SelectValue placeholder="Active" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => { setPositionFilter([]); setLocationFilter([]); setOutletFilter([]); setOutletFilterSearch(""); setIsActiveFilter("all"); setSearchQuery(""); setFilterLocation(""); setFilterPhone(""); setFilterCandidateId(""); setFilterResumeNotUpdated6(false); setAppliedDateFrom(""); setAppliedDateTo(""); setUpdatedAtFrom(""); setUpdatedAtTo("") }}>
                  Clear Filters
                </Button>
                <Popover open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> More Filters{moreFiltersCount ? ` (${moreFiltersCount})` : ""}</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h4 className="font-medium">More filters</h4>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Popover open={locationDropdownOpen} onOpenChange={setLocationDropdownOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between font-normal min-h-10 flex-wrap h-auto py-2 gap-1">
                              <span className="truncate text-left">
                                {locationFilter.length === 0 ? "All locations" : locationFilter.length === 1 ? locationFilter[0] : `${locationFilter.length} locations`}
                              </span>
                              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                            <Input placeholder="Type to search or add..." value={locationSearchInput} onChange={(e) => setLocationSearchInput(e.target.value)} className="mb-2 h-9" />
                            <div className="max-h-60 overflow-y-auto space-y-1">
                              {locationSearchInput.trim() && !locationOptions.some((l) => l.toLowerCase() === locationSearchInput.trim().toLowerCase()) && !locationFilter.some((l) => l.toLowerCase() === locationSearchInput.trim().toLowerCase()) && (
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent"
                                  onClick={async () => {
                                    const val = locationSearchInput.trim()
                                    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
                                    if (token) {
                                      try {
                                        const r = await fetch("/api/outlets/locations", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ value: val }) })
                                        if (r.ok) {
                                          const list = await fetch("/api/outlets/locations").then((res) => (res.ok ? res.json() : []))
                                          setLocationOptions(list)
                                          setLocationFilter((prev) => [...prev, val])
                                        } else setLocationFilter((prev) => [...prev, val])
                                      } catch { setLocationFilter((prev) => [...prev, val]) }
                                    } else setLocationFilter((prev) => [...prev, val])
                                    setLocationSearchInput("")
                                  }}
                                >
                                  <Plus className="h-4 w-4 shrink-0" /> Add &quot;{locationSearchInput.trim()}&quot;
                                </button>
                              )}
                              {locationOptions.filter((loc) => !locationSearchInput.trim() || loc.toLowerCase().includes(locationSearchInput.toLowerCase())).map((loc) => (
                                <label key={loc} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent">
                                  <Checkbox checked={locationFilter.includes(loc)} onCheckedChange={(c) => setLocationFilter((prev) => (c ? [...prev, loc] : prev.filter((l) => l !== loc)))} />
                                  <span className="truncate">{loc}</span>
                                </label>
                              ))}
                            </div>
                            {locationFilter.length > 0 && <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setLocationFilter([])}>Clear selection</Button>}
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Outlet (scheduled at)</Label>
                        <Input
                          placeholder="Search outlets..."
                          value={outletFilterSearch}
                          onChange={(e) => setOutletFilterSearch(e.target.value)}
                          className="mb-2"
                        />
                        <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                          {filteredOutlets.length === 0 ? (
                            <span className="text-muted-foreground text-xs">No outlets found</span>
                          ) : (
                            filteredOutlets.map((o) => (
                              <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5">
                                <Checkbox checked={outletFilter.includes(o.id)} onCheckedChange={(c) => setOutletFilter((prev) => c ? [...prev, o.id] : prev.filter((id) => id !== o.id))} />
                                <span className="truncate flex-1">{o.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                        {outletFilter.length > 0 && (
                          <Button variant="ghost" size="sm" className="w-full mt-1 text-xs" onClick={() => setOutletFilter([])}>
                            Clear selection ({outletFilter.length})
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="filter-phone">Phone number</Label>
                        <Input id="filter-phone" placeholder="e.g. 98765..." value={filterPhone} onChange={(e) => setFilterPhone(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="filter-candidate-id">Candidate ID</Label>
                        <Input id="filter-candidate-id" type="text" placeholder="e.g. 1" value={filterCandidateId} onChange={(e) => setFilterCandidateId(e.target.value)} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="filter-resume-6" checked={filterResumeNotUpdated6} onCheckedChange={(c) => setFilterResumeNotUpdated6(!!c)} />
                        <Label htmlFor="filter-resume-6" className="font-normal cursor-pointer">Resume not updated in 6+ months</Label>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Applied date range</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="date" value={appliedDateFrom} onChange={(e) => setAppliedDateFrom(e.target.value)} placeholder="From" />
                          <Input type="date" value={appliedDateTo} onChange={(e) => setAppliedDateTo(e.target.value)} placeholder="To" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">Last updated range</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="date" value={updatedAtFrom} onChange={(e) => setUpdatedAtFrom(e.target.value)} placeholder="From" />
                          <Input type="date" value={updatedAtTo} onChange={(e) => setUpdatedAtTo(e.target.value)} placeholder="To" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => { setLocationFilter([]); setOutletFilter([]); setOutletFilterSearch(""); setFilterPhone(""); setFilterCandidateId(""); setFilterResumeNotUpdated6(false); setAppliedDateFrom(""); setAppliedDateTo(""); setUpdatedAtFrom(""); setUpdatedAtTo("") }}>Clear</Button>
                        <Button size="sm" onClick={() => setMoreFiltersOpen(false)}>Apply</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {allowedMap.bulk_status !== false && selectedCandidates.length > 0 && (
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
                            {allowedMap.action_view_details !== false && <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>}
                            {allowedMap.action_share_info !== false && <DropdownMenuItem onClick={() => openShareInfo(candidate)}><Share2 className="w-4 h-4 mr-2" /> Share info</DropdownMenuItem>}
                            {allowedMap.action_edit !== false && <DropdownMenuItem onClick={() => { setEditCandidate(candidate); setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location ? candidate.location.split(",").map((s) => s.trim()).filter(Boolean) : [], salary: candidate.salary || "", attachments: candidate.attachments || [] }); setEditModalOpen(true) }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>}
                            {allowedMap.action_call !== false && <DropdownMenuItem asChild><a href={`tel:${candidate.phone}`}><Phone className="w-4 h-4 mr-2" /> Call</a></DropdownMenuItem>}
                            {allowedMap.action_email !== false && <DropdownMenuItem asChild><a href={candidate.email ? `mailto:${candidate.email}` : "#"}><Mail className="w-4 h-4 mr-2" /> Email</a></DropdownMenuItem>}
                            {allowedMap.action_schedule_interview !== false && <DropdownMenuItem onClick={() => openScheduleModal(candidate)} disabled={candidate.isActive === false}><Calendar className="w-4 h-4 mr-2" /> Schedule Interview</DropdownMenuItem>}
                            {allowedMap.action_download_resume !== false && <DropdownMenuItem onClick={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")} disabled={!candidate.resume}><Download className="w-4 h-4 mr-2" /> Download Resume</DropdownMenuItem>}
                            {allowedMap.action_history !== false && <DropdownMenuItem onClick={() => openHistoryModal(candidate)}><History className="w-4 h-4 mr-2" /> History</DropdownMenuItem>}
                            {allowedMap.action_activate_cv_link !== false && <DropdownMenuItem onClick={() => handleActivateCvLink(candidate)}><Link2 className="w-4 h-4 mr-2" /> Activate CV Link</DropdownMenuItem>}
                            {allowedMap.action_deactivate_cv_link !== false && <DropdownMenuItem onClick={() => handleDeactivateCvLink(candidate)}><Link2 className="w-4 h-4 mr-2" /> Deactivate CV Link</DropdownMenuItem>}
                            {allowedMap.action_mark_inactive !== false && candidate.isActive !== false && <DropdownMenuItem onClick={() => handleMarkInactiveClick(candidate)}><UserX className="w-4 h-4 mr-2" /> Mark inactive</DropdownMenuItem>}
                            {allowedMap.action_activate !== false && candidate.isActive === false && (sessionUser?.id === candidate.inactivatedByAdminUserId || sessionUser?.role === "super_admin") && <DropdownMenuItem onClick={() => handleSetActiveStatus(candidate.id, true)}><UserCheck className="w-4 h-4 mr-2" /> Activate</DropdownMenuItem>}
                            {allowedMap.action_delete !== false && <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(candidate.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        {getStatusBadge(candidate.status)}
                        <Badge variant={candidate.isActive !== false ? "default" : "secondary"} className={candidate.isActive !== false ? "bg-green-600" : ""}>{candidate.isActive !== false ? "Active" : "Inactive"}</Badge>
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
                    <Checkbox checked={filteredCandidates.length > 0 && selectedCandidates.length === filteredCandidates.length} onCheckedChange={handleSelectAll} />
                  </TableHead>
                  {visibleColumns.uid !== false && <TableHead>UID</TableHead>}
                  {visibleColumns.candidate !== false && <TableHead>Candidate</TableHead>}
                  {visibleColumns.position !== false && <TableHead>Position</TableHead>}
                  {visibleColumns.status !== false && <TableHead>Status</TableHead>}
                  {visibleColumns.experience !== false && <TableHead>Experience</TableHead>}
                  {visibleColumns.location !== false && <TableHead>Location</TableHead>}
                  {visibleColumns.active !== false && <TableHead>Active</TableHead>}
                  {visibleColumns.appliedDate !== false && <TableHead>Applied Date</TableHead>}
                  {visibleColumns.salary !== false && <TableHead>Expected Salary</TableHead>}
                  {visibleColumns.rating !== false && <TableHead>Rating</TableHead>}
                  {visibleColumns.remark !== false && <TableHead>Remark</TableHead>}
                  {visibleColumns.addedBy !== false && <TableHead>Added by</TableHead>}
                  {visibleColumns.lastUpdated !== false && <TableHead>Last Updated</TableHead>}
                  {visibleColumns.cvLink !== false && <TableHead>CV Link</TableHead>}
                  {visibleColumns.viewCv !== false && <TableHead>View CV</TableHead>}
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
                      )}
                      {visibleColumns.position !== false && <TableCell>{candidate.position}</TableCell>}
                      {visibleColumns.status !== false && <TableCell>{getStatusBadge(candidate.status)}</TableCell>}
                      {visibleColumns.experience !== false && <TableCell>{candidate.experience}</TableCell>}
                      {visibleColumns.location !== false && <TableCell>{candidate.location}</TableCell>}
                      {visibleColumns.active !== false && (
                        <TableCell>
                          <Badge variant={candidate.isActive !== false ? "default" : "secondary"} className={candidate.isActive !== false ? "bg-green-600" : ""}>
                            {candidate.isActive !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      )}
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
                      {visibleColumns.remark !== false && <TableCell className="max-w-[180px] truncate" title={candidate.remark ?? ""}>{candidate.remark ?? "—"}</TableCell>}
                      {visibleColumns.addedBy !== false && <TableCell>{(candidate.addedBy || (candidate.addedByHr && candidate.addedByHr.name)) ?? "—"}</TableCell>}
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
                      {visibleColumns.viewCv !== false && (
                        <TableCell>
                          {(() => {
                            const att = candidate.attachments || []
                            const firstPath = candidate.resume || (att[0] && att[0].path)
                            const url = firstPath ? (firstPath.startsWith("http") ? firstPath : `${typeof window !== "undefined" ? window.location.origin : ""}${firstPath.startsWith("/") ? firstPath : `/${firstPath}`}`) : null
                            return url ? (
                              <Button variant="outline" size="sm" className="gap-1" asChild>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-3 h-3" /> View CV
                                </a>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )
                          })()}
                        </TableCell>
                      )}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {allowedMap.action_view_details !== false && (
                              <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_share_info !== false && (
                              <DropdownMenuItem onClick={() => openShareInfo(candidate)}>
                                <Share2 className="w-4 h-4 mr-2" /> Share info
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_edit !== false && (
                              <DropdownMenuItem onClick={() => {
                                setEditCandidate(candidate)
                                setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location ? candidate.location.split(",").map((s) => s.trim()).filter(Boolean) : [], salary: candidate.salary || "", attachments: candidate.attachments || [] })
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
                            {allowedMap.action_mark_inactive !== false && candidate.isActive !== false && (
                              <DropdownMenuItem onClick={() => handleMarkInactiveClick(candidate)}>
                                <UserX className="w-4 h-4 mr-2" /> Mark inactive
                              </DropdownMenuItem>
                            )}
                            {allowedMap.action_activate !== false && candidate.isActive === false && (sessionUser?.id === candidate.inactivatedByAdminUserId || sessionUser?.role === "super_admin") && (
                              <DropdownMenuItem onClick={() => handleSetActiveStatus(candidate.id, true)}>
                                <UserCheck className="w-4 h-4 mr-2" /> Activate
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
              <div className="text-center py-8 text-gray-500">No candidates found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
