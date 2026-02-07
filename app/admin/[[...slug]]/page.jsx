"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

/**
 * Admin routes are replaced by Vendor. Redirect /admin and /admin/* to /vendor and /vendor/*.
 * Super-admin uses /super-admin; vendors use /vendor.
 */
export default function AdminRedirect() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.slug

  useEffect(() => {
    const path = Array.isArray(slug) && slug.length > 0 ? `/vendor/${slug.join("/")}` : "/vendor"
    router.replace(path)
  }, [router, slug])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Redirecting to vendor…</p>
    </div>
  )
}
