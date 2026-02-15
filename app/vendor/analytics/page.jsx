"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { ArrowLeft, Users, Calendar, UserCheck, Loader2, BarChart3, UserX, XCircle, TrendingUp } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const PERIODS = [
  { value: "day", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
]

const BUCKETS = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "quarter", label: "Quarterly" },
]

export default function AnalyticsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState("week")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [bucket, setBucket] = useState("day")
  const [hrFilter, setHrFilter] = useState("all")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!t) {
      setAccessChecked(true)
      return
    }
    const hrId = typeof window !== "undefined" ? localStorage.getItem("vendor_view_as_hr_id") : null
    const permUrl = hrId ? `/api/vendor/menu-permissions?hrId=${hrId}` : "/api/vendor/menu-permissions"
    fetch(permUrl, { headers: { Authorization: `Bearer ${t}` } })
      .then((res) => (res.ok ? res.json() : {}))
      .then((d) => {
        if (d.allowedMap && d.allowedMap.analytics === false) {
          router.replace("/vendor")
          return
        }
        setAccessChecked(true)
      })
      .catch(() => setAccessChecked(true))
  }, [router])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ period, bucket, hrFilter: hrFilter || "all" })
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    const headers = t ? { Authorization: `Bearer ${t}` } : {}
    fetch(`/api/analytics?${params.toString()}`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [period, from, to, bucket, hrFilter])

  const applyToday = () => {
    const d = new Date()
    setFrom(d.toISOString().slice(0, 10))
    setTo(d.toISOString().slice(0, 10))
    setPeriod("day")
  }

  if (!accessChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/vendor" className="gap-2">
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
                  <div className="w-48">
                    <Label>View by</Label>
                    <Select value={hrFilter || "all"} onValueChange={setHrFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        {(data?.hrOptions ?? [{ value: "all", label: "All" }]).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Candidates added</p>
                        <p className="text-2xl font-bold">{data.candidatesAdded ?? 0}</p>
                      </div>
                      <Users className="h-10 w-10 text-green-500" />
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
                        {data.hiredPct != null && data.totalOutcomes > 0 && (
                          <p className="text-xs text-muted-foreground">{data.hiredPct}% of outcomes</p>
                        )}
                      </div>
                      <UserCheck className="h-10 w-10 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Backed out</p>
                        <p className="text-2xl font-bold">{data.backedOutCount ?? 0}</p>
                        {data.backedOutPct != null && data.totalOutcomes > 0 && (
                          <p className="text-xs text-muted-foreground">{data.backedOutPct}% of outcomes</p>
                        )}
                      </div>
                      <UserX className="h-10 w-10 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Not selected</p>
                        <p className="text-2xl font-bold">{data.notSelectedCount ?? 0}</p>
                        {data.notSelectedPct != null && data.totalOutcomes > 0 && (
                          <p className="text-xs text-muted-foreground">{data.notSelectedPct}% of outcomes</p>
                        )}
                      </div>
                      <XCircle className="h-10 w-10 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {data.comparison && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Interview scheduled vs Hired from them
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Interviews scheduled (period)</p>
                        <p className="text-2xl font-bold">{data.comparison.interviewsScheduled ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Candidates with schedule</p>
                        <p className="text-2xl font-bold">{data.comparison.uniqueCandidatesScheduled ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hired from scheduled</p>
                        <p className="text-2xl font-bold">{data.comparison.hiredFromScheduled ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion (hired / with schedule)</p>
                        <p className="text-2xl font-bold">{data.comparison.conversionPct ?? 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.barChartBuckets && data.barChartBuckets.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Bar chart by period</CardTitle>
                    <div className="w-36">
                      <Select value={bucket} onValueChange={setBucket}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BUCKETS.map((b) => (
                            <SelectItem key={b.value} value={b.value}>
                              {b.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.barChartBuckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value) => [value, ""]} />
                          <Legend />
                          <Bar dataKey="candidatesAdded" name="Candidates added" fill="#3b82f6" />
                          <Bar dataKey="interviewsScheduled" name="Interviews scheduled" fill="#f59e0b" />
                          <Bar dataKey="hired" name="Hired" fill="#22c55e" />
                          <Bar dataKey="backedOut" name="Backed out" fill="#ef4444" />
                          <Bar dataKey="notSelected" name="Not selected" fill="#6b7280" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.pieChartSummary && data.pieChartSummary.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution (numbers & percentage)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="h-72 w-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.pieChartSummary}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {data.pieChartSummary.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => {
                              const total = data.pieChartSummary.reduce((s, d) => s + d.value, 0)
                              const pct = total ? Math.round((value / total) * 100) : 0
                              return [`${value} (${pct}%)`, name]
                            }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 space-y-1">
                        {data.pieChartSummary.map((entry, i) => {
                          const total = data.pieChartSummary.reduce((s, d) => s + d.value, 0)
                          const pct = total ? Math.round((entry.value / total) * 100) : 0
                          return (
                            <div key={i} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                                {entry.name}
                              </span>
                              <span className="font-medium">
                                {entry.value} ({pct}%)
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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

              {(data.hrWise?.length > 0 || data.topHrByCandidates?.length > 0 || data.hiredByHr?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>HR insights (all & per HR)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {data.hrWise && data.hrWise.length > 0 ? (
                      <div className="overflow-x-auto rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>HR</TableHead>
                              <TableHead>Candidates added</TableHead>
                              <TableHead>Hired</TableHead>
                              <TableHead>Interviews scheduled</TableHead>
                              <TableHead>Backed out</TableHead>
                              <TableHead>Not selected</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.hrWise.map((row, i) => (
                              <TableRow key={i}>
                                <TableCell className="font-medium">{row.hr}</TableCell>
                                <TableCell>{row.candidatesAdded}</TableCell>
                                <TableCell>
                                  {row.hired} {row.hiredPct != null && row.hiredPct > 0 && <span className="text-muted-foreground">({row.hiredPct}%)</span>}
                                </TableCell>
                                <TableCell>{row.interviewsScheduled}</TableCell>
                                <TableCell>
                                  {row.backedOut} {row.backedOutPct != null && row.backedOutPct > 0 && <span className="text-muted-foreground">({row.backedOutPct}%)</span>}
                                </TableCell>
                                <TableCell>
                                  {row.notSelected} {row.notSelectedPct != null && row.notSelectedPct > 0 && <span className="text-muted-foreground">({row.notSelectedPct}%)</span>}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <>
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
                      </>
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
