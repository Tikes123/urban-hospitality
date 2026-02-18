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
import { CandidateActionMenu } from "@/components/modals/candidate-action-menu"
import { CandidateViewDetailsModal } from "@/components/modals/candidate-view-details-modal"
import { CandidateHistoryModal } from "@/components/modals/candidate-history-modal"
import { CandidateShareInfoModal } from "@/components/modals/candidate-share-info-modal"
import { CandidateMarkInactiveModal } from "@/components/modals/candidate-mark-inactive-modal"
import { CandidateDeleteConfirmModal } from "@/components/modals/candidate-delete-confirm-modal"

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
  const [historyReplacements, setHistoryReplacements] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const HISTORY_PAGE_SIZE = 10
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [viewDetailsCandidate, setViewDetailsCandidate] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", position: "", status: "", location: [], salary: "", attachments: [] })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [replaceWithChecked, setReplaceWithChecked] = useState(false)
  const [replacementForm, setReplacementForm] = useState({
    replacementCandidateId: "", replacementCandidateName: "", outletId: "", position: "", replacedHrId: "", replacementHrId: "", dateOfJoining: "", exitDate: "", salary: "",
  })
  const [replacementCandidateSearch, setReplacementCandidateSearch] = useState("")
  const [replacementCandidateOptions, setReplacementCandidateOptions] = useState([])
  const [replacementCandidateDropdownOpen, setReplacementCandidateDropdownOpen] = useState(false)
  const [hrList, setHrList] = useState([])
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [filterLocation, setFilterLocation] = useState("") // single select: empty string = all
  const [locationFilter, setLocationFilter] = useState([]) // keep for backward compatibility but not used
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearchInput, setLocationSearchInput] = useState("")
  const [filterPhone, setFilterPhone] = useState("")
  const [filterCandidateId, setFilterCandidateId] = useState("")
  const [filterResumeNotUpdated6, setFilterResumeNotUpdated6] = useState(false)
  const [appliedDateFrom, setAppliedDateFrom] = useState("")
  const [appliedDateTo, setAppliedDateTo] = useState("")
  const [updatedAtFrom, setUpdatedAtFrom] = useState("")
  const [updatedAtTo, setUpdatedAtTo] = useState("")
  const [outletFilter, setOutletFilter] = useState([]) // keep for backward compatibility but not used
  const [filterOutlet, setFilterOutlet] = useState("") // single select: empty string = all
  const [outletFilterSearch, setOutletFilterSearch] = useState("") // search filter for outlets
  const [isActiveFilter, setIsActiveFilter] = useState("all") // "all" | "active" | "inactive"
  const [sessionUser, setSessionUser] = useState(null) // { id, role } for activate permission
  const [inactiveModalOpen, setInactiveModalOpen] = useState(false)
  const [inactiveCandidate, setInactiveCandidate] = useState(null)
  const [inactiveReasonCategory, setInactiveReasonCategory] = useState("")
  const [inactiveReason, setInactiveReason] = useState("")
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
        .then((data) => {
          if (data.valid && data.user) {
            setSessionUser({ id: data.user.id, role: data.role })
            if (data.user.id) fetch(`/api/hr?vendorId=${data.user.id}&limit=200`).then((r) => r.ok ? r.json() : {}).then((d) => setHrList(d.data ?? [])).catch(() => setHrList([]))
          }
        })
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
  }, [searchQuery, positionFilter, filterLocation, filterPhone, filterResumeNotUpdated6, appliedDateFrom, appliedDateTo, updatedAtFrom, updatedAtTo, filterOutlet])

  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(), searchQuery ? 300 : 0)
    return () => clearTimeout(t)
  }, [page, limit, searchQuery, positionFilter, isActiveFilter, filterLocation, filterPhone, filterResumeNotUpdated6, appliedDateFrom, appliedDateTo, updatedAtFrom, updatedAtTo, filterOutlet])

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
      if (filterResumeNotUpdated6) params.append("resumeNotUpdatedMonths", "6")
      if (appliedDateFrom.trim()) params.append("appliedDateFrom", appliedDateFrom.trim())
      if (appliedDateTo.trim()) params.append("appliedDateTo", appliedDateTo.trim())
      if (updatedAtFrom.trim()) params.append("updatedAtFrom", updatedAtFrom.trim())
      if (updatedAtTo.trim()) params.append("updatedAtTo", updatedAtTo.trim())
      if (filterOutlet.trim()) params.append("outletIds", filterOutlet.trim())
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

  const handleDelete = (candidate) => {
    setDeleteCandidate(candidate)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async (candidate) => {
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete")
      toast.success("Candidate deleted successfully")
      fetchCandidates()
    } catch (error) {
      toast.error(error.message || "Failed to delete candidate")
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
      if (filterResumeNotUpdated6) params.append("resumeNotUpdatedMonths", "6")
      if (appliedDateFrom.trim()) params.append("appliedDateFrom", appliedDateFrom.trim())
      if (appliedDateTo.trim()) params.append("appliedDateTo", appliedDateTo.trim())
      if (updatedAtFrom.trim()) params.append("updatedAtFrom", updatedAtFrom.trim())
      if (updatedAtTo.trim()) params.append("updatedAtTo", updatedAtTo.trim())
      if (filterOutlet.trim()) params.append("outletIds", filterOutlet.trim())
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

  const filteredCandidates = candidates
  const moreFiltersCount = [filterLocation.trim(), filterOutlet.trim(), filterPhone.trim(), filterResumeNotUpdated6, appliedDateFrom.trim(), appliedDateTo.trim(), updatedAtFrom.trim(), updatedAtTo.trim()].filter(Boolean).length

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


  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editCandidate) return
    setEditSubmitting(true)
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    try {
      const payload = { ...editForm }
      if (Array.isArray(payload.location)) payload.location = payload.location.filter(Boolean).join(", ")
      const res = await fetch(`/api/candidates/${editCandidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
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
      fetchCandidates()
    } catch (err) {
      toast.error(err.message || "Failed to update")
    } finally {
      setEditSubmitting(false)
    }
  }

  const searchReplacementCandidates = (q) => {
    if (!q || !q.trim()) { setReplacementCandidateOptions([]); return }
    const params = new URLSearchParams({ search: q.trim(), limit: "20" })
    fetch(`/api/candidates?${params}`)
      .then((res) => res.ok ? res.json() : { data: [] })
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? [])
        const exclude = editCandidate?.id ? list.filter((c) => c.id !== editCandidate.id) : list
        setReplacementCandidateOptions(exclude)
      })
      .catch(() => setReplacementCandidateOptions([]))
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

        <CandidateHistoryModal
          open={historyModalOpen}
          onOpenChange={setHistoryModalOpen}
          candidate={historyCandidate}
          schedules={historySchedules}
          replacements={historyReplacements}
          page={historyPage}
          onPageChange={setHistoryPage}
        />

        <CandidateShareInfoModal
          open={shareInfoOpen}
          onOpenChange={(open) => { setShareInfoOpen(open); if (!open) setShareInfoCopied(false) }}
          candidate={shareInfoCandidate}
          cvLinks={cvLinks}
          onSaveIntro={() => {
            setCandidates((prev) => prev.map((c) => (c.id === shareInfoCandidate?.id ? { ...c, shareIntro: shareInfoIntro } : c)))
            fetchCandidates()
          }}
          onRefresh={fetchCvLinks}
        />

        <CandidateMarkInactiveModal
          open={inactiveModalOpen}
          onOpenChange={(open) => { if (!open) { setInactiveModalOpen(false); setInactiveCandidate(null); setInactiveReasonCategory(""); setInactiveReason("") } else setInactiveModalOpen(open) }}
          candidate={inactiveCandidate}
          onSubmit={async (candidateId, reason, category) => {
            await handleSetActiveStatus(candidateId, false, reason, category || null)
            setInactiveModalOpen(false)
            setInactiveCandidate(null)
            setInactiveReasonCategory("")
            setInactiveReason("")
          }}
        />


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
                  <Input id="edit-salary" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} placeholder="Add or edit salary" />
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
                          <SelectContent>
                            {outlets.map((o) => (<SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Position (at outlet)</Label>
                        <Input value={replacementForm.position} onChange={(e) => setReplacementForm((prev) => ({ ...prev, position: e.target.value }))} placeholder="e.g. sous-chef" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Replaced candidate HR (who was handling this candidate)</Label>
                        <Select value={replacementForm.replacedHrId ? String(replacementForm.replacedHrId) : ""} onValueChange={(v) => setReplacementForm((prev) => ({ ...prev, replacedHrId: v }))}>
                          <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">— None —</SelectItem>
                            {hrList.map((h) => (<SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Replacement candidate HR</Label>
                        <Select value={replacementForm.replacementHrId ? String(replacementForm.replacementHrId) : ""} onValueChange={(v) => setReplacementForm((prev) => ({ ...prev, replacementHrId: v }))}>
                          <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">— None —</SelectItem>
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
                        <Label>Exit date (this candidate)</Label>
                        <Input type="date" value={replacementForm.exitDate} onChange={(e) => setReplacementForm((prev) => ({ ...prev, exitDate: e.target.value }))} />
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
                <Button variant="outline" size="sm" onClick={() => { setPositionFilter([]); setLocationFilter([]); setIsActiveFilter("all"); setSearchQuery(""); setFilterLocation(""); setFilterOutlet(""); setFilterPhone(""); setFilterResumeNotUpdated6(false); setAppliedDateFrom(""); setAppliedDateTo(""); setUpdatedAtFrom(""); setUpdatedAtTo("") }}>
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
                        <Select value={filterLocation || "all"} onValueChange={(value) => setFilterLocation(value === "all" ? "" : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="All locations" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All locations</SelectItem>
                            {locationOptions.map((loc) => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Outlet (scheduled at)</Label>
                        <Select value={filterOutlet || "all"} onValueChange={(value) => setFilterOutlet(value === "all" ? "" : value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="All outlets" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All outlets</SelectItem>
                            {outlets.map((o) => (
                              <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="filter-phone">Phone number</Label>
                        <Input id="filter-phone" placeholder="e.g. 98765..." value={filterPhone} onChange={(e) => setFilterPhone(e.target.value)} />
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
                        <Button variant="ghost" size="sm" onClick={() => { setFilterLocation(""); setFilterOutlet(""); setFilterPhone(""); setFilterResumeNotUpdated6(false); setAppliedDateFrom(""); setAppliedDateTo(""); setUpdatedAtFrom(""); setUpdatedAtTo("") }}>Clear</Button>
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
                        <CandidateActionMenu
                          candidate={candidate}
                          allowedMap={allowedMap}
                          sessionUser={sessionUser}
                          onViewDetails={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}
                          onShareInfo={() => openShareInfo(candidate)}
                          onEdit={() => { setEditCandidate(candidate); setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location ? candidate.location.split(",").map((s) => s.trim()).filter(Boolean) : [], salary: candidate.salary || "", attachments: candidate.attachments || [] }); setReplaceWithChecked(false); setReplacementForm({ replacementCandidateId: "", replacementCandidateName: "", outletId: "", position: "", replacedHrId: "", replacementHrId: "", dateOfJoining: "", exitDate: "", salary: "" }); setEditModalOpen(true) }}
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
                        <CandidateActionMenu
                          candidate={candidate}
                          allowedMap={allowedMap}
                          sessionUser={sessionUser}
                          onViewDetails={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}
                          onShareInfo={() => openShareInfo(candidate)}
                          onEdit={() => {
                            setEditCandidate(candidate)
                            setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location ? candidate.location.split(",").map((s) => s.trim()).filter(Boolean) : [], salary: candidate.salary || "", attachments: candidate.attachments || [] })
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
              <div className="text-center py-8 text-gray-500">No candidates found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
