import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "../generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

// Add cleanup on process exit
process.on('beforeExit', async () => {
  await prismaClient.$disconnect()
})