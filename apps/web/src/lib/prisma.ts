import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined
}

const client = new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = client
}

export const prisma = globalThis._prisma || client
