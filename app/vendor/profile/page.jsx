"use client"

import { useState, useEffect } from "react"
import { VendorHeader } from "@/components/vendor/vendor-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState("")
  const [avatarFile, setAvatarFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    fetch("/api/vendor/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setProfile(data)
          setName(data.name || "")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem("auth_token")
      const formData = new FormData()
      formData.append("name", name)
      if (avatarFile) formData.append("avatar", avatarFile)

      const res = await fetch("/api/vendor/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")

      setProfile(data)
      if (typeof window !== "undefined") {
        const stored = JSON.parse(localStorage.getItem("auth_user") || "{}")
        localStorage.setItem("auth_user", JSON.stringify({ ...stored, ...data }))
      }
      setAvatarFile(null)
      toast.success("Profile updated")
    } catch (err) {
      toast.error(err.message || "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const displayName = profile?.name || profile?.email?.split("@")[0] || "Vendor"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorHeader user={profile} />
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600 mb-6">Manage your account and profile image.</p>

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {profile?.avatar ? (
                      <AvatarImage src={profile.avatar.startsWith("/") ? profile.avatar : profile.avatar} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-green-100 text-green-800 text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{displayName}</CardTitle>
                    <CardDescription>Vendor</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Profile image</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="cursor-pointer flex items-center gap-2 text-sm text-green-600 hover:underline">
                        <Upload className="w-4 h-4" />
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      {avatarFile && <span className="text-sm text-muted-foreground">{avatarFile.name}</span>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile?.email || ""} readOnly disabled className="bg-gray-50" />
                  </div>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
