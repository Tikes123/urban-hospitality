import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const globalForPrisma = globalThis

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
    console.warn("Prisma: could not parse DATABASE_URL for adapter", e.message)
    return null
  }
}

const adapter = getAdapter()

export const prisma =
  globalForPrisma.prisma ??
  (adapter
    ? new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      })
    : new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      }))

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
