import { PrismaClient as OriginalPrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaTypes {
    type PrismaClient = OriginalPrismaClient
  }
}

export = PrismaTypes
export as namespace PrismaTypes
