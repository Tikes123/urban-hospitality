"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LocationRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/vendor/data-management?tab=location")
  }, [router])
  return null
}
