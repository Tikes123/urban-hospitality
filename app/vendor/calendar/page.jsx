"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VendorHeader } from "@/components/vendor/vendor-header"
import {
  Plus,
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  User,
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
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [viewMode, setViewMode] = useState("month")
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

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
            title: s.candidateName && s.outletName ? `${s.candidateName} - ${s.outletName}` : "Interview",
            type: "interview",
            date: dateStr,
            time: timeStr,
            scheduledAt: s.scheduledAt,
            location: s.outletName || "",
            attendees: [s.candidateName].filter(Boolean),
            meetingType: (s.type || "in-person").toLowerCase(),
            remarks: s.remarks,
          }
        })
        setEvents(mapped)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [currentDate, viewMode])

  const getEventTypeColor = (type) => {
    switch (type) {
      case "interview":
        return "bg-green-100 text-green-800 border-green-200"
      case "meeting":
        return "bg-green-100 text-green-800 border-green-200"
      case "orientation":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

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
            <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule New Event</DialogTitle>
                  <DialogDescription>Create a new calendar event or interview</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input id="event-title" placeholder="Enter event title" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-type">Event Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="orientation">Orientation</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="meeting-type">Meeting Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meeting type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-person">In Person</SelectItem>
                          <SelectItem value="video">Video Call</SelectItem>
                          <SelectItem value="phone">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-date">Date</Label>
                      <Input id="event-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="event-time">Time</Label>
                      <Input id="event-time" type="time" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-duration">Duration</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="event-location">Location</Label>
                      <Input id="event-location" placeholder="Enter location" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="event-attendees">Attendees</Label>
                    <Input id="event-attendees" placeholder="Enter attendee names or emails" />
                  </div>
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea id="event-description" placeholder="Event description or notes" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>
                      Cancel
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">Schedule Event</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                  </CardTitle>
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
                  <div className="flex justify-center py-8 text-gray-500">Loading...</div>
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
                          <div className="text-sm font-medium mb-2">{date.getDate()} {monthNames[date.getMonth()]}</div>
                          <div className="space-y-1">
                            {getEventsForDate(date).map((event) => (
                              <div key={event.id} className={`text-xs p-2 rounded border ${getEventTypeColor(event.type)}`}>
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
                            <div key={event.id} className={`p-4 rounded-lg border ${getEventTypeColor(event.type)}`}>
                              <div className="flex items-center gap-2">
                                {getMeetingTypeIcon(event.meetingType)}
                                <span className="font-medium">{event.title}</span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{event.time}</span>
                                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{event.location}</span>
                                {event.attendees?.length ? <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{event.attendees.join(", ")}</span> : null}
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
                      className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        date ? "bg-white" : "bg-gray-50"
                      } ${date && date.toDateString() === new Date().toDateString() ? "ring-2 ring-green-500" : ""}`}
                      onClick={() => date && setSelectedDate(date)}
                    >
                      {date && (
                        <>
                          <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                          <div className="space-y-1">
                            {getEventsForDate(date)
                              .slice(0, 2)
                              .map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)}`}
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Events Sidebar: selected date or upcoming */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate ? `Events on ${selectedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Upcoming Events"}
                </CardTitle>
                <CardDescription>
                  {selectedDate ? "Click a date on the calendar to see events" : "Next 7 days"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(selectedDate ? getEventsForDate(selectedDate) : events
                    .filter((e) => {
                      const d = new Date(e.date + "T00:00:00")
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const end = new Date(today)
                      end.setDate(end.getDate() + 7)
                      return d >= today && d <= end
                    })
                    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                    .slice(0, 10)
                  ).map((event) => (
                    <div key={event.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">{event.type}</Badge>
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
                        {event.attendees?.length > 0 && (
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {event.attendees.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {!selectedDate && events.filter((e) => {
                    const d = new Date(e.date + "T00:00:00")
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const end = new Date(today)
                    end.setDate(end.getDate() + 7)
                    return d >= today && d <= end
                  }).length === 0 && (
                    <p className="text-sm text-gray-500">No upcoming events in the next 7 days.</p>
                  )}
                  {selectedDate && getEventsForDate(selectedDate).length === 0 && (
                    <p className="text-sm text-gray-500">No events on this date.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Interviews (this view)</span>
                    <Badge className="bg-blue-100 text-blue-800">{events.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
