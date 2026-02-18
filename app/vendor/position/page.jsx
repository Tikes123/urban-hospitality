"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PositionRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/vendor/data-management?tab=position")
  }, [router])
  return null
}
