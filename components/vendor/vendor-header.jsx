"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Menu,
  LogOut,
  User,
  Settings,
  CreditCard,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PRIMARY_NAV_KEYS } from "@/lib/vendorMenuConfig"

const FALLBACK_NAV = [
  { menuKey: "home", href: "/vendor", label: "Home" },
  { menuKey: "applicants", href: "/vendor/applicants", label: "Applicants" },
  { menuKey: "outlets", href: "/vendor/outlets", label: "Outlets" },
  { menuKey: "calendar", href: "/vendor/calendar", label: "Calendar" },
  { menuKey: "cv-links", href: "/vendor/cv-links", label: "Active CV Links" },
  { menuKey: "designation", href: "/vendor/designation", label: "Designation" },
  { menuKey: "client", href: "/vendor/client", label: "Client" },
  { menuKey: "manage-hr", href: "/vendor/manage-hr", label: "Manage HR" },
]

const FALLBACK_DROPDOWN = [
  { href: "/vendor/profile", label: "Profile" },
  { href: "/vendor/settings", label: "Settings" },
  { href: "/vendor/billing", label: "Billing" },
]

const VIEW_AS_HR_KEY = "vendor_view_as_hr_id"

export function VendorHeader({ user: userProp }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(userProp)
  const [navLinks, setNavLinks] = useState(FALLBACK_NAV)
  const [dropdownLinks, setDropdownLinks] = useState(FALLBACK_DROPDOWN)
  const [hrList, setHrList] = useState([])
  const [viewAsHrId, setViewAsHrId] = useState(null)

  useEffect(() => {
    if (userProp) {
      setUser(userProp)
      return
    }
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null
      if (stored) setUser(JSON.parse(stored))
    } catch (_) {}
  }, [userProp])

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(VIEW_AS_HR_KEY) : null
      setViewAsHrId(raw ? parseInt(raw, 10) : null)
    } catch (_) {}
  }, [])

  useEffect(() => {
    let vendorId = null
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null
      if (raw) {
        const u = JSON.parse(raw)
        if (u?.id) vendorId = u.id
      }
    } catch (_) {}
    if (vendorId == null) return
    fetch(`/api/hr?vendorId=${vendorId}&limit=200`)
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setHrList(data.data ?? []))
      .catch(() => setHrList([]))
  }, [])

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) return
    const url = viewAsHrId != null && !isNaN(viewAsHrId)
      ? `/api/vendor/menu-permissions?hrId=${viewAsHrId}`
      : "/api/vendor/menu-permissions"
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Unauthorized")))
      .then((data) => {
        const nav = (data.navLinks || []).map((m) => ({ menuKey: m.menuKey, href: m.path, label: m.label }))
        const drop = (data.dropdownLinks || []).map((m) => ({ href: m.path, label: m.label }))
        if (nav.length) setNavLinks(nav)
        if (drop.length) setDropdownLinks(drop)
      })
      .catch(() => {})
  }, [viewAsHrId])

  const currentPath = pathname || ""
  const isActive = (href) => (href === "/vendor" ? currentPath === "/vendor" : currentPath.startsWith(href))

  const displayName = user?.name || user?.email?.split("@")[0] || "Vendor"
  const initials = displayName.slice(0, 2).toUpperCase()
  const shortName = displayName.length > 5 ? `${displayName.slice(0, 5)}…` : displayName

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/vendor" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URBAN</h1>
                <p className="text-xs text-green-600 -mt-1">Hospitality SOLUTIONS</p>
              </div>
            </Link>

            <nav className="hidden min-[1200px]:flex items-center space-x-6">
              {(typeof navLinks[0]?.menuKey !== "undefined" ? navLinks.filter((m) => PRIMARY_NAV_KEYS.includes(m.menuKey)) : navLinks.slice(0, 4)).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-gray-600 hover:text-gray-900 whitespace-nowrap",
                    isActive(href) && "text-green-600 font-medium"
                  )}
                >
                  {label}
                </Link>
              ))}
              {(() => {
              const moreLinks = typeof navLinks[0]?.menuKey !== "undefined" ? navLinks.filter((m) => !PRIMARY_NAV_KEYS.includes(m.menuKey)) : navLinks.slice(4)
              return moreLinks.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "text-gray-600 hover:text-gray-900 whitespace-nowrap gap-0.5",
                        moreLinks.some((m) => isActive(m.href)) && "text-green-600 font-medium"
                      )}
                    >
                      More
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {moreLinks.map(({ href, label }) => (
                      <DropdownMenuItem key={href} asChild>
                        <Link
                          href={href}
                          className={cn(
                            "cursor-pointer",
                            isActive(href) && "bg-green-50 text-green-700 font-medium"
                          )}
                        >
                          {label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            })()}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hrList.length > 0 && (
              <select
                value={viewAsHrId != null ? String(viewAsHrId) : ""}
                onChange={(e) => {
                  const v = e.target.value
                  if (typeof window !== "undefined") {
                    if (v) localStorage.setItem(VIEW_AS_HR_KEY, v)
                    else localStorage.removeItem(VIEW_AS_HR_KEY)
                    window.location.reload()
                  }
                }}
                className="text-sm border rounded-md px-2 py-1.5 bg-gray-50 text-gray-700 max-w-[140px] truncate"
                title="View as (permissions)"
              >
                <option value="">My account</option>
                {hrList.map((hr) => (
                  <option key={hr.id} value={String(hr.id)}>{hr.name}</option>
                ))}
              </select>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="min-[1200px]:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <VendorUserMenu user={user} displayName={displayName} initials={initials} shortName={shortName} dropdownLinks={dropdownLinks} />
          </div>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-[70%] max-w-[400px] h-full flex flex-col p-0 rounded-none"
        >
          <div className="p-4 border-b">
            <p className="font-semibold text-gray-900">Menu</p>
          </div>
          <nav className="flex flex-col gap-1 p-4 overflow-y-auto">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  isActive(href) && "bg-green-50 text-green-700 font-medium"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}

function VendorUserMenu({ user, displayName, initials, shortName, dropdownLinks = FALLBACK_DROPDOWN }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1">
          <Avatar className="h-8 w-8 border-2 border-gray-200">
            {user?.avatar ? (
              <AvatarImage src={user.avatar.startsWith("/") ? user.avatar : user.avatar} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-green-100 text-green-800 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 max-w-[80px] truncate hidden sm:inline">
            {shortName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            {user?.avatar ? (
              <AvatarImage src={user.avatar.startsWith("/") ? user.avatar : user.avatar} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-green-100 text-green-800 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-gray-500">Vendor</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {dropdownLinks.map(({ href, label }) => {
          const Icon = label === "Profile" ? User : label === "Settings" ? Settings : CreditCard
          return (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} className="cursor-pointer">
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("auth_token")
              localStorage.removeItem("auth_role")
              localStorage.removeItem("auth_user")
            }
            window.location.href = "/login"
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
