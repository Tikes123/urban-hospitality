"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuperAdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="text-muted-foreground">Cross-vendor analytics and reports.</p>
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics by vendor (candidates, hires, HR count) can be added here. Use the vendor dashboard for per-vendor analytics.</p>
        </CardContent>
      </Card>
    </div>
  )
}
