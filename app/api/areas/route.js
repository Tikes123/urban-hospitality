import { NextResponse } from "next/server"
import { BANGALORE_AREAS } from "@/lib/areas"

export async function GET() {
  return NextResponse.json(BANGALORE_AREAS)
}
