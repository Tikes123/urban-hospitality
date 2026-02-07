import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/gif", "image/webp"]

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|jpg|jpeg|png|gif|webp)$/i)) {
      return NextResponse.json({ error: "Invalid file type. Use PDF, DOC, DOCX, or images." }, { status: 400 })
    }
    const dir = path.join(process.cwd(), "public", "uploads", "resumes")
    await mkdir(dir, { recursive: true })
    const ext = path.extname(file.name) || ".pdf"
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filepath = path.join(dir, filename)
    const buf = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buf)
    const url = `/uploads/resumes/${filename}`
    return NextResponse.json({ path: url, name: file.name })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
