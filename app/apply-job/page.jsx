"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, Briefcase, Hotel, UtensilsCrossed, Wine } from "lucide-react"

const AREA_IMAGES = {
  "Koramangala": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop",
  "Indiranagar": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop",
  "HSR Layout": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop",
  "Whitefield": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=250&fit=crop",
  "Electronic City": "https://images.unsplash.com/photo-1564501049412-61c31a7cdf1e?w=400&h=250&fit=crop",
  "Jayanagar": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=250&fit=crop",
  "MG Road": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop",
  "Marathahalli": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=250&fit=crop",
  "Bellandur": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop",
  "JP Nagar": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop",
  "Bannerghatta Road": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop",
}

const defaultImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop"

export default function ApplyJobPage() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [venueType, setVenueType] = useState("all")

  useEffect(() => {
    async function fetchAreas() {
      setLoading(true)
      try {
        const res = await fetch(`/api/jobs/areas?type=${venueType}`)
        if (res.ok) {
          const data = await res.json()
          setAreas(data)
        } else {
          setAreas([])
        }
      } catch {
        setAreas([])
      } finally {
        setLoading(false)
      }
    }
    fetchAreas()
  }, [venueType])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-light)]/20 to-white">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Find Jobs by Area</h1>
          <p className="text-gray-600">Choose your preferred location in Bangalore. We'll show openings or the nearest area with jobs.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
          <span className="text-sm font-medium text-gray-700">Venue type:</span>
          <Select value={venueType} onValueChange={setVenueType}>
            <SelectTrigger className="w-[200px] border-[var(--brand)]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="hotel">
                <span className="flex items-center gap-2"><Hotel className="w-4 h-4" /> Hotel</span>
              </SelectItem>
              <SelectItem value="restaurant">
                <span className="flex items-center gap-2"><UtensilsCrossed className="w-4 h-4" /> Restaurant</span>
              </SelectItem>
              <SelectItem value="bar">
                <span className="flex items-center gap-2"><Wine className="w-4 h-4" /> Bar</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-gray-200">
                <div className="h-40 bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3 mb-2" />
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <Carousel opts={{ align: "start", loop: false }} className="w-full mb-8">
              <CarouselContent className="-ml-2 md:-ml-4">
                {areas.map((a) => (
                  <CarouselItem key={a.area} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <Card className="overflow-hidden border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="relative h-40 bg-gray-100">
                        <img
                          src={AREA_IMAGES[a.area] || defaultImage}
                          alt={a.area}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="font-semibold">{a.area}</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <Briefcase className="w-4 h-4 text-[var(--brand)]" />
                          <span className="text-sm">
                            {a.jobCount > 0 ? (
                              <>{a.jobCount} opening{a.jobCount !== 1 ? "s" : ""}</>
                            ) : (
                              <>No openings here. Try <strong>{a.nearestArea}</strong> ({a.nearestJobCount} openings)</>
                            )}
                          </span>
                        </div>
                        <Button className="w-full bg-[var(--brand)] hover:bg-[var(--brand-hover)]" asChild>
                          <Link href={a.jobCount > 0 ? `/apply?location=${encodeURIComponent(a.area)}` : `/apply?location=${encodeURIComponent(a.nearestArea)}`}>
                            {a.jobCount > 0 ? "Apply here" : "Apply in nearest area"}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="border-[var(--brand)] text-[var(--brand)]" />
              <CarouselNext className="border-[var(--brand)] text-[var(--brand)]" />
            </Carousel>

            <div className="text-center">
              <Button size="lg" className="bg-[var(--brand)] hover:bg-[var(--brand-hover)]" asChild>
                <Link href="/apply">Fill application form</Link>
              </Button>
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
