"use client"

import { useState } from "react"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setSubmitting(true)
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch("/api/vendor/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update password")

      toast.success("Password updated")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast.error(err.message || "Failed to update password")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={null} />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 mb-6">Security and preferences.</p>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Use a strong password and keep it secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="current">Current password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <Label htmlFor="new">New password</Label>
                  <Input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
