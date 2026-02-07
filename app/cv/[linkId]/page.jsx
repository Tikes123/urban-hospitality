"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Image, Loader2, ExternalLink } from "lucide-react"

export default function PublicCVPage({ params }) {
  const { linkId } = typeof params?.then === "function" ? use(params) : (params || {})
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!linkId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/public/cv/${encodeURIComponent(linkId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Link not found" : res.status === 410 ? "This link has expired" : res.status === 403 ? "This link is not active" : "Failed to load")
        return res.json()
      })
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [linkId])

  if (!linkId) return null
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading CV...</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Unable to load</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild variant="outline">
              <Link href="/">Go to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (!data) return null

  const isImage = (path) => /\.(jpg|jpeg|png|gif|webp)$/i.test(path || "")

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xl">{data.candidateName}</CardTitle>
            <p className="text-muted-foreground">{data.position}</p>
          </CardHeader>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Attached files</h3>
            <p className="text-sm text-muted-foreground mb-4">You can view or download the files below.</p>
            <ul className="space-y-2">
              {data.files && data.files.length > 0 ? (
                data.files.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      {isImage(file.path) ? (
                        <Image className="w-8 h-8 text-green-500 shrink-0" />
                      ) : (
                        <FileText className="w-8 h-8 text-gray-500 shrink-0" />
                      )}
                      <span className="truncate font-medium">{file.name}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.path.startsWith("http") ? file.path : file.path} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> View
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.path.startsWith("http") ? file.path : file.path} download>
                          <Download className="w-4 h-4 mr-1" /> Download
                        </a>
                      </Button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground py-4">No files attached.</li>
              )}
            </ul>
            <div className="mt-6 pt-4 border-t">
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
