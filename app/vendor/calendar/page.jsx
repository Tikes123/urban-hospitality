"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VendorHeader } from "@/components/vendor/vendor-header"
import {
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  User,
  Loader2,
} from "lucide-react"

function toDateString(d) {
  return d.toISOString().split("T")[0]
}

function getMonthRange(date) {
  const y = date.getFullYear()
  const m = date.getMonth()
  const first = new Date(y, m, 1)
  const last = new Date(y, m + 1, 0)
  return { from: toDateString(first), to: toDateString(last) }
}

function getWeekRange(date) {
  const d = new Date(date)
  const day = d.getDay() // 0 Sun .. 6 Sat
  const dateNum = d.getDate()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d.getFullYear(), d.getMonth(), dateNum + mondayOffset)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { from: toDateString(monday), to: toDateString(sunday) }
}

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState("month")
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  const currentYear = currentDate.getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  useEffect(() => {
    let from, to
    if (viewMode === "month") {
      const r = getMonthRange(currentDate)
      from = r.from
      to = r.to
    } else if (viewMode === "week") {
      const r = getWeekRange(currentDate)
      from = r.from
      to = r.to
    } else {
      const d = toDateString(currentDate)
      from = d
      to = d
    }
    setLoading(true)
    fetch(`/api/schedules?from=${from}&to=${to}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((schedules) => {
        const mapped = (Array.isArray(schedules) ? schedules : []).map((s) => {
          const at = new Date(s.scheduledAt)
          const dateStr = toDateString(at)
          const timeStr = at.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
          return {
            id: s.id,
            candidateId: s.candidateId,
            candidateName: s.candidateName || "Unknown",
            outletName: s.outletName || "",
            title: s.candidateName && s.outletName ? `${s.candidateName} - ${s.outletName}` : "Interview",
            type: "interview",
            date: dateStr,
            time: timeStr,
            scheduledAt: s.scheduledAt,
            location: s.outletName || "",
            meetingType: (s.type || "in-person").toLowerCase(),
            remarks: s.remarks,
          }
        })
        setEvents(mapped)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [currentDate, viewMode])

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "phone":
        return <Phone className="w-4 h-4" />
      case "in-person":
        return <User className="w-4 h-4" />
      default:
        return <CalendarIcon className="w-4 h-4" />
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date) => {
    const dateString = typeof date === "string" ? date : date.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateString)
  }

  const hasDataForDate = (date) => {
    return getEventsForDate(date).length > 0
  }

  const handleDateClick = (date) => {
    if (!date) return
    const dateStr = date.toISOString().split("T")[0]
    router.push(`/vendor/calendar/day/${dateStr}`)
  }

  const handleMonthClick = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    router.push(`/vendor/calendar/month/${year}/${month}`)
  }

  const getWeekDays = (date) => {
    const r = getWeekRange(date)
    const days = []
    const start = new Date(r.from + "T00:00:00")
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const navigate = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (viewMode === "month") {
        if (direction === "prev") newDate.setMonth(prev.getMonth() - 1)
        else newDate.setMonth(prev.getMonth() + 1)
      } else if (viewMode === "week") {
        newDate.setDate(prev.getDate() + (direction === "prev" ? -7 : 7))
      } else {
        newDate.setDate(prev.getDate() + (direction === "prev" ? -1 : 1))
      }
      return newDate
    })
  }

  const handleYearChange = (year) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(parseInt(year))
    setCurrentDate(newDate)
  }

  const handleMonthChange = (month) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(parseInt(month))
    setCurrentDate(newDate)
  }

  // Get upcoming events from now to 2 hours ahead
  const getUpcomingEvents = () => {
    const now = new Date()
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    
    return events
      .filter((event) => {
        const eventTime = new Date(event.scheduledAt)
        return eventTime >= now && eventTime <= twoHoursLater
      })
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
  }

  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Scheduling</h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-white rounded-lg border">
              <Button
                variant={viewMode === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("month")}
              >
                Month
              </Button>
              <Button variant={viewMode === "week" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("week")}>
                Week
              </Button>
              <Button variant={viewMode === "day" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("day")}>
                Day
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarIcon className="w-5 h-5" />
                      <span>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </span>
                    </CardTitle>
                    <Select value={String(currentDate.getMonth())} onValueChange={handleMonthChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthNames.map((month, index) => (
                          <SelectItem key={index} value={String(index)}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={String(currentDate.getFullYear())} onValueChange={handleYearChange}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("prev")}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("next")}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="flex justify-center py-8 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading...
                  </div>
                )}
                {viewMode === "week" && !loading && (
                  <>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2 min-h-[400px]">
                      {getWeekDays(currentDate).map((date) => (
                        <div key={date.toISOString()} className="border rounded-lg p-2 bg-white min-h-[200px]">
                          <div className="text-sm font-medium mb-2 flex items-center justify-between">
                            <span>{date.getDate()} {monthNames[date.getMonth()]}</span>
                            {hasDataForDate(date) && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="space-y-1">
                            {getEventsForDate(date).map((event) => (
                              <div key={event.id} className="text-xs p-2 rounded border bg-green-100 text-green-800 border-green-200">
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="text-gray-600">{event.time}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {viewMode === "day" && !loading && (
                  <div className="space-y-3">
                    <div className="text-lg font-medium">
                      {currentDate.getDate()} {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </div>
                    <div className="space-y-2">
                      {getEventsForDate(currentDate).length === 0 ? (
                        <p className="text-gray-500 text-sm">No interviews scheduled for this day.</p>
                      ) : (
                        getEventsForDate(currentDate)
                          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                          .map((event) => (
                            <div key={event.id} className="p-4 rounded-lg border bg-green-100 text-green-800 border-green-200">
                              <div className="flex items-center gap-2">
                                {getMeetingTypeIcon(event.meetingType)}
                                <span className="font-medium">{event.title}</span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{event.time}</span>
                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{event.location}</span>
                              </div>
                              {event.remarks && <p className="text-xs text-gray-500 mt-1">{event.remarks}</p>}
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
                {viewMode === "month" && !loading && (
                  <>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentDate).map((date, index) => (
                        <div
                          key={index}
                          className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 relative ${
                            date ? "bg-white" : "bg-gray-50"
                          } ${date && date.toDateString() === new Date().toDateString() ? "ring-2 ring-green-500" : ""}`}
                          onClick={() => date && handleDateClick(date)}
                        >
                          {date && (
                            <>
                              <div className="text-sm font-medium mb-1 flex items-center justify-between">
                                <span>{date.getDate()}</span>
                                {hasDataForDate(date) && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                              </div>
                              <div className="space-y-1">
                                {getEventsForDate(date)
                                  .slice(0, 2)
                                  .map((event) => (
                                    <div
                                      key={event.id}
                                      className="text-xs p-1 rounded border bg-green-100 text-green-800 border-green-200"
                                    >
                                      <div className="flex items-center space-x-1">
                                        {getMeetingTypeIcon(event.meetingType)}
                                        <span className="truncate">{event.title}</span>
                                      </div>
                                    </div>
                                  ))}
                                {getEventsForDate(date).length > 2 && (
                                  <div className="text-xs text-gray-500">+{getEventsForDate(date).length - 2} more</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" onClick={handleMonthClick}>
                        View Month Data
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <p className="text-sm text-gray-500">Next 2 hours</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-gray-500">No events in the next 2 hours.</p>
                  ) : (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{event.candidateName}</h4>
                          <Badge variant="outline" className="text-xs">interview</Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {event.date}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {event.time}
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  )
}
