"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react"

const SIDE_LINKS = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/vendors", label: "Vendors", icon: Users },
  { href: "/super-admin/menu-permissions", label: "Menu permissions", icon: MenuIcon },
  { href: "/super-admin/payments", label: "Payments", icon: CreditCard },
  { href: "/super-admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/super-admin/blogs", label: "Blogs", icon: FileText },
]

export default function SuperAdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) {
      router.replace("/login?redirect=/super-admin")
      return
    }
    fetch("/api/auth/session", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid && data.role === "super_admin") {
          setAllowed(true)
        } else {
          router.replace("/login?redirect=/super-admin")
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false))
  }, [router])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_role")
      localStorage.removeItem("auth_user")
    }
    window.location.href = "/login"
  }

  if (checking || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Link href="/super-admin" className="font-bold text-gray-900">Super Admin</Link>
          <p className="text-xs text-muted-foreground mt-0.5">Urban Hospitality</p>
        </div>
        <nav className="p-2 flex-1">
          {SIDE_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                pathname === href || (href !== "/super-admin" && pathname?.startsWith(href))
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
