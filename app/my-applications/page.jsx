"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Briefcase, Loader2 } from "lucide-react"
import { getStatusInfo, getStatusBadgeClass } from "@/lib/statusConfig"

export default function MyApplicationsPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) {
      window.location.href = "/login?redirect=/my-applications"
      return
    }
    fetch("/api/user/applications", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login?redirect=/my-applications"
          return []
        }
        return r.ok ? r.json() : []
      })
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  const getStatusBadge = (status) => {
    const info = getStatusInfo(status)
    return <Badge className={`border ${getStatusBadgeClass(status)}`}>{info.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My applications</h1>
        <p className="text-gray-600 mb-6">Jobs you have applied to.</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You have not applied to any jobs yet.</p>
              <Button asChild>
                <Link href="/apply-job">Find jobs</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.position}</TableCell>
                    <TableCell>{app.location}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{app.appliedDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
