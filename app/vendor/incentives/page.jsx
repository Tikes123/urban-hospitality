"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Trophy, Award, Medal, TrendingUp } from "lucide-react"

export default function IncentivesPage() {
  const router = useRouter()
  const [data, setData] = useState([])
  const [pointsRule, setPointsRule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!t) {
      router.replace("/login")
      return
    }
    const hrId = typeof window !== "undefined" ? localStorage.getItem("vendor_view_as_hr_id") : null
    const permUrl = hrId ? `/api/vendor/menu-permissions?hrId=${hrId}` : "/api/vendor/menu-permissions"
    fetch(permUrl, { headers: { Authorization: `Bearer ${t}` } })
      .then((res) => (res.ok ? res.json() : {}))
      .then((d) => {
        if (d.allowedMap && d.allowedMap.incentives === false) {
          router.replace("/vendor")
          return
        }
        setAccessChecked(true)
      })
      .catch(() => setAccessChecked(true))
  }, [router])

  useEffect(() => {
    if (!accessChecked) return
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!t) return
    setLoading(true)
    fetch("/api/vendor/incentives", { headers: { Authorization: `Bearer ${t}` } })
      .then((res) => (res.ok ? res.json() : { data: [], pointsRule: null }))
      .then((json) => {
        setData(json.data ?? [])
        setPointsRule(json.pointsRule ?? null)
      })
      .catch(() => {
        setData([])
        setPointsRule(null)
      })
      .finally(() => setLoading(false))
  }, [accessChecked])

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />
    return <span className="text-muted-foreground font-medium w-6 text-center">{rank}</span>
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
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">HR Incentives</h1>
            <p className="text-sm text-muted-foreground">Performance by candidate salary. Points based on placed candidate salary bands.</p>
          </div>
        </div>

        {pointsRule && (
          <Card className="mb-6 border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Points rule</CardTitle>
              <CardDescription>Points per candidate added by HR, by expected salary (₹)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-wrap gap-4 text-sm">
                <li><span className="font-medium">≥ ₹15,000</span> → <span className="text-green-700 dark:text-green-400 font-semibold">{pointsRule["≥ ₹15,000"]} pt</span></li>
                <li><span className="font-medium">≥ ₹20,000</span> → <span className="text-green-700 dark:text-green-400 font-semibold">{pointsRule["≥ ₹20,000"]} pts</span></li>
                <li><span className="font-medium">≥ ₹25,000</span> → <span className="text-green-700 dark:text-green-400 font-semibold">{pointsRule["≥ ₹25,000"]} pts</span></li>
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>HR performance</CardTitle>
            <CardDescription>Ranking by total points from candidates at 15k, 20k, and 25k salary bands.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : data.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No HR data yet. Add HRs and assign candidates to see performance.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">Rank</TableHead>
                    <TableHead>HR name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Candidates ≥₹15k</TableHead>
                    <TableHead className="text-center">Candidates ≥₹20k</TableHead>
                    <TableHead className="text-center">Candidates ≥₹25k</TableHead>
                    <TableHead className="text-center">Total candidates</TableHead>
                    <TableHead className="text-right font-semibold">Total points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.hr.id}>
                      <TableCell className="flex items-center justify-center">
                        {getRankIcon(row.rank)}
                      </TableCell>
                      <TableCell className="font-medium">{row.hr.name}</TableCell>
                      <TableCell className="text-muted-foreground">{row.hr.email}</TableCell>
                      <TableCell className="text-center">{row.count15}</TableCell>
                      <TableCell className="text-center">{row.count20}</TableCell>
                      <TableCell className="text-center">{row.count25}</TableCell>
                      <TableCell className="text-center">{row.totalCandidates}</TableCell>
                      <TableCell className="text-right font-semibold text-green-700 dark:text-green-400">{row.totalPoints}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
