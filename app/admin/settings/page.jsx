"use client"

import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Setting</h1>
          <p className="text-gray-600 mb-6">Application and notification preferences.</p>
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Configure your dashboard and notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Email notifications</Label>
                <Switch id="notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="updates">Product updates</Label>
                <Switch id="updates" />
              </div>
              <Button className="bg-green-600 hover:bg-green-700">Save settings</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
