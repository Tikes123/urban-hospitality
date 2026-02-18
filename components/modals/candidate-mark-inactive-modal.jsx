"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserX } from "lucide-react"
import { toast } from "sonner"

const INACTIVE_REASON_CATEGORIES = [
  { value: "behaviour", label: "Behaviour or discipline issues (misconduct, attitude, substance use)" },
  { value: "theft_fraud", label: "Theft, fraud, or other legal issues" },
  { value: "absconded", label: "Absconded, no-show, or left immediately after joining" },
  { value: "skill_mismatch", label: "Skill mismatch or failed trial / performance issues" },
]

export function CandidateMarkInactiveModal({ open, onOpenChange, candidate, onSubmit }) {
  const [inactiveReasonCategory, setInactiveReasonCategory] = useState("")
  const [inactiveReason, setInactiveReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!candidate || !onSubmit) return
    setSubmitting(true)
    try {
      await onSubmit(candidate.id, inactiveReason, inactiveReasonCategory || null)
      setInactiveReasonCategory("")
      setInactiveReason("")
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message || "Failed to mark inactive")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setInactiveReasonCategory("")
    setInactiveReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark candidate inactive</DialogTitle>
          <DialogDescription>
            {candidate ? `Select a category and optionally add a remark for why ${candidate.name} is being marked inactive. This will be visible to other vendors and HR.` : "Select a category (optional) and add a remark (optional)."}
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
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button disabled={submitting} onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserX className="w-4 h-4 mr-2" />}
              Mark inactive
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
