"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { VendorHeader } from "@/components/vendor/vendor-header"
import {
  Building,
  Loader2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { getStatusInfo, getStatusBadgeClass } from "@/lib/statusConfig"
import { getCvLinkUrl } from "@/lib/baseUrl"
import { CandidateActionMenu } from "@/components/modals/candidate-action-menu"
import { CandidateViewDetailsModal } from "@/components/modals/candidate-view-details-modal"
import { CandidateHistoryModal } from "@/components/modals/candidate-history-modal"
import { CandidateShareInfoModal } from "@/components/modals/candidate-share-info-modal"
import { CandidateMarkInactiveModal } from "@/components/modals/candidate-mark-inactive-modal"
import { CandidateDeleteConfirmModal } from "@/components/modals/candidate-delete-confirm-modal"

function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return t ? { Authorization: "Bearer " + t } : {}
}

export default function OutletsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientIdFromUrl = searchParams.get("clientId")
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)

  // Outlet selection and applicant data
  const [selectedOutletId, setSelectedOutletId] = useState(null)
  const [selectedOutlet, setSelectedOutlet] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [candidatesLoading, setCandidatesLoading] = useState(false)
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [candidatesPage, setCandidatesPage] = useState(1)
  const [candidatesLimit, setCandidatesLimit] = useState(25)
  const [candidatesTotal, setCandidatesTotal] = useState(0)
  const [candidateSchedules, setCandidateSchedules] = useState({})
  const [bulkStatus, setBulkStatus] = useState("")
  const [bulkDate, setBulkDate] = useState("")
  const [statusOptions] = useState([
    "recently-applied", "suggested", "standby-cv", "waiting-for-call-back",
    "coming-for-interview-confirmed", "online-telephonic-interview", "hired", "backed-out",
  ])

  // Action menu and modals
  const [allowedMap, setAllowedMap] = useState({})
  const [sessionUser, setSessionUser] = useState(null)
  const [cvLinks, setCvLinks] = useState([])
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [viewDetailsCandidate, setViewDetailsCandidate] = useState(null)
  const [shareInfoOpen, setShareInfoOpen] = useState(false)
  const [shareInfoCandidate, setShareInfoCandidate] = useState(null)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyCandidate, setHistoryCandidate] = useState(null)
  const [historySchedules, setHistorySchedules] = useState([])
  const [historyReplacements, setHistoryReplacements] = useState([])
  const [outletReplacements, setOutletReplacements] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [inactiveModalOpen, setInactiveModalOpen] = useState(false)
  const [inactiveCandidate, setInactiveCandidate] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const HISTORY_PAGE_SIZE = 10

  useEffect(() => {
    fetchOutlets()
    fetchPermissions()
    fetchSessionUser()
    fetchCvLinks()
  }, [clientIdFromUrl])

  const fetchPermissions = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      if (!token) return
      const hrId = typeof window !== "undefined" ? localStorage.getItem("vendor_view_as_hr_id") : null
      const permUrl = hrId ? `/api/vendor/menu-permissions?hrId=${hrId}` : "/api/vendor/menu-permissions"
      const res = await fetch(permUrl, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setAllowedMap(data.allowedMap || {})
      }
    } catch (error) {
      console.error("Error fetching permissions:", error)
    }
  }

  const fetchSessionUser = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      if (!token) return
      const res = await fetch("/api/auth/session", { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        if (data.user) setSessionUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching session:", error)
    }
  }

  const fetchCvLinks = async () => {
    try {
      const res = await fetch("/api/cv-links")
      if (res.ok) {
        const data = await res.json()
        setCvLinks(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching CV links:", error)
    }
  }

  useEffect(() => {
    if (selectedOutletId) {
      fetchCandidatesForOutlet()
    } else {
      setCandidates([])
      setSelectedCandidates([])
      setOutletReplacements([])
    }
  }, [selectedOutletId, candidatesPage, candidatesLimit])

  const fetchCandidatesForOutlet = async () => {
    if (!selectedOutletId) return
    try {
      setCandidatesLoading(true)
      const params = new URLSearchParams()
      params.append("outletIds", String(selectedOutletId))
      params.append("page", String(candidatesPage))
      params.append("limit", String(candidatesLimit))
      const response = await fetch(`/api/candidates?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch candidates")
      const json = await response.json()
      const candidatesData = json.data ?? []
      setCandidates(candidatesData)
      setCandidatesTotal(json.total ?? 0)
      
      // Fetch schedules and replacements for this outlet
      if (candidatesData.length > 0) {
        const candidateIds = candidatesData.map((c) => c.id)
        const [schedulesResponse, replacementsResponse] = await Promise.all([
          fetch(`/api/schedules?candidateIds=${candidateIds.join(",")}&outletId=${selectedOutletId}`),
          fetch(`/api/replacements?outletId=${selectedOutletId}`),
        ])
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json()
          const schedules = Array.isArray(schedulesData) ? schedulesData : []
          const schedulesMap = {}
          schedules.forEach((s) => {
            if (s.outletId === selectedOutletId) {
              if (!schedulesMap[s.candidateId] || new Date(s.scheduledAt) > new Date(schedulesMap[s.candidateId].scheduledAt)) {
                schedulesMap[s.candidateId] = s
              }
            }
          })
          setCandidateSchedules(schedulesMap)
        }
        if (replacementsResponse.ok) setOutletReplacements(await replacementsResponse.json())
        else setOutletReplacements([])
      } else setOutletReplacements([])
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast.error("Failed to load applicants")
    } finally {
      setCandidatesLoading(false)
    }
  }

  const handleOutletSelect = (outletId) => {
    if (!outletId || outletId === "none") {
      setSelectedOutletId(null)
      setSelectedOutlet(null)
      setSelectedCandidates([])
      setCandidatesPage(1)
      return
    }
    const id = parseInt(outletId, 10)
    const outlet = outlets.find((o) => o.id === id)
    setSelectedOutletId(id)
    setSelectedOutlet(outlet || null)
    setSelectedCandidates([])
    setCandidatesPage(1)
  }

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(candidates.map((c) => c.id))
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedCandidates.length === 0 || !selectedOutletId) {
      toast.error("Please select candidates, outlet, and a status")
      return
    }
    try {
      const response = await fetch("/api/candidates/bulk-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateIds: selectedCandidates,
          status: bulkStatus,
          outletId: selectedOutletId,
        }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      toast.success(`Updated status for ${selectedCandidates.length} candidate(s)`)
      setSelectedCandidates([])
      setBulkStatus("")
      fetchCandidatesForOutlet()
    } catch (error) {
      console.error("Error updating bulk status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleBulkDateUpdate = async () => {
    if (!bulkDate || selectedCandidates.length === 0 || !selectedOutletId) {
      toast.error("Please select candidates, outlet, and a date")
      return
    }
    try {
      const response = await fetch("/api/candidates/bulk-date", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateIds: selectedCandidates,
          scheduledAt: bulkDate,
          outletId: selectedOutletId,
        }),
      })
      if (!response.ok) throw new Error("Failed to update date")
      toast.success(`Updated date for ${selectedCandidates.length} candidate(s)`)
      setSelectedCandidates([])
      setBulkDate("")
      fetchCandidatesForOutlet()
    } catch (error) {
      console.error("Error updating bulk date:", error)
      toast.error("Failed to update date")
    }
  }

  const getStatusBadgeForCandidate = (status) => {
    const info = getStatusInfo(status)
    return <Badge className={`border ${getStatusBadgeClass(status)}`}>{info.label}</Badge>
  }

  const cvLinkByCandidateId = (id) => cvLinks.find((l) => l.candidateId === id && l.status === "active")

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
          headers: { "Content-Type": "application/json", ...authHeaders() },
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
          headers: { "Content-Type": "application/json", ...authHeaders() },
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
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status: "paused" }),
      })
      if (!res.ok) throw new Error("Failed to deactivate")
      toast.success("CV link deactivated")
      fetchCvLinks()
    } catch (e) {
      toast.error(e.message || "Failed to deactivate CV link")
    }
  }

  const handleMarkInactiveClick = (candidate) => {
    setInactiveCandidate(candidate)
    setInactiveModalOpen(true)
  }

  const handleSetActiveStatus = async (candidateId, active, reason, category) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          isActive: active,
          ...(active === false && { inactiveReason: reason || null, inactiveReasonCategory: category || null }),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      toast.success(active ? "Candidate activated" : "Candidate marked inactive")
      setInactiveModalOpen(false)
      setInactiveCandidate(null)
      fetchCandidatesForOutlet()
    } catch (e) {
      toast.error(e.message || "Failed to update")
    }
  }

  const handleDelete = (candidate) => {
    setDeleteCandidate(candidate)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async (candidate) => {
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, { method: "DELETE", headers: authHeaders() })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete")
      toast.success("Candidate deleted")
      setDeleteModalOpen(false)
      setDeleteCandidate(null)
      fetchCandidatesForOutlet()
    } catch (e) {
      toast.error(e.message || "Failed to delete")
    }
  }

  const openShareInfo = (candidate) => {
    setShareInfoCandidate(candidate)
    setShareInfoOpen(true)
  }

  const handleEdit = (candidate) => {
    router.push(`/vendor/applicants?edit=${candidate.id}`)
  }

  const handleScheduleInterview = (candidate) => {
    if (candidate.isActive === false) {
      toast.error("Cannot schedule interview for an inactive candidate. Activate the candidate first.")
      return
    }
    router.push(`/vendor/applicants?schedule=${candidate.id}`)
  }

  const getCandidateSchedule = (candidateId) => {
    return candidateSchedules[candidateId] || null
  }

  const fetchOutlets = async () => {
    try {
      setLoading(true)
      const url = clientIdFromUrl ? `/api/outlets?clientId=${clientIdFromUrl}` : "/api/outlets"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch outlets")
      const json = await response.json()
      setOutlets(json.data ?? [])
    } catch (error) {
      console.error("Error fetching outlets:", error)
      toast.error("Failed to load outlets")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outlets Management</h1>
            {clientIdFromUrl && (
              <p className="text-sm text-muted-foreground mt-1">Showing outlets for this client. <Link href="/vendor/client" className="text-green-600 hover:underline">Back to clients</Link></p>
            )}
          </div>
        </div>

        {/* Outlet Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Select Outlet</Label>
              <Select 
                value={selectedOutletId ? String(selectedOutletId) : "none"} 
                onValueChange={handleOutletSelect}
                disabled={loading}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select an outlet..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select an outlet --</SelectItem>
                  {outlets.map((outlet) => (
                    <SelectItem key={outlet.id} value={String(outlet.id)}>
                      {outlet.id} - {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedOutlet && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Selected: {selectedOutlet.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleOutletSelect("none")}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions (when outlet selected) */}
        {selectedOutletId && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Bulk status update:</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={bulkStatus} onValueChange={setBulkStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleBulkStatusUpdate} disabled={!bulkStatus || selectedCandidates.length === 0}>
                      Submit
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Bulk date change:</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      placeholder="dd-mm-yyyy"
                    />
                    <Button onClick={handleBulkDateUpdate} disabled={!bulkDate || selectedCandidates.length === 0}>
                      Submit
                    </Button>
                  </div>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    {selectedCandidates.length} candidate(s) selected
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applicant Table (when outlet selected) */}
        {selectedOutletId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Applicants for {selectedOutlet?.name}</CardTitle>
              <CardDescription>Showing applicants scheduled at this outlet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Show</Label>
                  <Select value={String(candidatesLimit)} onValueChange={(v) => { setCandidatesLimit(parseInt(v, 10)); setCandidatesPage(1) }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label>entries</Label>
                </div>
                <Input placeholder="Search:" className="w-48" />
              </div>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={candidates.length > 0 && selectedCandidates.length === candidates.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Name & Number</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Date of Interview (DOI)</TableHead>
                      <TableHead>Assigned User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Added by</TableHead>
                      <TableHead>Exit / Join</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                          <span className="ml-2 text-gray-500">Loading applicants...</span>
                        </TableCell>
                      </TableRow>
                    ) : candidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                          No applicants found for this outlet
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidates.map((candidate, index) => {
                        const schedule = getCandidateSchedule(candidate.id)
                        const replacedAt = outletReplacements.find((r) => r.replacedCandidateId === candidate.id)
                        const joinedAt = outletReplacements.find((r) => r.replacementCandidateId === candidate.id)
                        const exitJoinText = replacedAt
                          ? `Exit: ${replacedAt.exitDate ? new Date(replacedAt.exitDate).toLocaleDateString("en-IN") : "—"}`
                          : joinedAt
                            ? `Joined: ${joinedAt.dateOfJoining ? new Date(joinedAt.dateOfJoining).toLocaleDateString("en-IN") : "—"}`
                            : "—"
                        return (
                          <TableRow key={candidate.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedCandidates.includes(candidate.id)}
                                onCheckedChange={() => handleSelectCandidate(candidate.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{index + 1}</div>
                                <div className="text-xs text-gray-500">{candidate.id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <a href={`tel:${candidate.phone}`} className="text-sm text-green-600 hover:underline">
                                  {candidate.phone}
                                </a>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.position}</TableCell>
                            <TableCell>
                              {schedule ? new Date(schedule.scheduledAt).toLocaleString() : "—"}
                            </TableCell>
                            <TableCell>
                              {candidate.addedByHr?.name || candidate.addedBy || "—"}
                            </TableCell>
                            <TableCell>{getStatusBadgeForCandidate(candidate.status)}</TableCell>
                            <TableCell>{candidate.addedByHr?.name || candidate.addedBy || "—"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{exitJoinText}</TableCell>
                            <TableCell>
                              <CandidateActionMenu
                                candidate={candidate}
                                allowedMap={allowedMap}
                                sessionUser={sessionUser}
                                onViewDetails={() => { setViewDetailsCandidate(candidate); setViewDetailsOpen(true) }}
                                onShareInfo={() => openShareInfo(candidate)}
                                onEdit={() => handleEdit(candidate)}
                                onScheduleInterview={() => handleScheduleInterview(candidate)}
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
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {candidatesTotal > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((candidatesPage - 1) * candidatesLimit) + 1} to {Math.min(candidatesPage * candidatesLimit, candidatesTotal)} of {candidatesTotal} entries
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={candidatesPage === 1} onClick={() => setCandidatesPage((p) => p - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={candidatesPage >= Math.ceil(candidatesTotal / candidatesLimit)} onClick={() => setCandidatesPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show message when no outlet selected */}
        {!selectedOutletId && (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Select an outlet above to view applicants</p>
              <p className="text-sm text-gray-400 mt-2">To manage outlets, go to Client Management page</p>
            </CardContent>
          </Card>
        )}

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
          onSaveIntro={() => fetchCandidatesForOutlet()}
          onRefresh={fetchCvLinks}
        />
        <CandidateHistoryModal
          open={historyModalOpen}
          onOpenChange={setHistoryModalOpen}
          candidate={historyCandidate}
          schedules={historySchedules}
          replacements={historyReplacements}
          page={historyPage}
          onPageChange={setHistoryPage}
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
      </main>
    </div>
  )
}
