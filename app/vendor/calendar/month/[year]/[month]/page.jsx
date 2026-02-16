"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { VendorHeader } from "@/components/vendor/vendor-header"
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  MapPin,
  MoreHorizontal,
  Eye,
  Download,
  Edit,
  History,
  Video,
  Phone,
  User,
  Loader2,
  Link2,
} from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"

const statusOptions = [
  "recently-applied",
  "suggested",
  "standby-cv",
  "waiting-for-call-back",
  "coming-for-interview-confirmed",
  "online-telephonic-interview",
  "hired",
  "backed-out",
]

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function getStatusBadge(status) {
  const statusMap = {
    "recently-applied": { label: "Recently Applied", className: "bg-blue-100 text-blue-800" },
    "suggested": { label: "Suggested", className: "bg-purple-100 text-purple-800" },
    "standby-cv": { label: "Standby CV", className: "bg-yellow-100 text-yellow-800" },
    "waiting-for-call-back": { label: "Waiting for Call Back", className: "bg-orange-100 text-orange-800" },
    "coming-for-interview-confirmed": { label: "Coming for Interview - Confirmed", className: "bg-orange-100 text-orange-800" },
    "online-telephonic-interview": { label: "Online/Telephonic Interview", className: "bg-yellow-100 text-yellow-800" },
    "hired": { label: "Hired", className: "bg-green-100 text-green-800" },
    "backed-out": { label: "Backed Out", className: "bg-red-100 text-red-800" },
  }
  const statusInfo = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" }
  return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
}

function getMeetingTypeIcon(type) {
  switch (type) {
    case "video":
      return <Video className="w-4 h-4" />
    case "phone":
      return <Phone className="w-4 h-4" />
    case "in-person":
      return <User className="w-4 h-4" />
    default:
      return <CalendarIcon className="w-4 h-4" />
  }
}

function toDateString(d) {
  return d.toISOString().split("T")[0]
}

function getMonthRange(year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  return { from: toDateString(first), to: toDateString(last) }
}

export default function MonthCalendarPage() {
  const params = useParams()
  const router = useRouter()
  const yearParam = parseInt(String(params.year || ""), 10)
  const monthParam = parseInt(String(params.month || ""), 10)
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState([])
  const [candidates, setCandidates] = useState([])
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [bulkStatus, setBulkStatus] = useState("")
  const [bulkDate, setBulkDate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyCandidate, setHistoryCandidate] = useState(null)
  const [historySchedules, setHistorySchedules] = useState([])
  const [onlyJoining, setOnlyJoining] = useState(false)
  const [filterUser, setFilterUser] = useState("")
  const [users, setUsers] = useState([])
  const [sessionUser, setSessionUser] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchSessionUser()
  }, [])

  useEffect(() => {
    if (yearParam && monthParam !== undefined) {
      fetchMonthData()
    }
  }, [yearParam, monthParam, page, limit, searchQuery, onlyJoining, filterUser])

  const fetchUsers = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      if (!token) return
      const res = await fetch("/api/vendor/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchSessionUser = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      if (!token) return
      const res = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          setSessionUser(data.user)
          // Don't set default user filter - show all users by default
          // User can manually select their user if needed
        }
      }
    } catch (error) {
      console.error("Error fetching session:", error)
    }
  }

  const fetchMonthData = async () => {
    try {
      setLoading(true)
      const range = getMonthRange(yearParam, monthParam)
      const from = range.from
      const to = range.to

      const schedulesRes = await fetch(`/api/schedules?from=${from}&to=${to}`)
      const schedulesData = schedulesRes.ok ? await schedulesRes.json() : []
      setSchedules(Array.isArray(schedulesData) ? schedulesData : [])

      // Fetch candidate details for these schedules
      const candidateIds = [...new Set(schedulesData.map((s) => s.candidateId).filter(Boolean))]
      
      if (candidateIds.length > 0) {
        // Fetch candidates by their IDs (using individual API calls)
        const candidatePromises = candidateIds.map((id) =>
          fetch(`/api/candidates/${id}`)
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        )
        const candidateResults = await Promise.all(candidatePromises)
        const allCandidates = candidateResults.filter(Boolean)
        
        // Filter candidates with schedules in this month
        let candidatesWithSchedules = allCandidates.filter((c) =>
          schedulesData.some((s) => s.candidateId === c.id)
        )
        
        // Apply "Only Joining" filter (candidates with status "hired")
        if (onlyJoining) {
          candidatesWithSchedules = candidatesWithSchedules.filter((c) => c.status === "hired")
        }

        // Apply user filter
        if (filterUser) {
          const userId = parseInt(filterUser, 10)
          const user = users.find((u) => u.id === userId)
          candidatesWithSchedules = candidatesWithSchedules.filter((c) => {
            // Check if candidate was added by this user (vendor or HR)
            if (c.addedByHrId === userId) {
              return true
            }
            // Check if addedBy name matches user name
            if (user && c.addedBy && c.addedBy.toLowerCase().includes(user.name?.toLowerCase() || "")) {
              return true
            }
            // Check if addedBy email matches user email
            if (user && c.addedBy && user.email && c.addedBy.toLowerCase().includes(user.email.toLowerCase())) {
              return true
            }
            // For vendor users, check if no addedByHrId and addedBy matches
            if (user && user.type === "vendor" && !c.addedByHrId && c.addedBy && (c.addedBy === user.name || c.addedBy === user.email)) {
              return true
            }
            return false
          })
        }
        
        // Apply search filter
        if (searchQuery) {
          candidatesWithSchedules = candidatesWithSchedules.filter((c) => {
            const query = searchQuery.toLowerCase()
            return (
              c.name?.toLowerCase().includes(query) ||
              c.phone?.includes(query) ||
              c.position?.toLowerCase().includes(query) ||
              getSchedulesForCandidate(c.id).some((s) => s.outletName?.toLowerCase().includes(query))
            )
          })
        }
        
        // Apply pagination
        const start = (page - 1) * limit
        const end = start + limit
        const paginated = candidatesWithSchedules.slice(start, end)
        
        setCandidates(paginated)
        setTotal(candidatesWithSchedules.length)
        setTotalPages(Math.ceil(candidatesWithSchedules.length / limit))
      } else {
        setCandidates([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error fetching month data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const getSchedulesForCandidate = (candidateId) => {
    return schedules.filter((s) => s.candidateId === candidateId)
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
    if (!bulkStatus || selectedCandidates.length === 0) {
      toast.error("Please select candidates and a status")
      return
    }
    try {
      const promises = selectedCandidates.map((candidateId) => {
        const candidateSchedules = getSchedulesForCandidate(candidateId)
        if (candidateSchedules.length === 0) return Promise.resolve()
        // Update for the first schedule's outlet
        const schedule = candidateSchedules[0]
        return fetch("/api/candidates/bulk-status", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateIds: [candidateId],
            status: bulkStatus,
            outletId: schedule.outletId,
          }),
        })
      })
      await Promise.all(promises)
      toast.success(`Updated status for ${selectedCandidates.length} candidate(s)`)
      setSelectedCandidates([])
      setBulkStatus("")
      fetchMonthData()
    } catch (error) {
      console.error("Error updating bulk status:", error)
      toast.error("Failed to update status")
    }
  }

  const handleBulkDateUpdate = async () => {
    if (!bulkDate || selectedCandidates.length === 0) {
      toast.error("Please select candidates and a date")
      return
    }
    try {
      const promises = selectedCandidates.map((candidateId) => {
        const candidateSchedules = getSchedulesForCandidate(candidateId)
        if (candidateSchedules.length === 0) return Promise.resolve()
        // Update for the first schedule's outlet
        const schedule = candidateSchedules[0]
        return fetch("/api/candidates/bulk-date", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateIds: [candidateId],
            scheduledAt: bulkDate,
            outletId: schedule.outletId,
          }),
        })
      })
      await Promise.all(promises)
      toast.success(`Updated date for ${selectedCandidates.length} candidate(s)`)
      setSelectedCandidates([])
      setBulkDate("")
      fetchMonthData()
    } catch (error) {
      console.error("Error updating bulk date:", error)
      toast.error("Failed to update date")
    }
  }

  const openHistoryModal = async (candidate) => {
    setHistoryCandidate(candidate)
    setHistoryModalOpen(true)
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/schedules`)
      setHistorySchedules(res.ok ? await res.json() : [])
    } catch {
      setHistorySchedules([])
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  }

  // Candidates are already filtered in fetchMonthData
  const filteredCandidates = candidates

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vendor/calendar">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calendar
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Events for {monthNames[monthParam]} {yearParam}
          </h1>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="only-joining"
                  checked={onlyJoining}
                  onCheckedChange={(checked) => setOnlyJoining(checked === true)}
                />
                <Label htmlFor="only-joining" className="text-green-600 cursor-pointer">
                  Only Joining
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOnlyJoining(!onlyJoining)
                    setPage(1)
                  }}
                  className={onlyJoining ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                >
                  Submit
                </Button>
              </div>
              <div>
                <Label>User:</Label>
                <Select value={filterUser || "all"} onValueChange={(value) => { setFilterUser(value === "all" ? "" : value); setPage(1) }}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {users.map((user, index) => (
                      <SelectItem key={`${user.type || 'user'}-${user.id}-${index}`} value={String(user.id)}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bulk status update:</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleBulkStatusUpdate} disabled={!bulkStatus || selectedCandidates.length === 0} className="bg-green-600 hover:bg-green-700">
                    Submit
                  </Button>
                </div>
              </div>
              <div>
                <Label>Bulk date change:</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="datetime-local"
                    value={bulkDate}
                    onChange={(e) => setBulkDate(e.target.value)}
                  />
                  <Button onClick={handleBulkDateUpdate} disabled={!bulkDate || selectedCandidates.length === 0} className="bg-green-600 hover:bg-green-700">
                    Submit
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {selectedCandidates.length} candidate(s) selected
            </div>
          </CardContent>
        </Card>

        {/* Table Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Show</Label>
                <Select value={String(limit)} onValueChange={(v) => { setLimit(parseInt(v, 10)); setPage(1) }}>
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
              <Input
                placeholder="Search..."
                className="w-48"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Candidates ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No candidates found for this month.</div>
            ) : (
              <>
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={filteredCandidates.length > 0 && selectedCandidates.length === filteredCandidates.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Name & Number</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Outlet & Interview</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added by</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCandidates.map((candidate, index) => {
                        const candidateSchedules = getSchedulesForCandidate(candidate.id)
                        const firstSchedule = candidateSchedules[0]
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
                              {firstSchedule ? (
                                <div>
                                  <div className="text-green-600 font-medium">{firstSchedule.outletName}</div>
                                  <div className="text-xs text-gray-500">
                                    DOI: {firstSchedule.scheduledAt ? `${formatDate(firstSchedule.scheduledAt)} ${formatTime(firstSchedule.scheduledAt)}` : "—"}
                                  </div>
                                  {candidateSchedules.length > 1 && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      +{candidateSchedules.length - 1} more schedule(s)
                                    </div>
                                  )}
                                </div>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                            <TableCell>{candidate.addedByHr?.name || candidate.addedBy || "—"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {candidate.resume && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View CV
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm">
                                  <Link2 className="w-4 h-4 mr-1" />
                                  Generate CV Link
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`/vendor/applicants?edit=${candidate.id}`)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openHistoryModal(candidate)}>
                                      <History className="w-4 h-4 mr-2" />
                                      History
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                {total > 0 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1) }}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* History Modal */}
        <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Interview History</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {historySchedules.length === 0 ? (
                <p className="text-gray-500 text-sm">No history available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Scheduled At</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historySchedules.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.outlet?.name || "—"}</TableCell>
                        <TableCell>{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString("en-IN") : "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getMeetingTypeIcon(s.type?.toLowerCase())}
                            <span className="capitalize">{s.type || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{s.status ? getStatusBadge(s.status) : "—"}</TableCell>
                        <TableCell>{s.remarks || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
