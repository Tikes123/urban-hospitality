import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const BANGALORE_OUTLETS = [
  { name: "The Green Terrace", type: "restaurant", address: "80 Feet Road, Koramangala, Bangalore 560034", phone: "+91 80 41234567", email: "contact@greenterrace.in", manager: "Rajesh Kumar", status: "active", employees: 12 },
  { name: "Indiranagar Social", type: "bar", address: "100 Feet Road, Indiranagar, Bangalore 560038", phone: "+91 80 42345678", email: "indiranagar@social.in", manager: "Priya Sharma", status: "active", employees: 8 },
  { name: "HSR Crown Hotel", type: "hotel", address: "Sector 2, HSR Layout, Bangalore 560102", phone: "+91 80 43456789", email: "reservations@hsrcrown.com", manager: "Vikram Singh", status: "active", employees: 25 },
  { name: "Toit Brewpub", type: "restaurant", address: "100 Feet Road, Indiranagar, Bangalore 560038", phone: "+91 80 44567890", email: "hello@toit.in", manager: "Anita Reddy", status: "active", employees: 15 },
  { name: "Whitefield Grand", type: "hotel", address: "ITPL Road, Whitefield, Bangalore 560066", phone: "+91 80 45678901", email: "info@whitefieldgrand.com", manager: "Suresh Nair", status: "active", employees: 40 },
  { name: "Koramangala Bar & Kitchen", type: "bar", address: "5th Block, Koramangala, Bangalore 560034", phone: "+91 80 46789012", email: "koramangala@barandkitchen.in", manager: "Deepa Iyer", status: "active", employees: 10 },
  { name: "Jayanagar Delight", type: "restaurant", address: "4th Block, Jayanagar, Bangalore 560041", phone: "+91 80 47890123", email: "jayanagar@delight.in", manager: "Karthik Menon", status: "active", employees: 14 },
  { name: "MG Road Central Hotel", type: "hotel", address: "MG Road, Bangalore 560001", phone: "+91 80 48901234", email: "mgroad@centralhotel.com", manager: "Lakshmi Rao", status: "active", employees: 35 },
  { name: "Marathahalli Diner", type: "restaurant", address: "Outer Ring Road, Marathahalli, Bangalore 560037", phone: "+91 80 49012345", email: "marathahalli@diner.in", manager: "Ramesh Patel", status: "active", employees: 11 },
  { name: "Bellandur Brew House", type: "bar", address: "Sarjapur Road, Bellandur, Bangalore 560103", phone: "+91 80 50123456", email: "bellandur@brewhouse.in", manager: "Meera Krishnan", status: "active", employees: 9 },
  { name: "JP Nagar Bistro", type: "restaurant", address: "Phase 5, JP Nagar, Bangalore 560078", phone: "+91 80 51234567", email: "jpnagar@bistro.in", manager: "Arun Joshi", status: "active", employees: 13 },
  { name: "Bannerghatta Resort", type: "hotel", address: "Bannerghatta Road, Bangalore 560076", phone: "+91 80 52345678", email: "info@bannerghattaresort.com", manager: "Sunita Desai", status: "active", employees: 30 },
]

export async function POST() {
  try {
    const existing = await prisma.outlet.count()
    if (existing === 0) {
      await prisma.outlet.createMany({ data: BANGALORE_OUTLETS })
      return NextResponse.json({ message: `Created ${BANGALORE_OUTLETS.length} Bangalore venues (outlets).`, count: BANGALORE_OUTLETS.length })
    }
    let added = 0
    for (const o of BANGALORE_OUTLETS) {
      const found = await prisma.outlet.findFirst({ where: { name: o.name } })
      if (!found) {
        await prisma.outlet.create({ data: o })
        added++
      }
    }
    return NextResponse.json({ message: `Done. ${added} new venue(s) added.`, count: added })
  } catch (e) {
    console.error("Seed outlets error:", e)
    return NextResponse.json({ error: "Failed to seed outlets" }, { status: 500 })
  }
}
