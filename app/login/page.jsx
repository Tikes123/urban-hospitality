"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react"
import { toast } from "sonner"

const VISUAL_IMG = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80"

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Visual panel - brand and imagery */}
      <div className="relative lg:w-1/2 min-h-[220px] lg:min-h-screen flex flex-col justify-between p-6 lg:p-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={VISUAL_IMG}
            alt="Hospitality team"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>
        <Link href="/" className="relative z-10 flex items-center gap-2 w-fit">
          <div className="w-10 h-10 rounded-full bg-[var(--brand)] flex items-center justify-center text-white font-bold text-lg">
            U
          </div>
          <div>
            <span className="text-white font-bold text-lg block leading-tight">Urban Hospitality</span>
            <span className="text-emerald-300 text-xs font-medium">SOLUTIONS</span>
          </div>
        </Link>
        <div className="relative z-10 hidden lg:block">
          <p className="text-white/90 text-lg max-w-sm font-medium">
            Manage talent. Schedule interviews. Grow your hospitality business.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50/80 lg:bg-white p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[var(--brand)] flex items-center justify-center text-white font-bold">
                U
              </div>
              <span className="font-bold text-gray-900">Urban Hospitality</span>
            </Link>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-1 mb-8">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email or phone number</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="text"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com or 9876543210"
                  className="pl-10 h-11 rounded-lg border-gray-200 bg-white focus-visible:ring-[var(--brand)] focus-visible:border-[var(--brand)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-10 h-11 rounded-lg border-gray-200 bg-white focus-visible:ring-[var(--brand)] focus-visible:border-[var(--brand)]"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-lg bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white font-medium gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Log in
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Job seeker?{" "}
            <Link href="/signup" className="text-[var(--brand)] font-medium hover:underline">
              Sign up
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
