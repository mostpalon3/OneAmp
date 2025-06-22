import { PrismaClient } from "../generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pooling configuration
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Configure connection pool settings
// Note: Prisma doesn't have a 'beforeExit' event, so we'll handle cleanup in process events only

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient
}

// Enhanced cleanup on process exit
const cleanup = async () => {
  await prismaClient.$disconnect()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('beforeExit', cleanup)

export default prismaClient