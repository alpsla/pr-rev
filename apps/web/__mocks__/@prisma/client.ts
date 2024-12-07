import { jest } from '@jest/globals';
import type { PrismaMockClient, PullRequest, Repository, ModelOperations } from '../types';
import type { PrismaEvent } from '../../src/lib/github/types';

// Type aliases for base functions
type ConnectFn = PrismaMockClient['$connect'];
type DisconnectFn = PrismaMockClient['$disconnect'];
type TransactionFn = PrismaMockClient['$transaction'];
type OnFn = (event: string, callback: (event: PrismaEvent) => void) => void;

// Type aliases for PullRequest operations
type PullRequestOps = ModelOperations<PullRequest>;
type FindUniquePR = PullRequestOps['findUnique'];
type FindManyPR = PullRequestOps['findMany'];
type CreatePR = PullRequestOps['create'];
type UpdatePR = PullRequestOps['update'];
type DeletePR = PullRequestOps['delete'];

// Type aliases for Repository operations
type RepositoryOps = ModelOperations<Repository>;
type FindUniqueRepo = RepositoryOps['findUnique'];
type FindManyRepo = RepositoryOps['findMany'];
type CreateRepo = RepositoryOps['create'];
type UpdateRepo = RepositoryOps['update'];
type DeleteRepo = RepositoryOps['delete'];

// Create properly typed mock functions
const mockConnect = jest.fn(
  () => Promise.resolve()
) as unknown as ConnectFn;

const mockDisconnect = jest.fn(
  () => Promise.resolve()
) as unknown as DisconnectFn;

const mockTransaction = jest.fn(
  (arg: Parameters<TransactionFn>[0]) => Promise.all(arg)
) as unknown as TransactionFn;

const mockOn = jest.fn() as unknown as OnFn;

// Create the mock client
const mockClient: PrismaMockClient = {
  $on: mockOn,
  $connect: mockConnect,
  $disconnect: mockDisconnect,
  $transaction: mockTransaction,
  pullRequest: {
    findUnique: jest.fn(
      () => Promise.resolve(null)
    ) as unknown as FindUniquePR,
    
    findMany: jest.fn(
      () => Promise.resolve([])
    ) as unknown as FindManyPR,
    
    create: jest.fn(
      (args: { data: unknown }) => Promise.resolve({
        id: 'mock-pr-id',
        ...(args.data as object),
        platformId: 'mock-platform-id',
        repositoryId: 'mock-repo-id',
        number: 1,
        title: 'Mock PR',
        status: 'OPEN' as const,
        url: 'https://example.com/pr/1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ) as unknown as CreatePR,
    
    update: jest.fn(
      (args: { where: unknown; data: unknown }) => Promise.resolve({
        id: 'mock-pr-id',
        ...(args.data as object),
        platformId: 'mock-platform-id',
        repositoryId: 'mock-repo-id',
        number: 1,
        title: 'Updated PR',
        status: 'OPEN' as const,
        url: 'https://example.com/pr/1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ) as unknown as UpdatePR,
    
    delete: jest.fn(
      () => Promise.resolve({
        id: 'mock-pr-id',
        platformId: 'mock-platform-id',
        repositoryId: 'mock-repo-id',
        number: 1,
        title: 'Deleted PR',
        status: 'CLOSED' as const,
        url: 'https://example.com/pr/1',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ) as unknown as DeletePR,
  },
  repository: {
    findUnique: jest.fn(
      () => Promise.resolve(null)
    ) as unknown as FindUniqueRepo,
    
    findMany: jest.fn(
      () => Promise.resolve([])
    ) as unknown as FindManyRepo,
    
    create: jest.fn(
      (args: { data: unknown }) => Promise.resolve({
        id: 'mock-repo-id',
        ...(args.data as object),
        platformId: 'mock-platform-id',
        name: 'mock-repo',
        fullName: 'org/mock-repo',
        url: 'https://example.com/repo',
        defaultBranch: 'main',
        private: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ) as unknown as CreateRepo,
    
    update: jest.fn(
      (args: { where: unknown; data: unknown }) => Promise.resolve({
        id: 'mock-repo-id',
        ...(args.data as object),
        platformId: 'mock-platform-id',
        name: 'updated-repo',
        fullName: 'org/updated-repo',
        url: 'https://example.com/repo',
        defaultBranch: 'main',
        private: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ) as unknown as UpdateRepo,
    
    delete: jest.fn(
      () => Promise.resolve({
        id: 'mock-repo-id',
        platformId: 'mock-platform-id',
        name: 'deleted-repo',
        fullName: 'org/deleted-repo',
        url: 'https://example.com/repo',
        defaultBranch: 'main',
        private: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ) as unknown as DeleteRepo,
  },
};

// Export the mock client constructor
export const PrismaClient = jest.fn(() => mockClient);