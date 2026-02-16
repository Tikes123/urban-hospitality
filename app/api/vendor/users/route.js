import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/vendor/users - Get list of users/HRs for filter dropdown
export async function GET(request) {
  try {
    const auth = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const session = await prisma.session.findFirst({
      where: { sessionToken: auth, expiresAt: { gt: new Date() } },
      include: { adminUser: true },
    })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get all HRs for this vendor
    const hrs = await prisma.hr.findMany({
      where: { vendorId: session.adminUserId },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    })

    // Include the vendor/admin user themselves
    const usersMap = new Map()
    
    // Add vendor user
    usersMap.set(`vendor-${session.adminUserId}`, {
      id: session.adminUserId,
      name: session.adminUser.name || session.adminUser.email,
      email: session.adminUser.email,
      type: "vendor",
    })
    
    // Add HRs (avoid duplicates)
    hrs.forEach((hr) => {
      usersMap.set(`hr-${hr.id}`, {
        id: hr.id,
        name: hr.name || hr.email,
        email: hr.email,
        type: "hr",
      })
    })
    
    const users = Array.from(usersMap.values())

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
