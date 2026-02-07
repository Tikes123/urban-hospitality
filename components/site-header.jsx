"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const nav = [
  { href: "/", label: "Home" },
  { href: "/vendor", label: "Vendor" },
  { href: "/apply-job", label: "Apply Job" },
  { href: "/for-business", label: "For Business" },
  { href: "/contact", label: "Contact" },
  { href: "/blogs", label: "Blogs" },
]

export function SiteHeader() {
  const [role, setRole] = useState(null)
  useEffect(() => {
    setRole(typeof window !== "undefined" ? localStorage.getItem("auth_role") : null)
  }, [])

  const navItems = [...nav]
  if (role === "user") navItems.push({ href: "/my-applications", label: "My applications" })

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg bg-[var(--brand)] hover:bg-[var(--brand-hover)] transition-colors">
              U
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Urban Hospitality</h1>
              <p className="text-xs text-[var(--brand)]">SOLUTIONS</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {!role ? (
              <>
                <Link href="/login" className="text-sm font-medium text-[var(--brand)] hover:underline">Log in</Link>
                <Link href="/signup" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign up</Link>
              </>
            ) : role !== "vendor" && role !== "super_admin" ? (
              <Link href="/login" className="text-sm font-medium text-red-600 hover:underline" onClick={() => { localStorage.removeItem("auth_token"); localStorage.removeItem("auth_role"); localStorage.removeItem("auth_user"); }}>Logout</Link>
            ) : null}
          </nav>
          <div className="md:hidden flex gap-2">
            <Link
              href="/apply-job"
              className="text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-hover)]"
            >
              Apply Job
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
