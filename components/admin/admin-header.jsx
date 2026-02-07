"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/admin", label: "Home" },
  { href: "/admin/applicants", label: "View Applicants" },
  { href: "/admin/outlets", label: "Outlets" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/cv-links", label: "Active CV Links" },
  { href: "/admin/designation", label: "Designation" },
  { href: "/admin/client", label: "Client" },
  { href: "/admin/manage-hr", label: "Manage HR" },
]

export function AdminHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const currentPath = pathname || ""
  const isActive = (href) => (href === "/admin" ? currentPath === "/admin" : currentPath.startsWith(href))

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/admin" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">URBAN</h1>
                <p className="text-xs text-green-600 -mt-1">Hospitality SOLUTIONS</p>
              </div>
            </Link>

            <nav className="hidden min-[1200px]:flex items-center space-x-6">
              {NAV_LINKS.map(({ href, label }) => (
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
            </nav>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="min-[1200px]:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <AdminUserMenu />
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
            {NAV_LINKS.map(({ href, label }) => (
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

function AdminUserMenu() {
  const displayName = "Trainee"
  const initials = displayName.slice(0, 2).toUpperCase()
  const shortName = displayName.length > 5 ? `${displayName.slice(0, 5)}…` : displayName

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1">
          <Avatar className="h-8 w-8 border-2 border-gray-200">
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
            <AvatarFallback className="bg-green-100 text-green-800 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Setting
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/billing" className="cursor-pointer">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin" className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
