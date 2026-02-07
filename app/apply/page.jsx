"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, MapPin, Briefcase, Users, Loader2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { toast } from "sonner"

const POSITION_LABELS = {
  "hotel-manager": "Hotel Manager",
  "front-desk": "Front Desk Associate",
  "housekeeping": "Housekeeping",
  "head-chef": "Head Chef",
  "sous-chef": "Sous Chef",
  "line-cook": "Line Cook",
  "server": "Server",
  "bartender": "Bartender",
  "host-hostess": "Host/Hostess",
  "event-coordinator": "Event Coordinator",
}

export default function ApplyPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    location: "",
    availability: "",
    resume: null,
    coverLetter: "",
  })
  const [venueName, setVenueName] = useState(null)
  const [nearestVenues, setNearestVenues] = useState([])
  const [areas, setAreas] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const locationParam = searchParams.get("location")
  const venueParam = searchParams.get("venue")
  const positionParam = searchParams.get("position")

  useEffect(() => {
    if (locationParam) setFormData((prev) => ({ ...prev, location: decodeURIComponent(locationParam) }))
    if (venueParam) setVenueName(decodeURIComponent(venueParam))
    if (positionParam) setFormData((prev) => ({ ...prev, position: positionParam }))
  }, [locationParam, venueParam, positionParam])

  useEffect(() => {
    fetch("/api/areas")
      .then((res) => (res.ok ? res.json() : []))
      .then(setAreas)
      .catch(() => setAreas([]))
  }, [])

  useEffect(() => {
    const area = formData.location || locationParam
    if (!area) {
      setNearestVenues([])
      return
    }
    fetch(`/api/outlets?area=${encodeURIComponent(area)}&limit=50`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((json) => setNearestVenues(Array.isArray(json) ? json : (json.data || [])))
      .catch(() => setNearestVenues([]))
  }, [formData.location, locationParam])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const form = new FormData()
      form.append("fullName", formData.fullName)
      form.append("email", formData.email)
      form.append("phone", formData.phone)
      form.append("position", formData.position)
      form.append("experience", formData.experience)
      form.append("location", formData.location)
      form.append("availability", formData.availability)
      form.append("coverLetter", formData.coverLetter)
      if (formData.resume) form.append("resume", formData.resume)
      const res = await fetch("/api/apply", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit")
      toast.success(data.message || "Application submitted successfully!")
      setFormData({ fullName: "", email: "", phone: "", position: "", experience: "", location: "", availability: "", resume: null, coverLetter: "" })
    } catch (err) {
      toast.error(err.message || "Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  const applyingForLabel = positionParam ? POSITION_LABELS[positionParam] || positionParam : formData.position ? POSITION_LABELS[formData.position] || formData.position : null
  const showTopCard = venueName || formData.location || applyingForLabel

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-light)]/20 to-white">
      <SiteHeader />

      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Apply for a Position</h1>
          <p className="text-xl text-gray-600">No login required. Choose location and venue, then fill the form below.</p>
        </div>

        {/* Location and venues above form */}
        <Card className="mb-8 border-2 border-[var(--brand)]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--brand)]" />
              Preferred location & venues
            </CardTitle>
            <CardDescription>Select your area to see venues and openings. You can apply for our network or a specific venue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm">
              <Label>Preferred location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area (same as find job by area)" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.location && (
              <>
                <h4 className="font-medium text-gray-900">Venues in this area</h4>
                {nearestVenues.length === 0 ? (
                  <p className="text-sm text-gray-500">No venues found in this area. You can still apply for our network using the form below.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nearestVenues.map((v) => (
                      <Link
                        key={v.id}
                        href={`/apply?location=${encodeURIComponent(v.area || formData.location)}&venue=${encodeURIComponent(v.name)}`}
                        className="block"
                      >
                        <Card className="overflow-hidden border-gray-200 hover:border-[var(--brand)]/40 hover:shadow-md transition-all">
                          <div className="aspect-video max-h-28 w-full bg-gray-100 relative">
                            {v.image ? (
                              <img src={v.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-[var(--brand)]/10">
                                <Briefcase className="w-8 h-8 text-[var(--brand)]" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <p className="font-medium text-gray-900 truncate">{v.name}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{v.address}</span>
                            </p>
                            <p className="text-xs text-[var(--brand)] flex items-center gap-1 mt-1">
                              <Users className="w-3 h-3" />
                              {(v.openPositions ?? 0)} opening{(v.openPositions ?? 0) !== 1 ? "s" : ""}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {showTopCard && (
              <Card className="border-2 border-[var(--brand)]/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-28 h-28 sm:h-auto sm:min-w-[7rem] bg-[var(--brand)]/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-12 h-12 text-[var(--brand)]" />
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col justify-center">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">You are applying for</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">
                        {venueName || formData.location || "Our network"}
                        {applyingForLabel && (
                          <span className="text-[var(--brand)] font-semibold block mt-1">{applyingForLabel}</span>
                        )}
                      </p>
                      {formData.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-4 h-4 text-[var(--brand)]" />
                          {formData.location}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
                <CardDescription>Fill out the form below to apply for positions in our hospitality network</CardDescription>
              </CardHeader>
              <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Desired Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotel-manager">Hotel Manager</SelectItem>
                      <SelectItem value="front-desk">Front Desk Associate</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="head-chef">Head Chef</SelectItem>
                      <SelectItem value="sous-chef">Sous Chef</SelectItem>
                      <SelectItem value="line-cook">Line Cook</SelectItem>
                      <SelectItem value="server">Server</SelectItem>
                      <SelectItem value="bartender">Bartender</SelectItem>
                      <SelectItem value="host-hostess">Host/Hostess</SelectItem>
                      <SelectItem value="event-coordinator">Event Coordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => setFormData({ ...formData, experience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry-level">Entry Level (0-1 years)</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Preferred Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                    required
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select area (same as find job by area)" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Availability *</Label>
                  <RadioGroup
                    value={formData.availability}
                    onValueChange={(value) => setFormData({ ...formData, availability: value })}
                    className="flex flex-col space-y-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate">Immediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2-weeks" id="2-weeks" />
                      <Label htmlFor="2-weeks">2 weeks notice</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-month" id="1-month" />
                      <Label htmlFor="1-month">1 month notice</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label htmlFor="resume">Resume/CV *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop your resume</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => setFormData({ ...formData, resume: e.target.files?.[0] || null })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Tell us why you're interested in working with us..."
                  rows={4}
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[var(--brand)] hover:underline">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[var(--brand)] hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button type="submit" className="bg-[var(--brand)] hover:bg-[var(--brand-hover)]" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <h3 className="font-semibold text-gray-900">Need help?</h3>
              <p className="text-sm text-gray-600">No login required to apply. After submitting, you can log in with your <strong>phone number</strong> and password <strong>welcome1</strong> to track applications. Change your password in your profile.</p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/my-applications">My applications</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
