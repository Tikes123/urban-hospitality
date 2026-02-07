"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Hotel, UtensilsCrossed, Wine, MapPin, Quote, ChevronRight, Play, ChevronDown } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const BANGALORE_AREAS = [
  "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Electronic City",
  "Jayanagar", "MG Road", "Marathahalli", "Bellandur", "JP Nagar", "Bannerghatta Road",
]

const TESTIMONIALS = [
  { name: "Sarah Johnson", role: "Hotel Manager", company: "Grand Plaza", content: "Urban Hospitality Solutions transformed our operations. Seamless scheduling and 40% better guest satisfaction.", rating: 5 },
  { name: "Michael Chen", role: "Restaurant Owner", company: "Chen's Bistro", content: "Reduced food waste by 30% and improved margins significantly with their platform.", rating: 5 },
  { name: "Emily Rodriguez", role: "Bar Manager", company: "The Rooftop Lounge", content: "Signature cocktails and revenue up 50%. Their expertise made the difference.", rating: 5 },
]

const FAQ_ITEMS_STATIC = [
  { q: "What areas do you serve?", a: "We are active across Bangalore: Koramangala, Indiranagar, HSR, Whitefield, Electronic City, MG Road, and more." },
  { q: "How do I apply for a job?", a: "Go to Apply Job, choose your preferred location and venue type (restaurant, bar, hotel). You'll see open positions and can apply from there." },
  { q: "What is your pricing for businesses?", aKey: "pricing" },
  { q: "Do you offer a demo?", a: "Yes. Use the Demo section on this page or contact us to schedule a walkthrough." },
]

export default function HomePage() {
  const rootRef = useRef(null)
  const [pricing, setPricing] = useState({ yearlyVendorPrice: 6000, hrMailPrice: 2000 })
  useEffect(() => {
    fetch("/api/pricing").then((r) => (r.ok ? r.json() : {})).then(setPricing).catch(() => {})
  }, [])
  const FAQ_ITEMS = FAQ_ITEMS_STATIC.map((item) => ({
    ...item,
    a: item.aKey === "pricing"
      ? `Software subscription is ₹${(pricing.yearlyVendorPrice ?? 6000).toLocaleString("en-IN")}/year. Per employee email activation is ₹${(pricing.hrMailPrice ?? 2000).toLocaleString("en-IN")}/month. Contact us for a demo.`
      : item.a,
  }))
  const heroTitleRef = useRef(null)
  const heroSubRef = useRef(null)
  const heroCtaRef = useRef(null)
  const sectionRefs = useRef([])

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(heroTitleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
      gsap.fromTo(heroSubRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.2, ease: "power3.out" })
      gsap.fromTo(heroCtaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: "power3.out" })

      sectionRefs.current.forEach((el) => {
        if (!el) return
        gsap.fromTo(
          el,
          { y: 50, opacity: 0.6 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
          }
        )
      })
    }, rootRef.current)
    return () => ctx.revert()
  }, [])

  const WAVE_BASE = 50

  return (
    <div ref={rootRef} className="min-h-screen bg-gradient-to-b from-gray-100 via-[var(--brand-light)]/20 to-white">
      <SiteHeader />

      {/* Top banner */}
      <div className="bg-[var(--brand)]/90 text-white text-center py-2 px-4 text-sm font-medium">
        HELPING HOSPITALITY BUSINESSES GROW — TALENT & RECRUITMENT MADE SIMPLE
      </div>

      {/* Hero card with waves */}
      <section className="relative py-12 md:py-16 px-4">
        <div className="max-w-[1100px] mx-auto relative rounded-3xl bg-white shadow-xl overflow-hidden">
          <div className="relative z-0 flex flex-col items-center justify-center min-h-[420px] md:min-h-[480px] px-6 py-12 md:py-16">
            {/* Concentric waves: start from 50px circle, scale up to 15 (750px), then fill to card edges (1100px) */}
            <div className="absolute pointer-events-none" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
              <div
                className="absolute rounded-full bg-white border-2 border-[var(--brand)]/30 shadow-inner"
                style={{ width: 50, height: 50, left: -25, top: -25 }}
                aria-hidden
              />
              {[1, 3, 6, 9, 12, 15].map((scale, i) => {
                const size = WAVE_BASE * scale
                const half = size / 2
                return (
                  <div
                    key={scale}
                    className="absolute rounded-full bg-gradient-to-br from-[var(--brand-light)]/35 via-[var(--brand)]/8 to-[var(--brand-muted)]/12 animate-wave-pulse"
                    style={{
                      width: size,
                      height: size,
                      left: -half,
                      top: -half,
                      opacity: Math.max(0.2, 0.65 - scale * 0.03),
                      animationDelay: `${i * 0.3}s`,
                    }}
                    aria-hidden
                  />
                )
              })}
              {/* Outer wave: scale 15 = 750px diameter; extend to 1100px so waves reach card edges */}
              <div
                className="absolute rounded-full bg-gradient-to-br from-[var(--brand-light)]/20 via-[var(--brand)]/5 to-transparent animate-wave-pulse"
                style={{
                  width: 1100,
                  height: 1100,
                  left: -550,
                  top: -550,
                  opacity: 0.45,
                  animationDelay: "0.6s",
                }}
                aria-hidden
              />
            </div>

            <div className="relative z-10 text-center max-w-3xl">
              <h1 ref={heroTitleRef} className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="inline-block bg-[var(--brand)] text-white px-2 py-0.5 rounded-md mr-1">Where</span>
                {" "}Hospitality Talent Meets Opportunity
              </h1>
              <p ref={heroSubRef} className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Complete hospitality management platform connecting talented professionals with premier hotels, restaurants, and bars.
              </p>
              <p className="text-sm text-gray-500 mb-6">Hospitality • Talent • Hotels & Restaurants</p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {["Hotels", "Restaurants", "Bars", "Bangalore", "Recruitment", "Apply Now"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div ref={heroCtaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg gap-2" asChild>
                  <Link href="/apply-job" className="inline-flex items-center gap-2">
                    Find Opportunities
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand-light)] rounded-lg" asChild>
                  <Link href="/for-business">For Business</Link>
                </Button>
              </div>

              <a href="#who-we-are" className="mt-10 inline-flex flex-col items-center gap-1 text-gray-500 hover:text-[var(--brand)] transition-colors">
                <span className="w-12 h-12 rounded-full border-2 border-[var(--brand)]/40 flex items-center justify-center bg-white/80">
                  <ChevronDown className="w-5 h-5" />
                </span>
                <span className="text-xs font-medium">Explore more</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section id="who-we-are" className="py-16 md:py-20 px-4 bg-white scroll-mt-16">
        <div
          className="max-w-4xl mx-auto text-center"
          ref={(el) => { sectionRefs.current[0] = el }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Urban Hospitality Solutions is a Bangalore-based platform that bridges the gap between hospitality talent and businesses. We help hotels, restaurants, and bars find the right people and help professionals find the right opportunities—all in one place.
          </p>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 md:py-20 px-4">
        <div
          className="max-w-7xl mx-auto"
          ref={(el) => { sectionRefs.current[1] = el }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Hotel className="w-12 h-12 text-[var(--brand)] mb-2" />
                <CardTitle>Hotel Management</CardTitle>
                <CardDescription>
                  Staff scheduling, guest services, and facility management for hotels.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <UtensilsCrossed className="w-12 h-12 text-[var(--brand)] mb-2" />
                <CardTitle>Restaurant Operations</CardTitle>
                <CardDescription>
                  Kitchen to front-of-house coordination and customer service.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wine className="w-12 h-12 text-[var(--brand)] mb-2" />
                <CardTitle>Bar & Beverage</CardTitle>
                <CardDescription>
                  Mixology, inventory, and customer experience for bars.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Areas We Are Active - Bangalore */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div
          className="max-w-7xl mx-auto"
          ref={(el) => { sectionRefs.current[2] = el }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">Areas We Serve</h2>
          <p className="text-center text-gray-600 mb-10">All across Bangalore, India</p>
          <div className="flex flex-wrap justify-center gap-3">
            {BANGALORE_AREAS.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--brand-light)] text-[var(--brand-muted)] font-medium text-sm"
              >
                <MapPin className="w-4 h-4" />
                {area}
              </span>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="border-[var(--brand)] text-[var(--brand)]" asChild>
              <Link href="/apply-job">See jobs by area</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Blogs preview */}
      <section className="py-16 md:py-20 px-4">
        <div
          className="max-w-7xl mx-auto"
          ref={(el) => { sectionRefs.current[3] = el }}
        >
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Blogs</h2>
            <Link href="/blogs" className="text-[var(--brand)] font-medium flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Link key={i} href="/blogs">
                <Card className="h-full border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-40 bg-gray-100" />
                  <CardHeader>
                    <CardTitle className="text-lg">Blog post {i}</CardTitle>
                    <CardDescription>Short excerpt for the latest updates and insights.</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Carousel - Testimonials */}
      <section className="py-16 md:py-20 px-4 bg-white">
        <div
          className="max-w-4xl mx-auto"
          ref={(el) => { sectionRefs.current[4] = el }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-10">What Our Clients Say</h2>
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent>
              {TESTIMONIALS.map((t) => (
                <CarouselItem key={t.name}>
                  <Card className="border-gray-200">
                    <CardContent className="pt-6">
                      <Quote className="w-10 h-10 text-[var(--brand)]/50 mb-4" />
                      <p className="text-gray-600 mb-4">&ldquo;{t.content}&rdquo;</p>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role}, {t.company}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-[var(--brand)] text-[var(--brand)]" />
            <CarouselNext className="border-[var(--brand)] text-[var(--brand)]" />
          </Carousel>
        </div>
      </section>

      {/* Contact CTA + Demo our service */}
      <section className="py-16 md:py-20 px-4 bg-[var(--brand)] text-white">
        <div
          className="max-w-4xl mx-auto text-center"
          ref={(el) => { sectionRefs.current[5] = el }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-white/90 text-lg mb-8">
            Have questions? Want a demo of our platform? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-[var(--brand)] hover:bg-gray-100" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-[var(--brand)]"
              asChild
            >
              <Link href="/contact#demo">Request a Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 px-4">
        <div
          className="max-w-2xl mx-auto"
          ref={(el) => { sectionRefs.current[6] = el }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-10">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
