"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Upload, FileText } from "lucide-react"
import { toast } from "sonner"

const PERKS_OPTIONS = [
  { key: "food", label: "Food" },
  { key: "accommodation", label: "Accommodation" },
  { key: "service_charge", label: "Service Charge" },
  { key: "pf_efic", label: "PF/EFIC" },
  { key: "travel_allowance", label: "Travel Allowance" },
  { key: "hra", label: "HRA" },
  { key: "fa", label: "FA" },
]

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
]

export function ClientRequirementModal({ open, onOpenChange, clientId, outletId, requirement, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [uploadingJd, setUploadingJd] = useState(false)
  const [formData, setFormData] = useState({
    designation: "",
    numberOfOpenings: "",
    gender: "both", // "male", "female", "both"
    minSalary: "",
    maxSalary: "",
    perks: [],
    bothAvailable: "",
    jdFile: null,
    jdFileName: "",
    status: "ongoing",
    remark: "",
  })

  useEffect(() => {
    if (open) {
      // If editing, load requirement data
      if (requirement) {
        setFormData({
          designation: requirement.designation || "",
          numberOfOpenings: requirement.numberOfOpenings?.toString() || "",
          gender: requirement.gender || "both",
          minSalary: requirement.minSalary?.toString() || "",
          maxSalary: requirement.maxSalary?.toString() || "",
          perks: Array.isArray(requirement.perks) ? requirement.perks : (requirement.perks ? JSON.parse(requirement.perks) : []),
          bothAvailable: requirement.bothAvailable || "",
          jdFile: requirement.jdFile || null,
          jdFileName: requirement.jdFile ? requirement.jdFile.split("/").pop() : "",
          status: requirement.status || "ongoing",
          remark: requirement.remark || "",
        })
      } else {
        // Reset form
        setFormData({
          designation: "",
          numberOfOpenings: "",
          gender: "both",
          minSalary: "",
          maxSalary: "",
          perks: [],
          bothAvailable: "",
          jdFile: null,
          jdFileName: "",
          status: "ongoing",
          remark: "",
        })
      }
    }
  }, [open, requirement])

  const handleJdFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB")
      return
    }

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document")
      return
    }

    try {
      setUploadingJd(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "jd")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")
      const json = await response.json()
      setFormData((prev) => ({
        ...prev,
        jdFile: json.path,
        jdFileName: file.name,
      }))
      toast.success("JD file uploaded successfully")
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload JD file")
    } finally {
      setUploadingJd(false)
    }
  }

  const handlePerkToggle = (perkKey) => {
    setFormData((prev) => ({
      ...prev,
      perks: prev.perks.includes(perkKey)
        ? prev.perks.filter((p) => p !== perkKey)
        : [...prev.perks, perkKey],
    }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.designation || !formData.numberOfOpenings || !formData.status) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.minSalary && formData.maxSalary && parseFloat(formData.minSalary) > parseFloat(formData.maxSalary)) {
      toast.error("Minimum salary cannot be greater than maximum salary")
      return
    }

    try {
      setLoading(true)

      const requirementData = {
        clientId: parseInt(clientId, 10),
        outletId: outletId ? parseInt(outletId, 10) : null,
        designation: formData.designation,
        numberOfOpenings: parseInt(formData.numberOfOpenings, 10),
        gender: formData.gender,
        minSalary: formData.minSalary ? parseFloat(formData.minSalary) : null,
        maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary) : null,
        perks: formData.perks,
        bothAvailable: formData.bothAvailable || null,
        jdFile: formData.jdFile,
        status: formData.status,
        remark: formData.remark || null,
      }

      const url = requirement ? `/api/client-requirements/${requirement.id}` : "/api/client-requirements"
      const method = requirement ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requirementData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save requirement")
      }

      toast.success(requirement ? "Requirement updated successfully" : "Requirement created successfully")
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving requirement:", error)
      toast.error(error.message || "Failed to save requirement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Client Requirement</DialogTitle>
          <DialogDescription>
            Add a new job requirement for this client{outletId ? " and outlet" : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Designation */}
            <div>
              <Label htmlFor="designation">Designation / Position *</Label>
              <Input
                id="designation"
                placeholder="Enter designation/position name"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </div>

            {/* Number of Openings & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number-of-openings">No. of requirement *</Label>
                <Input
                  id="number-of-openings"
                  type="number"
                  min="1"
                  placeholder="Number of positions"
                  value={formData.numberOfOpenings}
                  onChange={(e) => setFormData({ ...formData, numberOfOpenings: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>
              <div className="flex gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="gender-male"
                    checked={formData.gender === "male"}
                    onCheckedChange={(checked) => {
                      if (checked) setFormData({ ...formData, gender: "male" })
                    }}
                  />
                  <Label htmlFor="gender-male" className="cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="gender-female"
                    checked={formData.gender === "female"}
                    onCheckedChange={(checked) => {
                      if (checked) setFormData({ ...formData, gender: "female" })
                    }}
                  />
                  <Label htmlFor="gender-female" className="cursor-pointer">Female</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="gender-both"
                    checked={formData.gender === "both"}
                    onCheckedChange={(checked) => {
                      if (checked) setFormData({ ...formData, gender: "both" })
                    }}
                  />
                  <Label htmlFor="gender-both" className="cursor-pointer">Both</Label>
                </div>
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-salary">Min Salary</Label>
                <Input
                  id="min-salary"
                  type="number"
                  placeholder="Minimum salary"
                  value={formData.minSalary}
                  onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="max-salary">Max Salary</Label>
                <Input
                  id="max-salary"
                  type="number"
                  placeholder="Maximum salary"
                  value={formData.maxSalary}
                  onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                />
              </div>
            </div>

            {/* Perks */}
            <div>
              <Label>Perks</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {PERKS_OPTIONS.map((perk) => (
                  <div key={perk.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`perk-${perk.key}`}
                      checked={formData.perks.includes(perk.key)}
                      onCheckedChange={() => handlePerkToggle(perk.key)}
                    />
                    <Label htmlFor={`perk-${perk.key}`} className="cursor-pointer text-sm">
                      {perk.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Both Available */}
            <div>
              <Label htmlFor="both-available">Both Available</Label>
              <Select value={formData.bothAvailable} onValueChange={(value) => setFormData({ ...formData, bothAvailable: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* JD File Upload */}
            <div>
              <Label>JD (Job Description) - Attach File</Label>
              <div className="flex items-center gap-4 mt-2">
                <Label htmlFor="jd-file" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                    {uploadingJd ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Choose File</span>
                      </>
                    )}
                  </div>
                  <Input
                    id="jd-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleJdFileChange}
                    className="hidden"
                    disabled={uploadingJd}
                  />
                </Label>
                {formData.jdFileName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{formData.jdFileName}</span>
                  </div>
                )}
              </div>
              {!formData.jdFileName && (
                <p className="text-sm text-gray-500 mt-1">No file chosen</p>
              )}
            </div>

            {/* Remark */}
            <div>
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                placeholder="Enter any additional remarks"
                rows={3}
                value={formData.remark}
                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  requirement ? "Update Requirement" : "Add Requirement"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
