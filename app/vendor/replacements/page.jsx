"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { ArrowLeft, Users, Loader2 } from "lucide-react"

function authHeaders() {
  const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return t ? { Authorization: "Bearer " + t } : {}
}

export default function ReplacementsPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/replacements", { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <Link
          href="/vendor"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Replacements
            </CardTitle>
            <CardDescription>
              Candidates who were replaced at an outlet: replaced (exited) candidate, replacement (joined) candidate, outlet, dates, and salary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : list.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No replacements recorded yet. Use the &quot;Replace this candidate with&quot; option in the Edit Candidate modal to record a replacement.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Replaced (exited)</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>HR (replaced)</TableHead>
                      <TableHead>Replace by (joined)</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>HR (replacement)</TableHead>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Date of joining</TableHead>
                      <TableHead>Exit date</TableHead>
                      <TableHead>Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.replacedCandidate?.name ?? "—"}</TableCell>
                        <TableCell>{r.position}</TableCell>
                        <TableCell>{r.replacedHr?.name ?? "—"}</TableCell>
                        <TableCell className="font-medium">{r.replacementCandidate?.name ?? "—"}</TableCell>
                        <TableCell>{r.replacementCandidate?.position ?? "—"}</TableCell>
                        <TableCell>{r.replacementHr?.name ?? "—"}</TableCell>
                        <TableCell>{r.outlet?.name ?? "—"}</TableCell>
                        <TableCell>{r.dateOfJoining ? new Date(r.dateOfJoining).toLocaleDateString("en-IN") : "—"}</TableCell>
                        <TableCell>{r.exitDate ? new Date(r.exitDate).toLocaleDateString("en-IN") : "—"}</TableCell>
                        <TableCell>{r.salary ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
