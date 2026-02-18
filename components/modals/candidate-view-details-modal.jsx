"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const INACTIVE_REASON_CATEGORIES = [
  { value: "behaviour", label: "Behaviour or discipline issues (misconduct, attitude, substance use)" },
  { value: "theft_fraud", label: "Theft, fraud, or other legal issues" },
  { value: "absconded", label: "Absconded, no-show, or left immediately after joining" },
  { value: "skill_mismatch", label: "Skill mismatch or failed trial / performance issues" },
]

export function CandidateViewDetailsModal({ open, onOpenChange, candidate }) {
  if (!candidate) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
          <DialogDescription>{candidate.name}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3 text-sm">
          <p><span className="font-medium">Phone:</span> {candidate.phone}</p>
          <p><span className="font-medium">Email:</span> {candidate.email || "—"}</p>
          <p><span className="font-medium">Position:</span> {candidate.position}</p>
          <p><span className="font-medium">Experience:</span> {candidate.experience}</p>
          <p><span className="font-medium">Location:</span> {candidate.location}</p>
          <p><span className="font-medium">Status:</span> {candidate.status}</p>
          <p><span className="font-medium">Expected Salary:</span> {candidate.salary || "—"}</p>
          <p><span className="font-medium">Source:</span> {candidate.source || "—"}</p>
          {candidate.skills && <p><span className="font-medium">Skills & Qualifications:</span> {candidate.skills}</p>}
          {candidate.education && <p><span className="font-medium">Education:</span> {candidate.education}</p>}
          {candidate.previousEmployer && <p><span className="font-medium">Previous Employer:</span> {candidate.previousEmployer}</p>}
          {candidate.notes && <p><span className="font-medium">Internal Notes:</span> {candidate.notes}</p>}
          {candidate.isActive === false && (
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3">
              <p className="font-medium text-amber-800 dark:text-amber-200">Inactive</p>
              {candidate.inactiveReasonCategory && (
                <p className="mt-1 text-muted-foreground">
                  <span className="font-medium">Category:</span> {INACTIVE_REASON_CATEGORIES.find((c) => c.value === candidate.inactiveReasonCategory)?.label ?? candidate.inactiveReasonCategory}
                </p>
              )}
              {candidate.inactiveReason ? (
                <p className="mt-1 text-muted-foreground"><span className="font-medium">Remark:</span> {candidate.inactiveReason}</p>
              ) : candidate.inactiveReasonCategory ? null : (
                <p className="mt-1 text-muted-foreground">No reason provided.</p>
              )}
            </div>
          )}
          {(() => {
            const att = candidate.attachments || []
            const firstPath = candidate.resume || (att[0] && att[0].path)
            const allFiles = att.length > 0 ? att : (candidate.resume ? [{ path: candidate.resume, name: "Resume" }] : [])
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
                <p><span className="font-medium">Resume last updated:</span> {candidate.resumeUpdatedAt ? new Date(candidate.resumeUpdatedAt).toLocaleString("en-IN") : "—"}</p>
                <p><span className="font-medium">Applied:</span> {candidate.appliedDate}</p>
                <p><span className="font-medium">Last updated:</span> {candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleString("en-IN") : "—"}</p>
              </>
            )
          })()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
