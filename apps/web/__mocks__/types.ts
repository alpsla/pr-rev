// __mocks__/types.ts

// Import the actual types we need to mock
import type { PullRequest as ActualPullRequest, Repository as ActualRepository } from '../src/lib/github/types';
import type { PrismaEvent } from '../src/lib/github/types';

// Define the PrismaPromise type
type PrismaPromise<T> = Promise<T> & { [Symbol.toStringTag]: 'PrismaPromise' };

// Export ModelOperations interface
export interface ModelOperations<T> {
  findUnique: (args: unknown) => PrismaPromise<T | null>;
  findMany: (args?: unknown) => PrismaPromise<T[]>;
  create: (args: { data: unknown }) => PrismaPromise<T>;
  update: (args: { where: unknown; data: unknown }) => PrismaPromise<T>;
  delete: (args: { where: unknown }) => PrismaPromise<T>;
}

// Use the actual types
export type PullRequest = ActualPullRequest;
export type Repository = ActualRepository;

// Create mock client interface
export interface PrismaMockClient {
  $on: (event: string, callback: (event: PrismaEvent) => void) => void;
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $transaction: <T>(arg: Promise<T>[]) => Promise<T[]>;
  pullRequest: ModelOperations<PullRequest>;
  repository: ModelOperations<Repository>;
}