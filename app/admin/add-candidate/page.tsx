"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Upload, Save, Send, LogOut } from "lucide-react"

export default function AddCandidatePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    location: "",
    availability: "",
    salary: "",
    skills: "",
    education: "",
    previousEmployer: "",
    references: "",
    notes: "",
    status: "recently-applied",
    source: "",
    resume: null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Candidate added:", formData)
    alert("Candidate added successfully!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">URBAN</h1>
                  <p className="text-xs text-green-600 -mt-1">Hospitality SOLUTIONS</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Your Next Resort, Search Made Easy</span>
            </div>

            <nav className="flex items-center space-x-6">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/admin/add-candidate" className="text-green-600 font-medium">
                Add New Candidate
              </Link>
              <Link href="/admin/applicants" className="text-gray-600 hover:text-gray-900">
                View Applicants
              </Link>
              <Link href="/admin/outlets" className="text-gray-600 hover:text-gray-900">
                Outlets
              </Link>
              <Link href="/admin/calendar" className="text-gray-600 hover:text-gray-900">
                Calendar
              </Link>
              <Link href="/admin/cv-links" className="text-gray-600 hover:text-gray-900">
                Active CV Links
              </Link>
              <Link href="/admin/designation" className="text-gray-600 hover:text-gray-900">
                Designation
              </Link>
              <Link href="/admin/client" className="text-gray-600 hover:text-gray-900">
                Client
              </Link>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 mb-6">
            <Link href="/admin" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Add New Candidate</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
              <CardDescription>Enter the candidate's details to add them to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
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

                {/* Position Information */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
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
                    <Label htmlFor="experience">Experience Level *</Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => setFormData({ ...formData, experience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
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
                  <div>
                    <Label htmlFor="salary">Expected Salary</Label>
                    <Input
                      id="salary"
                      placeholder="e.g., $50,000"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => setFormData({ ...formData, source: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="How did they find us?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="job-board">Job Board</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="walk-in">Walk-in</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status and Availability */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status *</Label>
                    <RadioGroup
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                      className="flex flex-col space-y-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recently-applied" id="recently-applied" />
                        <Label htmlFor="recently-applied">Recently Applied</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="suggested" id="suggested" />
                        <Label htmlFor="suggested">Suggested</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="backed-out" id="backed-out" />
                        <Label htmlFor="backed-out">Backed Out</Label>
                      </div>
                    </RadioGroup>
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

                {/* Additional Information */}
                <div>
                  <Label htmlFor="skills">Skills & Qualifications</Label>
                  <Textarea
                    id="skills"
                    placeholder="List relevant skills, certifications, and qualifications..."
                    rows={3}
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      placeholder="Highest education level"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="previousEmployer">Previous Employer</Label>
                    <Input
                      id="previousEmployer"
                      placeholder="Most recent employer"
                      value={formData.previousEmployer}
                      onChange={(e) => setFormData({ ...formData, previousEmployer: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="references">References</Label>
                  <Textarea
                    id="references"
                    placeholder="Reference contacts and information..."
                    rows={3}
                    value={formData.references}
                    onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Internal notes about the candidate..."
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <Label htmlFor="resume">Resume/CV</Label>
                  <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop resume</p>
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

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button type="button" variant="outline">
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Send className="w-4 h-4 mr-2" />
                    Add Candidate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
