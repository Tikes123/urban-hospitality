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
} from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"
import { CANDIDATE_STATUSES, getStatusInfo, getStatusBadgeClass } from "@/lib/statusConfig"
import { getCvLinkUrl } from "@/lib/baseUrl"

const initialAddForm = {
  name: "",
  email: "",
  phone: "",
  position: "",
  experience: "",
  location: [], // multi-select; stored as array, sent as comma-separated
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
  attachmentFiles: [], // { id, file, name } - multiple files with order
}

export default function ViewApplicantsPage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
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
  const [isActiveFilter, setIsActiveFilter] = useState("all") // "all" | "active" | "inactive"
  const [sessionUser, setSessionUser] = useState(null) // { id, role } for activate permission
  const [cvLinks, setCvLinks] = useState([])
  const [locationOptions, setLocationOptions] = useState([]) // from outlets + custom
  const [uploadProgress, setUploadProgress] = useState(null) // { current, total, percent }
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
    { id: "lastUpdated", label: "Last Updated" },
    { id: "cvLink", label: "CV Link" },
    { id: "viewCv", label: "View CV" },
  ]
  const COLUMNS_STORAGE_KEY = "vendor-applicants-visible-columns"
  const [copiedCvLinkId, setCopiedCvLinkId] = useState(null)
  const [shareInfoOpen, setShareInfoOpen] = useState(false)
  const [shareInfoCandidate, setShareInfoCandidate] = useState(null)
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

  const openShareInfo = async (candidate) => {
    setShareInfoCandidate(candidate)
    setShareInfoOpen(true)
    setShareInfoSchedules([])
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/schedules`)
      if (res.ok) {
        const list = await res.json()
        const now = new Date()
        const upcoming = (Array.isArray(list) ? list : []).filter((s) => s.scheduledAt && new Date(s.scheduledAt) >= now).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        setShareInfoSchedules(upcoming)
      }
    } catch {}
  }

  const buildShareText = () => {
    if (!shareInfoCandidate) return ""
    const c = shareInfoCandidate
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
      const link = cvLinkByCandidateId(c.id)
      const cvUrl = link ? getCvLinkUrl(link.linkId) : "—"
      lines.push(`CV Link: ${cvUrl}`)
    }
    if (shareInfoFields.interview && shareInfoSchedules.length > 0) {
      const next = shareInfoSchedules[0]
      const dt = next.scheduledAt ? new Date(next.scheduledAt) : null
      const dateStr = dt ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}` : ""
      const timeStr = dt ? `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}` : ""
      lines.push(`Above candidate will be coming for Interview on ${dateStr} at ${timeStr}, Please share the feedback once the interview is done.`)
    }
    return lines.join("\n")
  }

  const copyShareInfo = () => {
    const text = buildShareText()
    if (!text) {
      toast.error("Select at least one field to copy")
      return
    }
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard – ready to paste in WhatsApp")
    setShareInfoCopied(true)
    setTimeout(() => setShareInfoCopied(false), 2500)
  }

  const shareViaWhatsApp = () => {
    const text = buildShareText()
    if (!text) {
      toast.error("Select at least one field to share")
      return
    }
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer")
  }

  const shareNative = () => {
    const text = buildShareText()
    if (!text) {
      toast.error("Select at least one field to share")
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
  }, [searchQuery, statusFilter, positionFilter, filterLocation, filterPhone, filterCandidateId, filterResumeNotUpdated6])

  useEffect(() => {
    const t = setTimeout(() => fetchCandidates(), searchQuery ? 300 : 0)
    return () => clearTimeout(t)
  }, [page, limit, searchQuery, statusFilter, positionFilter, locationFilter, isActiveFilter, filterLocation, filterPhone, filterCandidateId, filterResumeNotUpdated6])

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      positionFilter.forEach((p) => params.append("positions", p))
      if (searchQuery) params.append("search", searchQuery)
      locationFilter.forEach((loc) => params.append("locations", loc))
      if (isActiveFilter !== "all") params.append("isActive", isActiveFilter)
      if (filterLocation.trim()) params.append("location", filterLocation.trim())
      if (filterPhone.trim()) params.append("phone", filterPhone.trim())
      if (filterCandidateId.trim()) params.append("candidateId", filterCandidateId.trim())
      if (filterResumeNotUpdated6) params.append("resumeNotUpdatedMonths", "6")
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
  const moreFiltersCount = [locationFilter.length > 0, filterPhone.trim(), filterCandidateId.trim(), filterResumeNotUpdated6].filter(Boolean).length

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

  const handleSetActiveStatus = async (candidateId, isActive) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) { toast.error("Please log in to change active status"); return }
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update")
      }
      toast.success(isActive ? "Candidate activated" : "Candidate marked inactive")
      fetchCandidates()
    } catch (err) {
      toast.error(err.message || "Failed to update")
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
    const list = Array.from(files || []).filter((f) => f && f.size > 0 && f.size <= 5 * 1024 * 1024)
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

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!addFormData.name?.trim()) {
      toast.error("Name is required")
      return
    }
    if (!addFormData.phone?.trim()) {
      toast.error("Phone is required")
      return
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
      let response
      if (hasResumeFile && attachments.length === 0) {
        const formData = new FormData()
        const { resume, attachmentFiles, location: _loc, ...rest } = addFormData
        Object.keys(rest).forEach((key) => {
          const v = rest[key]
          if (v != null && v !== "") formData.append(key, v)
        })
        formData.append("location", locationStr)
        formData.append("resume", resume)
        response = await fetch("/api/candidates", { method: "POST", body: formData })
      } else {
        const { resume, attachmentFiles, ...payload } = addFormData
        payload.location = locationStr
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
      toast.success("Candidate added successfully")
      setAddFormData(initialAddForm)
      setAddModalOpen(false)
      fetchCandidates()
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
              <div className="space-y-4">
                <div>
                  <Label>Status (optional)</Label>
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
                  <Label>Availability (optional)</Label>
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
                <Label>Upload resume / files *</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">At least one file required. PDF, DOC, DOCX, or images (max 5MB each). Order the list to set display order.</p>
                <label
                  htmlFor="add-attachments"
                  className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-green-500") }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-green-500") }}
                  onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-green-500"); addAttachmentFiles(e.dataTransfer.files) }}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 5MB)</p>
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
                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={copyShareInfo} disabled={shareInfoCopied}>
                    {shareInfoCopied ? (
                      <><Check className="w-4 h-4 mr-2" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copy all</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShareInfoOpen(false)}>Close</Button>
                </div>
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
                <p className="text-xs text-muted-foreground mt-1 mb-2">Drag and drop or click to add. PDF, DOC, DOCX, or images (max 5MB). Order the list below.</p>
                <label
                  htmlFor="edit-attachments"
                  className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-green-500") }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-green-500") }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.classList.remove("border-green-500")
                    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.size > 0 && f.size <= 5 * 1024 * 1024)
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
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 5MB)</p>
                </label>
                <Input
                  id="edit-attachments"
                  type="file"
                  accept=".pdf,.doc,.docx,image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).filter((f) => f.size > 0 && f.size <= 5 * 1024 * 1024)
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
                <Button variant="outline" size="sm" onClick={() => { setStatusFilter("all"); setPositionFilter([]); setLocationFilter([]); setIsActiveFilter("all"); setSearchQuery(""); setFilterLocation(""); setFilterPhone(""); setFilterCandidateId(""); setFilterResumeNotUpdated6(false) }}>
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
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" size="sm" onClick={() => { setLocationFilter([]); setFilterPhone(""); setFilterCandidateId(""); setFilterResumeNotUpdated6(false) }}>Clear</Button>
                        <Button size="sm" onClick={() => setMoreFiltersOpen(false)}>Apply</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
                            <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openShareInfo(candidate)}><Share2 className="w-4 h-4 mr-2" /> Share info</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditCandidate(candidate); setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location ? candidate.location.split(",").map((s) => s.trim()).filter(Boolean) : [], salary: candidate.salary || "", attachments: candidate.attachments || [] }); setEditModalOpen(true) }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={`tel:${candidate.phone}`}><Phone className="w-4 h-4 mr-2" /> Call</a></DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={candidate.email ? `mailto:${candidate.email}` : "#"}><Mail className="w-4 h-4 mr-2" /> Email</a></DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openScheduleModal(candidate)}><Calendar className="w-4 h-4 mr-2" /> Schedule Interview</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => candidate.resume && window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")} disabled={!candidate.resume}><Download className="w-4 h-4 mr-2" /> Download Resume</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openHistoryModal(candidate)}><History className="w-4 h-4 mr-2" /> History</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActivateCvLink(candidate)}><Link2 className="w-4 h-4 mr-2" /> Activate CV Link</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeactivateCvLink(candidate)}><Link2 className="w-4 h-4 mr-2" /> Deactivate CV Link</DropdownMenuItem>
                            {candidate.isActive !== false && <DropdownMenuItem onClick={() => handleSetActiveStatus(candidate.id, false)}>Mark inactive</DropdownMenuItem>}
                            {candidate.isActive === false && (sessionUser?.id === candidate.inactivatedByAdminUserId || sessionUser?.role === "super_admin") && <DropdownMenuItem onClick={() => handleSetActiveStatus(candidate.id, true)}>Activate</DropdownMenuItem>}
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(candidate.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded truncate max-w-[120px]" title={cvUrl}>{cvUrl}</code>
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
                            <DropdownMenuItem onClick={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openShareInfo(candidate)}>
                              <Share2 className="w-4 h-4 mr-2" /> Share info
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditCandidate(candidate)
                              setEditForm({ name: candidate.name, phone: candidate.phone, email: candidate.email || "", position: candidate.position, status: candidate.status, location: candidate.location ? candidate.location.split(",").map((s) => s.trim()).filter(Boolean) : [], salary: candidate.salary || "", attachments: candidate.attachments || [] })
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
                            <DropdownMenuItem onClick={() => handleActivateCvLink(candidate)}>
                              <Link2 className="w-4 h-4 mr-2" /> Activate CV Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeactivateCvLink(candidate)}>
                              <Link2 className="w-4 h-4 mr-2" /> Deactivate CV Link
                            </DropdownMenuItem>
                            {candidate.isActive !== false && (
                              <DropdownMenuItem onClick={() => handleSetActiveStatus(candidate.id, false)}>
                                Mark inactive
                              </DropdownMenuItem>
                            )}
                            {candidate.isActive === false && (sessionUser?.id === candidate.inactivatedByAdminUserId || sessionUser?.role === "super_admin") && (
                              <DropdownMenuItem onClick={() => handleSetActiveStatus(candidate.id, true)}>
                                Activate
                              </DropdownMenuItem>
                            )}
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
