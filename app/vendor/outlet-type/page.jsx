"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OutletTypeRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/vendor/data-management?tab=outlet-type")
  }, [router])
  return null
}
