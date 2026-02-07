"use client"

import { useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Mail, Phone } from "lucide-react"

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-light)]/20 to-white">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600">Get in touch or request a demo of our platform.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reach us</h2>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[var(--brand)]" />
                <span>Bangalore, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--brand)]" />
                <a href="mailto:support@urbanhospitality.com" className="hover:text-[var(--brand)]">
                  support@urbanhospitality.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--brand)]" />
                <a href="tel:+919876543210" className="hover:text-[var(--brand)]">+91 98765 43210</a>
              </li>
            </ul>
          </div>

          <Card id="demo" className="border-gray-200">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
              <CardDescription>We'll get back to you soon. For demo, mention "Request a demo".</CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <p className="text-[var(--brand)] font-medium">Thank you. We'll be in touch shortly.</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="e.g. Request a demo" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" rows={4} required className="mt-1" />
                  </div>
                  <Button type="submit" className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)]">
                    Send
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
