"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { ArrowLeft, Loader2, Upload, FileText } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const DEFAULT_OUTLET_TYPES = [
  { name: "hotel", id: "hotel" },
  { name: "restaurant", id: "restaurant" },
  { name: "bar", id: "bar" },
]

export default function AddOutletClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientIdParam = searchParams.get("clientId")
  const existingClientId = clientIdParam ? parseInt(clientIdParam, 10) : null
  const isOutletOnlyMode = existingClientId != null && !Number.isNaN(existingClientId)

  const [loading, setLoading] = useState(false)
  const [uploadingContract, setUploadingContract] = useState(false)
  const [uploadingOutletImage, setUploadingOutletImage] = useState(false)
  const [addOutlet, setAddOutlet] = useState(true)
  const [areas, setAreas] = useState([])
  const [locations, setLocations] = useState([])
  const [outletTypes, setOutletTypes] = useState(DEFAULT_OUTLET_TYPES)
  const [existingClient, setExistingClient] = useState(null)
  const [formData, setFormData] = useState({
    // Client fields (aligned with Add New Client modal)
    name: "",
    type: "hotel",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    contractStart: "",
    contractEnd: "",
    status: "active",
    contractValue: "",
    outlets: "0",
    employees: "0",
    services: "",
    notes: "",
    // Outlet fields
    outletName: "",
    outletType: "hotel",
    outletArea: "",
    outletAddress: "",
    outletPhone: "",
    outletEmail: "",
    outletManager: "",
    outletStatus: "active",
    outletImage: null,
    outletImageName: "",
    outletGoogleMapLocation: "",
    contractFile: null,
    contractFileName: "",
  })

  useEffect(() => {
    fetch("/api/areas")
      .then((res) => (res.ok ? res.json() : []))
      .then(setAreas)
      .catch(() => setAreas([]))
    fetch("/api/outlets/locations")
      .then((res) => (res.ok ? res.json() : []))
      .then(setLocations)
      .catch(() => setLocations([]))
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (t) {
      fetch("/api/vendor/outlet-types", { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => (res.ok ? res.json() : []))
        .then((list) => (Array.isArray(list) && list.length > 0 ? list.map((o) => ({ id: String(o.id), name: o.name })) : DEFAULT_OUTLET_TYPES))
        .then(setOutletTypes)
        .catch(() => setOutletTypes(DEFAULT_OUTLET_TYPES))
    }
  }, [])

  useEffect(() => {
    if (!isOutletOnlyMode) return
    fetch(`/api/clients/${existingClientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((client) => {
        setExistingClient(client)
        if (client) {
          setFormData((prev) => ({
            ...prev,
            outletPhone: client.phone || "",
            outletEmail: client.email || "",
          }))
        }
      })
      .catch(() => setExistingClient(null))
  }, [isOutletOnlyMode, existingClientId])

  const handleFileChange = async (e) => {
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
      setUploadingContract(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "contracts")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")
      const json = await response.json()
      setFormData((prev) => ({
        ...prev,
        contractFile: json.path,
        contractFileName: file.name,
      }))
      toast.success("Contract file uploaded successfully")
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload contract file")
    } finally {
      setUploadingContract(false)
    }
  }

  const handleOutletImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload an image file (JPEG, PNG, GIF, or WebP)")
      return
    }

    try {
      setUploadingOutletImage(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")
      const json = await response.json()
      setFormData((prev) => ({
        ...prev,
        outletImage: json.path,
        outletImageName: file.name,
      }))
      toast.success("Outlet image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload outlet image")
    } finally {
      setUploadingOutletImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isOutletOnlyMode) {
      if (!formData.outletName || !formData.outletType || !formData.outletAddress) {
        toast.error("Please fill in outlet name, type, and address")
        return
      }
      try {
        setLoading(true)
        const outletData = {
          name: formData.outletName,
          type: formData.outletType,
          area: formData.outletArea || null,
          address: formData.outletAddress,
          phone: formData.outletPhone || existingClient?.phone,
          email: formData.outletEmail || existingClient?.email,
          manager: formData.outletManager || "",
          employees: 0,
          openPositions: 0,
          status: formData.outletStatus,
          image: formData.outletImage,
          googleMapLocation: formData.outletGoogleMapLocation || null,
          clientId: existingClientId,
        }
        const outletResponse = await fetch("/api/outlets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(outletData),
        })
        if (!outletResponse.ok) {
          const err = await outletResponse.json()
          throw new Error(err.error || "Failed to create outlet")
        }
        toast.success("Outlet added to client successfully")
        router.push("/vendor/client")
      } catch (error) {
        console.error("Error saving outlet:", error)
        toast.error(error.message || "Failed to save")
      } finally {
        setLoading(false)
      }
      return
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.contactPerson || !formData.contractStart || !formData.contractEnd) {
      toast.error("Please fill in all required client fields")
      return
    }
    if (addOutlet && (!formData.outletName || !formData.outletType || !formData.outletAddress)) {
      toast.error("Please fill in all required outlet fields")
      return
    }

    try {
      setLoading(true)
      const clientData = {
        name: formData.name,
        type: formData.type,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        outlets: addOutlet ? 1 : 0,
        employees: parseInt(formData.employees, 10) || 0,
        contractValue: parseFloat(formData.contractValue) || 0,
        contractStart: formData.contractStart,
        contractEnd: formData.contractEnd,
        status: formData.status,
        services: formData.services ? formData.services.split(",").map((s) => s.trim()).filter(Boolean) : [],
        notes: formData.notes || null,
        contractFile: formData.contractFile || null,
      }

      const clientResponse = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      })

      if (!clientResponse.ok) {
        const error = await clientResponse.json()
        throw new Error(error.error || "Failed to create client")
      }

      const client = await clientResponse.json()
      toast.success("Client created successfully")

      if (addOutlet) {
        const outletData = {
          name: formData.outletName,
          type: formData.outletType,
          area: formData.outletArea || null,
          address: formData.outletAddress,
          phone: client.phone,
          email: client.email,
          manager: formData.outletManager || "",
          employees: 0,
          openPositions: 0,
          status: formData.outletStatus,
          image: formData.outletImage,
          googleMapLocation: formData.outletGoogleMapLocation || null,
          clientId: client.id,
        }
        const outletResponse = await fetch("/api/outlets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(outletData),
        })
        if (!outletResponse.ok) {
          const error = await outletResponse.json()
          throw new Error(error.error || "Failed to create outlet")
        }
        toast.success("Outlet created successfully")
      }

      router.push(addOutlet ? "/vendor/outlets" : "/vendor/client")
    } catch (error) {
      console.error("Error saving:", error)
      toast.error(error.message || "Failed to save")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href={isOutletOnlyMode ? "/vendor/client" : "/vendor"} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isOutletOnlyMode ? (existingClient ? `Add outlet for ${existingClient.name}` : "Add outlet") : "Add Client & Outlet"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isOutletOnlyMode
                ? "Add a new outlet for this client. Phone and email will default to the client."
                : "Add a new client and optionally create an outlet. Same fields as Add New Client modal."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {!isOutletOnlyMode && (
                <>
                  {/* Client Information - aligned with Add New Client modal */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Information</CardTitle>
                      <CardDescription>Same fields as Add New Client on Client Management page</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="client-name">Client Name *</Label>
                          <Input
                            id="client-name"
                            placeholder="Enter client name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="client-type">Business Type *</Label>
                          <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              {outletTypes.map((t) => (
                                <SelectItem key={t.id} value={String(t.name).toLowerCase()}>{String(t.name)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact-person">Contact Person *</Label>
                          <Input
                            id="contact-person"
                            placeholder="Primary contact name"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="client-email">Email *</Label>
                          <Input
                            id="client-email"
                            type="email"
                            placeholder="Contact email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="client-phone">Phone *</Label>
                          <Input
                            id="client-phone"
                            placeholder="Phone number"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="client-address">Address *</Label>
                          <Input
                            id="client-address"
                            placeholder="Business address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contract-start">Contract Start *</Label>
                          <Input
                            id="contract-start"
                            type="date"
                            value={formData.contractStart}
                            onChange={(e) => setFormData({ ...formData, contractStart: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="contract-end">Contract End *</Label>
                          <Input
                            id="contract-end"
                            type="date"
                            value={formData.contractEnd}
                            onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="client-status">Status *</Label>
                          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="trial">Trial</SelectItem>
                              <SelectItem value="renewal-pending">Renewal Pending</SelectItem>
                              <SelectItem value="expired">Expired</SelectItem>
                              <SelectItem value="paused">Paused</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="contract-value">Contract Value</Label>
                          <Input
                            id="contract-value"
                            type="number"
                            placeholder="Annual value"
                            value={formData.contractValue}
                            onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="services">Services (comma-separated)</Label>
                        <Input
                          id="services"
                          placeholder="Staff Management, Training"
                          value={formData.services}
                          onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-notes">Notes</Label>
                        <Textarea
                          id="client-notes"
                          placeholder="Additional notes"
                          rows={2}
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contract File Upload */}
                  <Card>
                <CardHeader>
                  <CardTitle>Contract File</CardTitle>
                  <CardDescription>Upload contract document (PDF or Word)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="contract-file" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                          {uploadingContract ? (
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
                          id="contract-file"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={uploadingContract}
                        />
                      </Label>
                      {formData.contractFileName && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span>{formData.contractFileName}</span>
                        </div>
                      )}
                    </div>
                    {!formData.contractFileName && (
                      <p className="text-sm text-gray-500">No file chosen</p>
                    )}
                  </div>
                </CardContent>
              </Card>
                </>
              )}

              {/* Outlet: either only (when clientId) or optional (when adding client) */}
              {(isOutletOnlyMode || addOutlet) && (
              <Card>
                <CardHeader>
                  {isOutletOnlyMode ? (
                    <CardTitle>Outlet details</CardTitle>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="add-outlet"
                        checked={addOutlet}
                        onCheckedChange={setAddOutlet}
                      />
                      <Label htmlFor="add-outlet" className="cursor-pointer font-semibold">
                        Also add an outlet for this client
                      </Label>
                    </div>
                  )}
                </CardHeader>
                <CardContent className={isOutletOnlyMode ? "space-y-4 pt-4" : "space-y-4 pt-4"}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="outlet-name">Outlet Name *</Label>
                        <Input
                          id="outlet-name"
                          placeholder="Enter outlet name"
                          value={formData.outletName}
                          onChange={(e) => setFormData({ ...formData, outletName: e.target.value })}
                          required={addOutlet}
                        />
                      </div>
                      <div>
                        <Label htmlFor="outlet-type">Type *</Label>
                        <Select value={formData.outletType} onValueChange={(value) => setFormData({ ...formData, outletType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {outletTypes.map((t) => (
                              <SelectItem key={t.id} value={String(t.name).toLowerCase()}>{String(t.name)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="outlet-area">Area / Location</Label>
                        <Select value={formData.outletArea} onValueChange={(value) => setFormData({ ...formData, outletArea: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select area (from API)" />
                          </SelectTrigger>
                          <SelectContent>
                            {areas.map((a) => (
                              <SelectItem key={a} value={a}>{a}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="outlet-status">Status *</Label>
                        <Select value={formData.outletStatus} onValueChange={(value) => setFormData({ ...formData, outletStatus: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="outlet-address">Address *</Label>
                      <Input
                        id="outlet-address"
                        placeholder="Enter full address"
                        value={formData.outletAddress}
                        onChange={(e) => setFormData({ ...formData, outletAddress: e.target.value })}
                        required={addOutlet}
                      />
                    </div>
                    <div>
                      <Label htmlFor="outlet-google-map">Google Map Location</Label>
                      <Input
                        id="outlet-google-map"
                        type="url"
                        placeholder="Paste Google Maps URL or embed link"
                        value={formData.outletGoogleMapLocation}
                        onChange={(e) => setFormData({ ...formData, outletGoogleMapLocation: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional: Add Google Maps link for this outlet location</p>
                    </div>
                    <div>
                      <Label htmlFor="outlet-image">Outlet Image</Label>
                      <div className="space-y-2">
                        <Label htmlFor="outlet-image-file" className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 w-fit">
                            {uploadingOutletImage ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>Choose Image</span>
                              </>
                            )}
                          </div>
                          <Input
                            id="outlet-image-file"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleOutletImageChange}
                            className="hidden"
                            disabled={uploadingOutletImage}
                          />
                        </Label>
                        {formData.outletImageName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>{formData.outletImageName}</span>
                          </div>
                        )}
                        {!formData.outletImageName && (
                          <p className="text-sm text-gray-500">No image chosen (optional)</p>
                        )}
                      </div>
                    </div>
                </CardContent>
              </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/vendor/client">Cancel</Link>
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
