"use client"

import { useState, useEffect } from "react"
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
  Eye,
  Link2,
  X,
} from "lucide-react"
import { toast } from "sonner"

export default function OutletsPage() {
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
      const [candidateSchedules, setCandidateSchedules] = useState({}) // Map of candidateId -> schedule
  const [bulkStatus, setBulkStatus] = useState("")
  const [bulkDate, setBulkDate] = useState("")
  const [statusOptions] = useState([
    "recently-applied", "suggested", "standby-cv", "waiting-for-call-back",
    "coming-for-interview-confirmed", "online-telephonic-interview", "hired", "backed-out"
  ])

  useEffect(() => {
    fetchOutlets()
  }, [])

  useEffect(() => {
    if (selectedOutletId) {
      fetchCandidatesForOutlet()
    } else {
      setCandidates([])
      setSelectedCandidates([])
    }
  }, [selectedOutletId, candidatesPage, candidatesLimit])

  const fetchCandidatesForOutlet = async () => {
    if (!selectedOutletId) return
    try {
      setCandidatesLoading(true)
      const params = new URLSearchParams()
      params.append("outletIds", selectedOutletId)
      params.append("page", String(candidatesPage))
      params.append("limit", String(candidatesLimit))
      const response = await fetch(`/api/candidates?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch candidates")
      const json = await response.json()
      const candidatesData = json.data ?? []
      setCandidates(candidatesData)
      setCandidatesTotal(json.total ?? 0)
      
      // Fetch schedules for these candidates
      if (candidatesData.length > 0) {
        const candidateIds = candidatesData.map((c) => c.id)
        const schedulesResponse = await fetch(`/api/schedules?candidateIds=${candidateIds.join(",")}&outletId=${selectedOutletId}`)
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json()
          const schedulesMap = {}
          schedulesData.forEach((s) => {
            if (!schedulesMap[s.candidateId] || new Date(s.scheduledAt) > new Date(schedulesMap[s.candidateId].scheduledAt)) {
              schedulesMap[s.candidateId] = s
            }
          })
          setCandidateSchedules(schedulesMap)
        }
      }
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
    const outlet = outlets.find((o) => o.id === parseInt(outletId, 10))
    setSelectedOutletId(parseInt(outletId, 10))
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
      toast.error("Please select candidates and a status")
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
      toast.error("Please select candidates and a date")
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

  const getCandidateSchedule = (candidateId) => {
    return candidateSchedules[candidateId] || null
  }

  const fetchOutlets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/outlets`)
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
          <h1 className="text-2xl font-bold text-gray-900">Outlets Management</h1>
        </div>

        {/* Outlet Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Outlets</Label>
              <Select value={selectedOutletId ? String(selectedOutletId) : "none"} onValueChange={handleOutletSelect}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Search and select an outlet to view applicants..." />
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
                    <Button variant="ghost" size="sm" onClick={() => handleOutletSelect(null)}>
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
                      <TableHead>Actions</TableHead>
                      <TableHead>Added by</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidatesLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                          <span className="ml-2 text-gray-500">Loading applicants...</span>
                        </TableCell>
                      </TableRow>
                    ) : candidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No applicants found for this outlet
                        </TableCell>
                      </TableRow>
                    ) : (
                      candidates.map((candidate, index) => {
                        const schedule = getCandidateSchedule(candidate.id)
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
                            <TableCell>
                              <div className="flex gap-2">
                                {candidate.resume && (
                                  <Button variant="ghost" size="sm" onClick={() => window.open(candidate.resume.startsWith("/") ? candidate.resume : candidate.resume, "_blank")}>
                                    <Eye className="w-4 h-4 mr-1" />
                                    View CV
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm">
                                  <Link2 className="w-4 h-4 mr-1" />
                                  Generate CV Link
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.addedByHr?.name || candidate.addedBy || "—"}</TableCell>
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
      </main>
    </div>
  )
}
