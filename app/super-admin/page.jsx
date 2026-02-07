"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, UserCheck } from "lucide-react"

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ vendors: 0, payments: 0, totalAmount: 0 })

  useEffect(() => {
    Promise.all([
      fetch("/api/super-admin/stats").then((r) => (r.ok ? r.json() : { vendors: 0, payments: 0, totalAmount: 0 })),
    ]).then(([data]) => setStats(data))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-muted-foreground">Manage vendors and view payments. No billing for super-admin.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendors</p>
                <p className="text-2xl font-bold">{stats.vendors}</p>
              </div>
              <Users className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total payments</p>
                <p className="text-2xl font-bold">{stats.payments}</p>
              </div>
              <CreditCard className="h-10 w-10 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount (₹)</p>
                <p className="text-2xl font-bold">{stats.totalAmount?.toLocaleString("en-IN") ?? 0}</p>
              </div>
              <UserCheck className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
