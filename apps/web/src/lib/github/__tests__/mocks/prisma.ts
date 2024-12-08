import { jest } from '@jest/globals';
import type { PrismaClient } from '@prisma/client';

const createModelMethods = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  upsert: jest.fn(),
  count: jest.fn(),
  aggregate: jest.fn(),
  groupBy: jest.fn(),
  findUniqueOrThrow: jest.fn(),
  findFirstOrThrow: jest.fn(),
  createMany: jest.fn()
});

// Create a base mock with the methods we need for testing
const mockClient = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $on: jest.fn((_event: string, _callback: (event: unknown) => void) => mockClient),
  $connect: jest.fn(() => Promise.resolve()),
  $disconnect: jest.fn(() => Promise.resolve()),
  $transaction: jest.fn(<T>(fn: () => Promise<T>) => Promise.resolve(fn())),
  $use: jest.fn(),
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  pullRequest: createModelMethods(),
  repository: createModelMethods(),
  $extends: jest.fn()
};

// Cast directly to PrismaClient since we're only using a subset of its functionality in our tests
export const mockPrismaClient = mockClient as unknown as PrismaClient;
