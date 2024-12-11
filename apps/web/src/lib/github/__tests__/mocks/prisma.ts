import { PrismaClient, Platform } from '@prisma/client';
import { jest } from '@jest/globals';

export type MockContext = {
  prisma: jest.Mocked<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  const mockPlatform: Platform = {
    id: 'platform-1',
    type: 'GITHUB',
    name: 'GitHub',
    enabled: true,
    config: null,
    capabilities: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    pullRequest: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
    review: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    repository: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    platform: {
      findFirstOrThrow: jest.fn(() => Promise.resolve(mockPlatform)),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    $transaction: jest.fn((tx: unknown) => {
      if (Array.isArray(tx)) {
        return Promise.resolve(tx.map(fn => fn(prisma)));
      }
      return Promise.resolve(tx);
    }),
    $use: jest.fn(),
    $extends: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient>;

  return { prisma };
};
