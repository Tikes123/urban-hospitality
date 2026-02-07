"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function VendorLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/vendor")}`)
      return
    }
    fetch("/api/auth/session", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid && (data.role === "vendor" || data.role === "super_admin")) {
          setAllowed(true)
        } else {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_role")
          localStorage.removeItem("auth_user")
          router.replace(`/login?redirect=${encodeURIComponent(pathname || "/vendor")}`)
        }
      })
      .catch(() => {
        router.replace("/login")
      })
      .finally(() => setChecking(false))
  }, [router, pathname])

  if (checking || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return <>{children}</>
}
