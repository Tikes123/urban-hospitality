require("dotenv").config({ path: ".env" })
const { PrismaClient } = require("@prisma/client")
const { PrismaMariaDb } = require("@prisma/adapter-mariadb")
const bcrypt = require("bcryptjs")

function getAdapter() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  try {
    const parsed = new URL(url)
    const password = parsed.password ? decodeURIComponent(parsed.password) : ""
    const database = parsed.pathname ? parsed.pathname.slice(1) : undefined
    return new PrismaMariaDb({
      host: parsed.hostname || "localhost",
      port: parsed.port ? parseInt(parsed.port, 10) : 3306,
      user: parsed.username || undefined,
      password: password || undefined,
      database: database || undefined,
      connectionLimit: 10,
    })
  } catch (e) {
    return null
  }
}

const adapter = getAdapter()
if (!adapter) {
  console.error("Seed requires DATABASE_URL and @prisma/adapter-mariadb. Set .env and run again.")
  process.exit(1)
}
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] })

const SALT_ROUNDS = 10

// Test accounts for login at /login
const TEST_ACCOUNTS = [
  { email: "tx@master.iam", password: "sekit", name: "Super Admin", role: "super_admin" },
  { email: "admin@test.com", password: "test123", name: "Test Admin", role: "vendor" },
  { email: "vendor@test.com", password: "test123", name: "Test Vendor", role: "vendor" },
]

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

async function main() {
  // Create super-admin and test vendor/admin accounts for testing
  try {
    for (const acc of TEST_ACCOUNTS) {
      const existing = await prisma.adminUser.findUnique({
        where: { email: acc.email.toLowerCase().trim() },
      })
      if (!existing) {
        const passwordHash = await bcrypt.hash(acc.password, SALT_ROUNDS)
        await prisma.adminUser.create({
          data: {
            email: acc.email.toLowerCase().trim(),
            passwordHash,
            name: acc.name,
            role: acc.role,
          },
        })
        console.log("Created:", acc.email, "(" + acc.role + ")")
      } else {
        console.log("Exists:", acc.email)
      }
    }
  } catch (e) {
    if (e.code === "P2021" || (e.meta && e.meta.driverAdapterError)) {
      console.warn("admin_users table missing? Run: npx prisma migrate deploy. Skipping test accounts.")
    } else throw e
  }

  console.log("Seeding Bangalore outlets (venues for frontend)...")
  const existing = await prisma.outlet.count()
  if (existing === 0) {
    await prisma.outlet.createMany({ data: BANGALORE_OUTLETS })
    console.log("Created", BANGALORE_OUTLETS.length, "Bangalore venues.")
    return
  }
  let added = 0
  for (const o of BANGALORE_OUTLETS) {
    const found = await prisma.outlet.findFirst({ where: { name: o.name } })
    if (!found) {
      await prisma.outlet.create({ data: o })
      added++
      console.log("  +", o.name)
    }
  }
  console.log("Done.", added, "new venue(s) added.")

  // Seed candidate statuses if empty
  try {
    const statusCount = await prisma.candidateStatus.count()
    if (statusCount === 0) {
      const CANDIDATE_STATUSES = [
        { value: "standby-cv", label: "Standby CV", color: "bg-slate-100 text-slate-800 border-slate-200", sortOrder: 1 },
        { value: "online-telephonic-interview", label: "Online/Telephonic Interview", color: "bg-sky-100 text-sky-800 border-sky-200", sortOrder: 2 },
        { value: "online-interview-done-waiting-results", label: "Online Interview Done - Waiting Results", color: "bg-amber-100 text-amber-800 border-amber-200", sortOrder: 3 },
        { value: "waiting-for-call-back", label: "Waiting for Call Back", color: "bg-blue-100 text-blue-800 border-blue-200", sortOrder: 4 },
        { value: "waiting-resume-location-not-sent", label: "Waiting for Resume-Location Not Sent", color: "bg-orange-100 text-orange-800 border-orange-200", sortOrder: 5 },
        { value: "recently-applied", label: "Recently Applied", color: "bg-green-100 text-green-800 border-green-200", sortOrder: 6 },
        { value: "suggested", label: "Suggested", color: "bg-blue-100 text-blue-800 border-blue-200", sortOrder: 7 },
        { value: "backed-out", label: "Backed Out", color: "bg-red-100 text-red-800 border-red-200", sortOrder: 8 },
        { value: "interview-scheduled", label: "Interview Scheduled", color: "bg-yellow-100 text-yellow-800 border-yellow-200", sortOrder: 9 },
        { value: "hired", label: "Hired", color: "bg-purple-100 text-purple-800 border-purple-200", sortOrder: 10 },
      ]
      await prisma.candidateStatus.createMany({ data: CANDIDATE_STATUSES })
      console.log("Created", CANDIDATE_STATUSES.length, "candidate statuses.")
    }
  } catch (e) {
    if (e.code === "P2021" || (e.meta && e.meta.driverAdapterError)) {
      console.warn("candidate_statuses table missing? Run migration. Skipping status seed.")
    } else throw e
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
