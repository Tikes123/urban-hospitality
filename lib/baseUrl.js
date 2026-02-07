/**
 * Base URL for the app (e.g. http://localhost:3000 or https://yourdomain.com).
 * Used for CV links, emails, etc.
 * Set NEXT_PUBLIC_BASE_URL in .env for client and API; falls back to window.origin on client.
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BASE_URL || window.location.origin || ""
  }
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000"
}

/** Build the public CV view URL for a linkId */
export function getCvLinkUrl(linkId) {
  const base = getBaseUrl()
  if (!base || !linkId) return ""
  return `${base.replace(/\/$/, "")}/cv/${linkId}`
}
