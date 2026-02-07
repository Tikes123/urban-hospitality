"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function SuperAdminPaymentsPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    fetch("/api/super-admin/payments", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
      <p className="text-muted-foreground">Payment history from vendors (success and failed).</p>

      <Card>
        <CardHeader>
          <CardTitle>All payments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.vendor?.email ?? p.vendorId}</TableCell>
                    <TableCell>₹{p.amount?.toLocaleString("en-IN")}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "success" ? "default" : "destructive"}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>{p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
