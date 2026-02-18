"use client"

import { useState, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Check, Copy, Link2, Share2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getCvLinkUrl } from "@/lib/baseUrl"

export function CandidateShareInfoModal({ open, onOpenChange, candidate, cvLinks = [], onSaveIntro, onRefresh }) {
  const [shareInfoIntro, setShareInfoIntro] = useState("")
  const [shareInfoFields, setShareInfoFields] = useState({
    name: true,
    phone: true,
    email: true,
    position: true,
    experience: true,
    location: true,
    appliedDate: true,
    salary: true,
    status: true,
    cvLink: false,
    interview: true,
  })
  const [shareInfoCopied, setShareInfoCopied] = useState(false)
  const [shareInfoSchedules, setShareInfoSchedules] = useState([])
  const [shareInfoIntroSaving, setShareInfoIntroSaving] = useState(false)

  useEffect(() => {
    if (candidate && open) {
      setShareInfoIntro(candidate.shareIntro ?? "")
      const link = cvLinks.find((l) => l.candidateId === candidate.id && l.status === "active")
      if (link) {
        setShareInfoFields((prev) => ({ ...prev, cvLink: true }))
      }
      fetchSchedules()
    }
  }, [candidate, open, cvLinks])

  const fetchSchedules = async () => {
    if (!candidate) return
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/schedules`)
      if (res.ok) {
        const list = await res.json()
        const arr = Array.isArray(list) ? list : []
        const withDate = arr.filter((s) => s && s.scheduledAt)
        const now = new Date()
        const upcoming = withDate.filter((s) => new Date(s.scheduledAt) >= now).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        const forPlaceholders = upcoming.length > 0 ? upcoming : withDate.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)).slice(0, 1)
        setShareInfoSchedules(forPlaceholders)
      }
    } catch {}
  }

  const cvLinkByCandidateId = (id) => {
    return cvLinks.find((l) => l.candidateId === id && l.status === "active")
  }

  const saveShareIntro = async () => {
    if (!candidate) return
    setShareInfoIntroSaving(true)
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareIntro: shareInfoIntro }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save")
      toast.success("Intro saved")
      if (onSaveIntro) onSaveIntro()
    } catch (error) {
      toast.error(error.message || "Failed to save intro")
    } finally {
      setShareInfoIntroSaving(false)
    }
  }

  const copyCvLinkInShareModal = () => {
    if (!candidate) return
    const link = cvLinkByCandidateId(candidate.id)
    if (!link) {
      toast.error("No active CV link found")
      return
    }
    const cvUrl = getCvLinkUrl(link.linkId)
    navigator.clipboard.writeText(cvUrl)
    toast.success("CV link copied")
    setShareInfoFields((prev) => ({ ...prev, cvLink: true }))
  }

  const formatShareText = () => {
    if (!candidate) return ""
    const parts = []
    const nextSchedule = shareInfoSchedules[0]
    const interviewDate = nextSchedule ? new Date(nextSchedule.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""
    const interviewTime = nextSchedule ? new Date(nextSchedule.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""

    if (shareInfoFields.name !== false) parts.push(`Name: ${candidate.name}`)
    if (shareInfoFields.phone !== false) parts.push(`Phone: ${candidate.phone}`)
    if (shareInfoFields.email !== false && candidate.email) parts.push(`Email: ${candidate.email}`)
    if (shareInfoFields.position !== false) parts.push(`Position: ${candidate.position}`)
    if (shareInfoFields.experience !== false) parts.push(`Experience: ${candidate.experience}`)
    if (shareInfoFields.location !== false) parts.push(`Location: ${candidate.location}`)
    if (shareInfoFields.appliedDate !== false) parts.push(`Applied Date: ${candidate.appliedDate}`)
    if (shareInfoFields.salary !== false && candidate.salary) parts.push(`Expected Salary: ${candidate.salary}`)
    if (shareInfoFields.status !== false) parts.push(`Status: ${candidate.status}`)
    if (shareInfoFields.cvLink !== false) {
      const link = cvLinkByCandidateId(candidate.id)
      if (link) {
        const cvUrl = getCvLinkUrl(link.linkId)
        parts.push(`CV Link: ${cvUrl}`)
      }
    }
    if (shareInfoFields.interview !== false && nextSchedule) {
      parts.push(`Interview: ${interviewDate} at ${interviewTime}`)
    }

    let intro = shareInfoIntro || ""
    intro = intro.replace(/\{\{interviewDate\}\}/g, interviewDate)
    intro = intro.replace(/\{\{interviewTime\}\}/g, interviewTime)

    if (intro) {
      parts.push("")
      parts.push(intro)
    }

    return parts.join("\n")
  }

  const copyShareInfo = () => {
    const text = formatShareText()
    navigator.clipboard.writeText(text)
    setShareInfoCopied(true)
    toast.success("Copied to clipboard")
    setTimeout(() => setShareInfoCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    const text = formatShareText()
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`, "_blank")
  }

  const shareNative = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return
    try {
      const text = formatShareText()
      await navigator.share({
        title: `Candidate: ${candidate.name}`,
        text,
      })
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Failed to share")
      }
    }
  }

  if (!candidate) return null

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) setShareInfoCopied(false) }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share info</DialogTitle>
          <DialogDescription>
            Select fields to include, then copy. Paste in WhatsApp to share with client.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="share-intro">Highlight / Intro</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Editable text – included at the bottom when you Copy all. Use {"{{interviewDate}}"} and {"{{interviewTime}}"} for auto date/time from next interview. Save to keep for this candidate.
            </p>
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
              {cvLinkByCandidateId(candidate.id) && (
                <Button variant="outline" size="sm" onClick={copyCvLinkInShareModal} className="gap-1.5">
                  <Link2 className="w-4 h-4" /> Copy link
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
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
      </DialogContent>
    </Dialog>
  )
}
