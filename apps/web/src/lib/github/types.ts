// Base GitHub Types
export interface Repository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  defaultBranch: string;
  language: string;
  stargazersCount: number;
  forksCount: number;
  organizationId?: string;
  settings: RepositorySettings;
}

export interface PullRequest {
  number: number;
  title: string;
  body: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  changedFiles: number;
  additions: number;
  deletions: number;
  draft: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  labels: string[];
  mergeableState: 'mergeable' | 'conflicting' | 'unknown';
  ciStatus?: string;
  milestone?: string;
}

// PR Review Types
export interface ReviewerInfo {
  login: string;
  avatarUrl: string;
  type: string;
  role: string;
}

export interface ReviewComment {
  id: number;
  body: string;
  path: string;
  position: number;
  line: number;
  originalLine: number;
  commitId: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewerInfo;
}

export interface PullRequestReview {
  id: number;
  user: ReviewerInfo;
  body: string | null;
  state: 'PENDING' | 'COMMENTED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'DISMISSED';
  commitId: string;
  submittedAt: string | null;
}

// PR Interaction Types
export interface CreateCommentParams {
  body: string;
  commit_id?: string;
  path?: string;
  line?: number;
  side?: 'LEFT' | 'RIGHT';
  start_line?: number;
  start_side?: 'LEFT' | 'RIGHT';
}

export interface CommitFile {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
  mode?: '100644' | '100755' | '040000' | '160000' | '120000';
}

export interface CreateCommitParams {
  branch: string;
  message: string;
  files: CommitFile[];
  baseSha?: string;
}

export interface PullRequestUpdate {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  base?: string;
  maintainer_can_modify?: boolean;
}

export interface PRApproval {
  id: string;
  reviewer: ReviewerInfo;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED';
  submittedAt: string;
  body?: string;
  isFromBot: boolean;
}

export interface CreateApprovalParams {
  body: string;
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  botIdentifier?: string;
  comments?: CreateCommentParams[];
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface Team {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  organizationId: string;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface TeamMember {
  id: string;
  userId: string;
  organizationId: string;
  teamId?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  permissions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Webhook Types
export interface Webhook {
  id: string;
  repositoryId: string;
  url: string;
  secret?: string;
  events: string[];
  active: boolean;
  lastStatus?: number;
  lastDelivery?: Date;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: number;
  responseBody?: string;
  duration: number;
  error?: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Rate Limit Types
export interface RateLimitResource {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface RateLimitResponse {
  resources: {
    core: RateLimitResource;
    search: RateLimitResource;
    graphql: RateLimitResource;
    integration_manifest: RateLimitResource;
    code_scanning_upload: RateLimitResource;
  };
  rate: RateLimitResource;
}

export interface RateLimit {
  id: string;
  userId: string;
  resource: string;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface OctokitResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  url: string;
}

// Repository Settings Types
export interface RepositorySettings {
  id: string;
  repositoryId: string;
  autoMergeEnabled: boolean;
  requireApprovals: number;
  protectedBranches: string[];
  allowedMergeTypes: string[];
  branchProtection?: Record<string, unknown>;
}

// Error Types
export type GitHubErrorType = 'API' | 'RATE_LIMIT' | 'AUTHENTICATION' | 'NOT_FOUND';

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

export class DataStorageError extends Error {
  constructor(
    message: string,
    public operation: 'READ' | 'WRITE' | 'DELETE',
    public entity: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DataStorageError';
  }
}

// Prisma Event Types
export interface PrismaEvent {
  timestamp: number;
  query: string;
  params?: unknown[];
  duration: number;
  target?: string;
}

// Webhook Event Types
export interface WebhookEvent {
  type: string;
  action: string;
  payload: WebhookPayload;
}

export interface WebhookPayload {
  action: string;
  repository: {
    full_name: string;
  };
  pull_request?: {
    number: number;
  };
}

export interface PullRequestWebhookPayload extends WebhookPayload {
  pull_request: {
    number: number;
    title: string;
    body: string;
    state: string;
    created_at: string;
    updated_at: string;
    merged_at: string | null;
    draft: boolean;
    mergeable: boolean | null;
    rebaseable: boolean | null;
    labels: Array<{ name: string }>;
    user: {
      login: string;
      avatar_url: string;
    };
  };
}

export interface ReviewWebhookPayload extends WebhookPayload {
  pull_request: {
    number: number;
  };
  review: {
    id: number;
    user: {
      login: string;
      avatar_url: string;
    };
    body: string | null;
    state: 'PENDING' | 'COMMENTED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'DISMISSED';
    submitted_at: string | null;
    commit_id: string;
  };
}

// Query Event Types
export interface QueryEvent {
  timestamp: string;
  query: string;
  params: string[];
  duration: number;
  target: string;
}

// Query Metrics Types
export interface QueryMetrics {
  timestamp: Date;
  query: string;
  duration: number;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  rowCount: number;
  success: boolean;
  errorMessage?: string;
  params?: Record<string, unknown>;
}

// Database Metrics Types
export interface DatabaseMetrics {
  timestamp: Date;
  connectionPool: {
    total: number;
    active: number;
    idle: number;
    waitingCount: number;
  };
  performance: {
    averageQueryTime: number;
    slowestQueries: Array<{
      query: string;
      duration: number;
      timestamp: Date;
    }>;
    errorRate: number;
  };
  storage: {
    databaseSize: number;
    tablesSizes: Record<string, number>;
    indexSizes: Record<string, number>;
  };
}

// Analysis Context Type
export interface AnalysisContext {
  repository: Repository;
  pullRequest: PullRequest;
  reviews: PullRequestReview[];
  comments: ReviewComment[];
}

// Dashboard Stats Types
export interface DashboardStats {
  // ... existing stats ...
  database: {
    health: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    performance: {
      averageQueryTime: number;
      errorRate: number;
      slowQueries: number;
    };
    connections: {
      active: number;
      idle: number;
      waiting: number;
    };
    storage: {
      totalSize: number;
      largestTables: Array<{
        name: string;
        size: number;
      }>;
    };
  };
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Prisma types
export interface PrismaClient {
  $on: (event: string, callback: (event: PrismaEvent) => void) => void;
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $transaction: <T>(arg: Promise<T>[]) => Promise<T[]>;
  pullRequest: {
    findUnique: (args: { where: unknown }) => Promise<PullRequest | null>;
    findMany: (args?: { where?: unknown }) => Promise<PullRequest[]>;
    create: (args: { data: unknown }) => Promise<PullRequest>;
    update: (args: { where: unknown; data: unknown }) => Promise<PullRequest>;
    delete: (args: { where: unknown }) => Promise<PullRequest>;
  };
  repository: {
    findUnique: (args: { where: unknown }) => Promise<Repository | null>;
    findMany: (args?: { where?: unknown }) => Promise<Repository[]>;
    create: (args: { data: unknown }) => Promise<Repository>;
    update: (args: { where: unknown; data: unknown }) => Promise<Repository>;
    delete: (args: { where: unknown }) => Promise<Repository>;
  };
}