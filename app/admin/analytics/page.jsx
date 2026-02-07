"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminHeader } from "@/components/admin/admin-header"
import { ArrowLeft, Users, Calendar, UserCheck, Loader2, BarChart3 } from "lucide-react"

const PERIODS = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("week")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ period })
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    fetch(`/api/analytics?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [period, from, to])

  const applyToday = () => {
    const d = new Date()
    setFrom(d.toISOString().slice(0, 10))
    setTo(d.toISOString().slice(0, 10))
    setPeriod("day")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-7 h-7" />
                Analytics
              </h1>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                  <div className="w-40">
                    <Label>Range</Label>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIODS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>From (optional)</Label>
                    <Input
                      type="date"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div>
                    <Label>To (optional)</Label>
                    <Input
                      type="date"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={applyToday}>
                    Today
                  </Button>
                </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : data && data.period !== "today" && (data.candidatesAdded !== undefined || data.perDayHiring?.length > 0) ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Candidates added</p>
                        <p className="text-2xl font-bold">{data.candidatesAdded ?? 0}</p>
                      </div>
                      <Users className="h-10 w-10 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Interviews scheduled</p>
                        <p className="text-2xl font-bold">{data.interviewsScheduled ?? 0}</p>
                      </div>
                      <Calendar className="h-10 w-10 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Hired</p>
                        <p className="text-2xl font-bold">{data.hiredCount ?? 0}</p>
                      </div>
                      <UserCheck className="h-10 w-10 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {data.perDayHiring && data.perDayHiring.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hiring per day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Hired count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.perDayHiring.map((row) => (
                            <TableRow key={row.date}>
                              <TableCell>{new Date(row.date).toLocaleDateString("en-IN")}</TableCell>
                              <TableCell>{row.hiredCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.hiredCandidates && data.hiredCandidates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hired candidates in period</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Date hired (updated)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.hiredCandidates.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell>{c.name}</TableCell>
                              <TableCell>
                                {c.updatedAt ? new Date(c.updatedAt).toLocaleString("en-IN") : "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(data.topHrByCandidates?.length > 0 || data.hiredByHr?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>HR insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {data.topHrByCandidates?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Candidates added by HR (this period)</h4>
                        <div className="overflow-x-auto rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>HR</TableHead>
                                <TableHead>Candidates added</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.topHrByCandidates.map((row, i) => (
                                <TableRow key={i}>
                                  <TableCell>{row.hr}</TableCell>
                                  <TableCell>{row.count}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                    {data.hiredByHr?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Hired candidates by HR</h4>
                        <div className="overflow-x-auto rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>HR</TableHead>
                                <TableHead>Hired count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.hiredByHr.map((row, i) => (
                                <TableRow key={i}>
                                  <TableCell>{row.hr}</TableCell>
                                  <TableCell>{row.count}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : data && data.period === "today" ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  For today&apos;s snapshot, see the admin home dashboard. Use the period selector above (Week / Month / Year) to see full analytics here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  {data ? "No analytics data for the selected period." : "Failed to load analytics."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
