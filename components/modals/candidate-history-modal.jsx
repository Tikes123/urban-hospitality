"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const HISTORY_PAGE_SIZE = 10

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

export function CandidateHistoryModal({ open, onOpenChange, candidate, schedules = [], replacements = [], page = 1, onPageChange }) {
  if (!candidate) return null

  const totalPages = Math.ceil(schedules.length / HISTORY_PAGE_SIZE)
  const paginatedSchedules = schedules.slice((page - 1) * HISTORY_PAGE_SIZE, page * HISTORY_PAGE_SIZE)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Interview History</DialogTitle>
          <DialogDescription>
            {candidate ? `Previously scheduled / tagged for ${candidate.name}` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col flex-1 min-h-0 space-y-4">
          {replacements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Replacements (exit / join)</h4>
              <ul className="space-y-1.5 text-sm">
                {replacements.map((r) => {
                  const isReplaced = r.replacedCandidateId === candidate.id
                  const exitDate = r.exitDate ? new Date(r.exitDate).toLocaleDateString("en-IN") : ""
                  const joinDate = r.dateOfJoining ? new Date(r.dateOfJoining).toLocaleDateString("en-IN") : ""
                  const outletName = r.outlet?.name ?? "—"
                  if (isReplaced) {
                    return (
                      <li key={r.id} className="text-gray-600">
                        <span className="font-medium text-red-700">Exit:</span> {exitDate} at {outletName}
                        {" — Replaced by "}
                        <span className="font-medium">{r.replacementCandidate?.name ?? "—"}</span>
                        {r.salary ? ` (Salary: ${r.salary})` : ""}
                      </li>
                    )
                  }
                  return (
                    <li key={r.id} className="text-gray-600">
                      <span className="font-medium text-green-700">Joined:</span> {joinDate} at {outletName}
                      {" — Replaced "}
                      <span className="font-medium">{r.replacedCandidate?.name ?? "—"}</span>
                      {r.salary ? ` (Salary: ${r.salary})` : ""}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {schedules.length === 0 && replacements.length === 0 ? (
            <p className="text-gray-500 text-sm">No history available.</p>
          ) : schedules.length === 0 ? null : (
            <>
              <div className="flex-1 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">#</TableHead>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Scheduled At</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Tagged By</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSchedules.map((s, idx) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono">{(page - 1) * HISTORY_PAGE_SIZE + idx + 1}</TableCell>
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
              {schedules.length > HISTORY_PAGE_SIZE && (
                <div className="flex items-center justify-between pt-3 border-t mt-3">
                  <div className="text-sm text-gray-600">
                    Showing {(page - 1) * HISTORY_PAGE_SIZE + 1} to {Math.min(page * HISTORY_PAGE_SIZE, schedules.length)} of {schedules.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
