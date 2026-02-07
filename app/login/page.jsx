"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const redirect = searchParams.get("redirect") || "/vendor"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token)
        localStorage.setItem("auth_role", data.role)
        localStorage.setItem("auth_user", JSON.stringify(data.user || {}))
      }

      toast.success("Logged in successfully")

      if (data.role === "super_admin") {
        router.push("/super-admin")
      } else if (data.role === "user") {
        router.push("/my-applications")
      } else {
        router.push(redirect.startsWith("/") ? redirect : "/vendor")
      }
    } catch (err) {
      toast.error(err.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email or phone number</Label>
              <Input
                id="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com or 9876543210"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Job seeker? <Link href="/signup" className="text-green-600 hover:underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
