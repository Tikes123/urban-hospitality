"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

export default function AddOutletClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingContract, setUploadingContract] = useState(false)
  const [addOutlet, setAddOutlet] = useState(false)
  const [areas, setAreas] = useState([])
  const [clients, setClients] = useState([])
  const [formData, setFormData] = useState({
    // Client fields
    clientName: "",
    companyName: "",
    designation: "",
    clientPhone: "",
    clientEmail: "",
    clientLocation: "",
    clientStatus: "active",
    // Outlet fields
    outletName: "",
    outletType: "",
    outletArea: "",
    outletAddress: "",
    outletPhone: "",
    outletEmail: "",
    outletManager: "",
    outletStatus: "active",
    // Contract file
    contractFile: null,
    contractFileName: "",
  })

  useEffect(() => {
    fetch("/api/areas")
      .then((res) => (res.ok ? res.json() : []))
      .then(setAreas)
      .catch(() => setAreas([]))
    
    fetch("/api/clients?limit=200")
      .then((res) => (res.ok ? res.json() : {}))
      .then((json) => setClients(json.data ?? []))
      .catch(() => setClients([]))
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      toast.error("Please fill in all required client fields")
      return
    }

    if (addOutlet && (!formData.outletName || !formData.outletType || !formData.outletAddress)) {
      toast.error("Please fill in all required outlet fields")
      return
    }

    try {
      setLoading(true)

      // Create client first
      const clientData = {
        name: formData.clientName,
        type: formData.outletType || "hotel", // Use outlet type or default
        contactPerson: formData.clientName,
        email: formData.clientEmail,
        phone: formData.clientPhone,
        address: formData.clientLocation,
        outlets: addOutlet ? 1 : 0,
        employees: 0,
        contractValue: 0,
        contractStart: new Date().toISOString().split("T")[0],
        contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: formData.clientStatus,
        services: JSON.stringify([]),
        contractFile: formData.contractFile,
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

      // Create outlet if requested
      if (addOutlet) {
        const outletData = {
          name: formData.outletName,
          type: formData.outletType,
          area: formData.outletArea,
          address: formData.outletAddress,
          phone: formData.outletPhone,
          email: formData.outletEmail,
          manager: formData.outletManager,
          employees: 0,
          openPositions: 0,
          status: formData.outletStatus,
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

      // Redirect to appropriate page
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
              <Link href="/vendor" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Client & Outlet</h1>
            <p className="text-muted-foreground mt-1">
              Add a new client and optionally create an outlet in one step. Upload contract file if available.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>Required information for the client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-name">Client Name *</Label>
                      <Input
                        id="client-name"
                        placeholder="Enter client name"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        placeholder="Enter designation"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-status">Status *</Label>
                      <Select value={formData.clientStatus} onValueChange={(value) => setFormData({ ...formData, clientStatus: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="renewal-pending">Renewal Pending</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client-phone">Client Phone *</Label>
                      <Input
                        id="client-phone"
                        placeholder="Phone number"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="client-email">Client Email *</Label>
                      <Input
                        id="client-email"
                        type="email"
                        placeholder="Email address"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="client-location">Client Location</Label>
                    <Input
                      id="client-location"
                      placeholder="Location"
                      value={formData.clientLocation}
                      onChange={(e) => setFormData({ ...formData, clientLocation: e.target.value })}
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

              {/* Add Outlet Toggle */}
              <Card>
                <CardHeader>
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
                </CardHeader>
                {addOutlet && (
                  <CardContent className="space-y-4 pt-4">
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
                            <SelectItem value="hotel">Hotel</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="bar">Bar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="outlet-area">Area / Location</Label>
                        <Select value={formData.outletArea} onValueChange={(value) => setFormData({ ...formData, outletArea: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select area" />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="outlet-phone">Phone</Label>
                        <Input
                          id="outlet-phone"
                          placeholder="Phone number"
                          value={formData.outletPhone}
                          onChange={(e) => setFormData({ ...formData, outletPhone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="outlet-email">Email</Label>
                        <Input
                          id="outlet-email"
                          type="email"
                          placeholder="Email address"
                          value={formData.outletEmail}
                          onChange={(e) => setFormData({ ...formData, outletEmail: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="outlet-manager">Manager</Label>
                      <Input
                        id="outlet-manager"
                        placeholder="Manager name"
                        value={formData.outletManager}
                        onChange={(e) => setFormData({ ...formData, outletManager: e.target.value })}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

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
