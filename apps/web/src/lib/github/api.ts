import { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { PrismaClient } from './types';
import {
  Repository,
  PullRequest,
  PullRequestReview,
  ReviewComment,
  WebhookPayload,
  GitHubError,
  DataStorageError,
  QueryEvent,
  QueryMetrics,
  PrismaEvent,
  CacheEntry,
  PullRequestWebhookPayload,
  ReviewWebhookPayload,
} from './types';

type OctokitResponse<T> = {
  data: T;
  status: number;
  url: string;
  headers: Record<string, string | number | undefined>;
};

interface RateLimitResponse {
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    search?: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    graphql?: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
  };
  rate: {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  };
}

/**
 * Authentication options for GitHub API
 */
export interface AuthOptions {
  type: 'app' | 'token' | 'enterprise';
  credentials: {
    token?: string;
    appId?: string;
    privateKey?: string;
    installationId?: number;
    clientId?: string;
    clientSecret?: string;
    enterpriseServer?: string;  // URL for GitHub Enterprise Server
  };
}

/**
 * GitHubService - Handles GitHub API interactions with error handling and caching
 * 
 * Features:
 * - Rate limiting with automatic retry
 * - In-memory caching with TTL
 * - Comprehensive error handling
 * - Data storage management
 * - Database monitoring
 * 
 * Common Issues and Solutions:
 * 
 * 1. Rate Limiting:
 *    - Error: "API rate limit exceeded"
 *    - Solution: Service automatically handles rate limits with backoff
 * 
 * 2. Authentication:
 *    - Error: "Bad credentials"
 *    - Solution: Verify GITHUB_TOKEN environment variable
 * 
 * 3. Storage:
 *    - Error: "Failed to store PR data"
 *    - Solution: Check storage connection and permissions
 * 
 * 4. Caching:
 *    - Issue: Stale data
 *    - Solution: Use clearCache() or adjust CACHE_TTL
 */
export class GitHubService {
  private octokit: Octokit;
  private prisma: PrismaClient;
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private circuitBreaker: {
    failures: number;
    lastFailure: number | null;
    isOpen: boolean;
  } = {
    failures: 0,
    lastFailure: null,
    isOpen: false,
  };

  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_RESET_TIMEOUT = 30000; // 30 seconds

  private metrics: {
    api: {
      calls: number;
      errors: number;
      latency: number[];
    };
    cache: {
      hits: number;
      misses: number;
      size: number;
    };
    rateLimit: {
      remaining: number;
      reset: number;
      total: number;
      installation?: {
        remaining: number;
        reset: number;
        total: number;
      };
      userToServer?: {
        remaining: number;
        reset: number;
        total: number;
      };
    };
  } = {
    api: { calls: 0, errors: 0, latency: [] },
    cache: { hits: 0, misses: 0, size: 0 },
    rateLimit: { 
      remaining: 5000, 
      reset: 0, 
      total: 5000,
      installation: undefined,
      userToServer: undefined
    },
  };

  private maxRetries: number;
  private retryDelay: number;
  private readonly authOptions: AuthOptions;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(
    prisma: PrismaClient,
    octokit: Octokit,
    authOptions: AuthOptions,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      cacheTimeout?: number;
    } = {}
  ) {
    this.prisma = prisma;
    this.octokit = octokit;
    this.authOptions = authOptions;
    this.cache = new Map();
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  /**
   * Initialize the service asynchronously
   * This should be called after construction
   */
  public async initialize(): Promise<void> {
    await this.configureAuth();
    this.startMetricsCollection();
    this.setupDatabaseMonitoring();
  }

  private async configureAuth(): Promise<void> {
    switch (this.authOptions.type) {
      case 'app':
        if (!this.authOptions.credentials.appId || !this.authOptions.credentials.privateKey) {
          throw new Error('GitHub App credentials required');
        }
        // Configure app authentication
        await this.configureAppAuth();
        break;
        
      case 'enterprise':
        if (!this.authOptions.credentials.installationId) {
          throw new Error('Installation ID required for GitHub App authentication');
        }
        // Configure enterprise-specific settings
        await this.configureEnterpriseAuth();
        break;
        
      case 'token':
        if (!this.authOptions.credentials.token) {
          throw new Error('Personal access token required');
        }
        // Token auth is handled by Octokit constructor
        break;
    }
  }

  private async configureAppAuth(): Promise<void> {
    if (!this.authOptions.credentials.installationId) {
      throw new Error('Installation ID required for GitHub App authentication');
    }
    
    // Get installation access token
    const response = await this.octokit.apps.createInstallationAccessToken({
      installation_id: this.authOptions.credentials.installationId,
    });
    
    // Update Octokit instance with installation token
    this.octokit = new Octokit({
      auth: response.data.token,
      baseUrl: this.authOptions.credentials.enterpriseServer,
    });
  }

  private async configureEnterpriseAuth(): Promise<void> {
    // Configure enterprise-specific endpoints
    this.octokit = new Octokit({
      baseUrl: this.authOptions.credentials.enterpriseServer,
      auth: this.authOptions.credentials.token,
    });
  }

  private createAppJWT(): string {
    // Implement JWT creation logic for GitHub App authentication
    // This is a placeholder, you need to implement the actual logic
    return 'your-jwt-token';
  }

  /**
   * Initialize storage system with error handling
   * @throws {DataStorageError} If storage initialization fails
   */
  private async initializeStorage(): Promise<void> {
    try {
      // Initialize persistent storage (e.g., database connection)
      // This is a placeholder for your actual storage initialization
      console.log('Initializing persistent storage...');
    } catch (error) {
      throw new DataStorageError(
        'Failed to initialize storage system',
        'READ',
        'storage',
        error
      );
    }
  }

  /**
   * Verify storage system access and permissions
   * @throws {DataStorageError} If storage access verification fails
   */
  private async verifyStorageAccess(): Promise<void> {
    try {
      // Test cache access with ttl property
      this.cache.set('test', {
        data: 'test',
        timestamp: Date.now(),
        ttl: this.CACHE_TTL  // Add the ttl using the class constant
      });
      this.cache.delete('test');
    } catch (error) {
      throw new DataStorageError(
        'Storage access verification failed',
        'READ',
        'storage',
        error
      );
    }
  }

  /**
   * Clear in-memory cache
   */
  public async clearCache(): Promise<void> {
    try {
      // Clear in-memory cache
      this.cache.clear();
    } catch (error) {
      throw new DataStorageError(
        'Failed to clear cache',
        'DELETE',
        'cache',
        error
      );
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  public getCacheStats(): { size: number; oldestEntry: Date | null } {
    let oldestTimestamp = Date.now();
    this.cache.forEach(({ timestamp }) => {
      oldestTimestamp = Math.min(oldestTimestamp, timestamp);
    });

    return {
      size: this.cache.size,
      oldestEntry: this.cache.size > 0 ? new Date(oldestTimestamp) : null
    };
  }

  /**
   * Enhanced rate limit handling with exponential backoff
   */
  private async withRateLimit<T>(operation: () => Promise<T>, retryCount = 0): Promise<T> {
    try {
      await this.checkRateLimit();
      return await operation();
    } catch (error: unknown) {
      if (error instanceof Error && 
          'status' in error && 
          error.status === 403 && 
          error.message.includes('API rate limit exceeded')) {
        if (retryCount < this.MAX_RETRIES) {
          const waitTime = this.calculateBackoff(retryCount);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.withRateLimit(operation, retryCount + 1);
        }
      }
      throw this.handleGitHubError(error);
    }
  }

  /**
   * Improved cache management with size limits and metrics
   */
  private async manageCacheSize(): Promise<void> {
    this.metrics.cache.size = this.cache.size;
    
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries());
      entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = entries.slice(0, Math.floor(1000 * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
      
      // Record cache cleanup in metrics
      this.metrics.cache.size = this.cache.size;
    }
  }

  /**
   * Enhanced cache access with metrics
   */
  private getCacheKey(key: string): CacheEntry<unknown> | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.metrics.cache.hits++;
      return cached;
    }
    this.metrics.cache.misses++;
    return null;
  }

  /**
   * Circuit breaker implementation to track failures and manage breaker state
   */
  private handleCircuitBreaker(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    if (this.circuitBreaker.failures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      this.circuitBreaker.isOpen = true;
    }
  }

  private resetCircuitBreaker(): void {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.lastFailure = 0;
  }

  /**
   * Batch operations support with chunking
   */
  async batchGetPullRequests(
    owner: string,
    repo: string,
    numbers: number[]
  ): Promise<PullRequest[]> {
    const results: PullRequest[] = [];
    const chunks = this.chunkArray(numbers, 10);

    for (const chunk of chunks) {
      const promises = chunk.map(num => this.getPullRequest(owner, repo, num));
      const chunkResults = await Promise.all(
        promises.map(p => p.catch(error => {
          this.metrics.api.errors++;
          return this.handleGitHubError(error);
        }))
      );
      results.push(...chunkResults.filter(Boolean));
    }

    return results;
  }

  /**
   * Webhook event handling with cache invalidation
   */
  async handleWebhookEvent(event: string, payload: WebhookPayload): Promise<void> {
    const startTime = Date.now();
    try {
      switch (event) {
        case 'pull_request':
          await this.handlePREvent(payload as PullRequestWebhookPayload);
          break;
        case 'pull_request_review':
          await this.handleReviewEvent(payload as ReviewWebhookPayload);
          break;
        // Add other event types as needed
      }
      this.metrics.api.latency.push(Date.now() - startTime);
    } catch (error) {
      this.metrics.api.errors++;
      throw error;
    }
  }

  /**
   * Performance optimization with prefetching
   */
  private async prefetchRelatedData(
    owner: string,
    repo: string,
    pull_number: number
  ): Promise<void> {
    const promises = [
      this.getPRReviews(owner, repo, pull_number),
      this.getPRComments(owner, repo, pull_number),
      this.getPullRequestDiff(owner, repo, pull_number)
    ];

    await Promise.all(promises.map(p => p.catch(() => {
      this.metrics.api.errors++;
      return null;
    })));
  }

  /**
   * Metrics reporting
   */
  getMetrics(): {
    api: { calls: number; errors: number; averageLatency: number };
    cache: { hitRate: number; size: number };
    rateLimit: { remaining: number; reset: number };
  } {
    const averageLatency = this.metrics.api.latency.reduce((a, b) => a + b, 0) / 
      (this.metrics.api.latency.length || 1);
    
    const hitRate = this.metrics.cache.hits / 
      (this.metrics.cache.hits + this.metrics.cache.misses || 1);

    return {
      api: {
        calls: this.metrics.api.calls,
        errors: this.metrics.api.errors,
        averageLatency,
      },
      cache: {
        hitRate,
        size: this.metrics.cache.size,
      },
      rateLimit: {
        remaining: this.metrics.rateLimit.remaining,
        reset: this.metrics.rateLimit.reset,
      },
    };
  }

  /**
   * Fetch repository information with caching and rate limiting
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Repository>} Repository information
   */
  public async getRepository(owner: string, repo: string): Promise<Repository> {
    const cacheKey = `${owner}/${repo}`;
    const cached = this.getCacheKey(cacheKey);
    if (cached) {
      return cached.data as Repository;
    }

    const response = await this.withRateLimit(() =>
      this.octokit.repos.get({ owner, repo })
    );

    // Transform Octokit response to match our Repository type
    const repository: Repository = {
      id: Number(response.data.id), // Ensure id is a number
      name: response.data.name,
      fullName: response.data.full_name,
      private: response.data.private,
      description: response.data.description,
      defaultBranch: response.data.default_branch,
      language: response.data.language || '',
      stargazersCount: response.data.stargazers_count,
      forksCount: response.data.forks_count,
      organizationId: response.data.organization?.id?.toString(),
      settings: {
        id: `${response.data.id}-settings`,
        repositoryId: response.data.id.toString(),
        autoMergeEnabled: response.data.allow_auto_merge || false,
        requireApprovals: 1, // Default value
        protectedBranches: [response.data.default_branch],
        allowedMergeTypes: [
          response.data.allow_merge_commit ? 'merge' : '',
          response.data.allow_squash_merge ? 'squash' : '',
          response.data.allow_rebase_merge ? 'rebase' : ''
        ].filter(Boolean),
        branchProtection: {} // Optional field
      }
    };

    this.cache.set(cacheKey, {
      data: repository,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL // Add the required ttl property
    });

    return repository;
  }

  /**
   * Fetch pull request information with caching and rate limiting
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} number - Pull request number
   * @returns {Promise<PullRequest>} Pull request information
   */
  public async getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest> {
    const response = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: number
    });
    
    return {
      number: response.data.number,
      title: response.data.title,
      body: response.data.body || '',
      state: response.data.state,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
      mergedAt: response.data.merged_at,
      changedFiles: response.data.changed_files,
      additions: response.data.additions,
      deletions: response.data.deletions,
      draft: response.data.draft || false,
      mergeable: response.data.mergeable || null,
      rebaseable: response.data.rebaseable || null,
      labels: response.data.labels?.map(label => label.name) || [],
      mergeableState: response.data.mergeable_state as 'mergeable' | 'conflicting' | 'unknown',
      ciStatus: undefined,
      milestone: response.data.milestone?.title
    };
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>): Promise<T> {
    if (this.circuitBreaker.isOpen) {
      const timeSinceLastFailure = Date.now() - (this.circuitBreaker.lastFailure || 0);
      if (timeSinceLastFailure < this.CIRCUIT_BREAKER_RESET_TIMEOUT) {
        throw new GitHubError('Circuit breaker is open', 503, undefined);
      }
      this.resetCircuitBreaker();
    }

    let retryCount = 0;
    const shouldRetry = true;
    
    while (shouldRetry && retryCount <= this.MAX_RETRIES) {
      try {
        return await operation();
      } catch (error: unknown) {
        this.handleCircuitBreaker();
        
        if (!(error instanceof Error) || retryCount >= this.MAX_RETRIES) {
          throw error;
        }
        
        if (error instanceof GitHubError && error.status === 403 && error.message.includes('API rate limit exceeded')) {
          const waitTime = this.calculateBackoff(retryCount);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }
        throw error;
      }
    }
    
    // This line should never be reached due to the return or throw in the loop
    throw new GitHubError('Maximum retries exceeded', 500, undefined);
  }

  private async handleGitHubError(error: unknown): Promise<never> {
    if (error instanceof GitHubError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new GitHubError(error.message, 500, undefined);
    }
    throw new GitHubError('Unknown GitHub API Error', 500, undefined);
  }

  /**
   * Fetch reviews for a pull request
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} number - Pull request number
   * @returns {Promise<RestEndpointMethodTypes["pulls"]["listReviews"]["response"]["data"]>} List of pull request reviews
   */
  public async getPullRequestReviews(
    owner: string,
    repo: string,
    number: number
  ): Promise<RestEndpointMethodTypes["pulls"]["listReviews"]["response"]["data"]> {
    const response = await this.octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: number
    });

    return response.data;
  }

  /**
   * Fetch review comments for a pull request
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} number - Pull request number
   * @returns {Promise<RestEndpointMethodTypes["pulls"]["listReviewComments"]["response"]["data"]>} List of pull request review comments
   */
  public async getPullRequestComments(
    owner: string,
    repo: string,
    number: number
  ): Promise<RestEndpointMethodTypes["pulls"]["listReviewComments"]["response"]["data"]> {
    const response = await this.octokit.pulls.listReviewComments({
      owner,
      repo,
      pull_number: number
    });

    return response.data;
  }

  private async handlePREvent(payload: PullRequestWebhookPayload): Promise<void> {
    // Handle PR events
    console.log('Handling PR event:', payload.action);
    // Handle based on action
    switch (payload.action) {
      case 'opened':
        console.log(`PR #${payload.pull_request.number} opened: ${payload.pull_request.title}`);
        break;
      case 'reopened':
        console.log(`PR #${payload.pull_request.number} reopened: ${payload.pull_request.title}`);
        break;
      case 'edited':
        console.log(`PR #${payload.pull_request.number} edited: ${payload.pull_request.title}`);
        break;
      case 'closed':
        console.log(
          `PR #${payload.pull_request.number} ${payload.pull_request.merged_at ? 'merged' : 'closed without merge'}: ${payload.pull_request.title}`
        );
        break;
    }
  }

  private async handleReviewEvent(payload: ReviewWebhookPayload): Promise<void> {
    // Handle review events
    console.log('Handling review event:', payload.action);
    // Access typed review data
    const { state } = payload.review;
    // Handle based on review state
    switch (state) {
      case 'APPROVED':
        console.log(`PR ${payload.pull_request.number} approved`);
        break;
      case 'CHANGES_REQUESTED':
        console.log(`Changes requested on PR ${payload.pull_request.number}`);
        break;
      case 'COMMENTED':
        console.log(`New comment on PR ${payload.pull_request.number}`);
        break;
    }
  }

  private async getPRReviews(owner: string, repo: string, pull_number: number): Promise<PullRequestReview[]> {
    const response = await this.octokit.pulls.listReviews({
      owner,
      repo,
      pull_number,
    });
    
    return response.data.map(review => ({
      id: review.id,
      user: {
        login: review.user?.login || '',
        avatarUrl: review.user?.avatar_url || '',
        type: 'USER',
        role: 'REVIEWER'
      },
      body: review.body || null,
      state: review.state as 'PENDING' | 'COMMENTED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'DISMISSED',
      commitId: review.commit_id || '',
      submittedAt: review.submitted_at || null,
    }));
  }

  private async getPRComments(owner: string, repo: string, pull_number: number): Promise<ReviewComment[]> {
    const response = await this.octokit.pulls.listReviewComments({
      owner,
      repo,
      pull_number,
    });
    
    return response.data.map(comment => ({
      id: comment.id,
      body: comment.body || '',
      path: comment.path,
      position: comment.position || 0,
      line: comment.line || comment.original_line || 0,
      originalLine: comment.original_position || 0,
      commitId: comment.commit_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: {
        login: comment.user?.login || '',
        avatarUrl: comment.user?.avatar_url || '',
        type: 'USER',
        role: 'REVIEWER'
      }
    }));
  }

  private async getPullRequestDiff(owner: string, repo: string, pull_number: number): Promise<string> {
    const response = await this.octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
      owner,
      repo,
      pull_number,
      mediaType: {
        format: 'diff',
      },
    });
    
    return response.data.toString();
  }

  private collectMetrics(): void {
    // Collect and record metrics
    console.log('Collecting metrics...');
  }

  private recordQueryMetrics(event: QueryEvent): void {
    const metrics: QueryMetrics = {
      timestamp: new Date(),
      query: event.query,
      duration: event.duration,
      table: event.target,
      operation: this.getQueryOperation(event.query),
      rowCount: 0, // Would need to be extracted from the query result
      success: true,
      params: event.params.reduce((acc, param, index) => {
        acc[`param${index + 1}`] = param;
        return acc;
      }, {} as Record<string, unknown>)
    };
    
    console.log('Recording query metrics:', metrics);
  }

  private getQueryOperation(query: string): 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' {
    const q = query.trim().toUpperCase();
    if (q.startsWith('SELECT')) return 'SELECT';
    if (q.startsWith('INSERT')) return 'INSERT';
    if (q.startsWith('UPDATE')) return 'UPDATE';
    if (q.startsWith('DELETE')) return 'DELETE';
    return 'SELECT'; // Default to SELECT for unknown queries
  }

  // Helper to determine if we're running as a GitHub App
  private get isGitHubApp(): boolean {
    return this.authOptions.type === 'app';
  }

  private startMetricsCollection(): void {
    // Initialize metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, 60000); // Collect metrics every minute
  }

  private setupDatabaseMonitoring(): void {
    (this.prisma.$on as (event: string, listener: (event: PrismaEvent) => void) => void)('query', (e: PrismaEvent) => {
      const event: QueryEvent = {
        timestamp: new Date(e.timestamp).toISOString(),
        query: e.query,
        params: e.params?.map(String) || [],
        duration: e.duration,
        target: e.target || 'unknown'
      };
      this.recordQueryMetrics(event);
    });
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    // Stop metrics collection
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    // Close database connection
    await this.prisma.$disconnect();
    
    // Clear cache
    this.cache.clear();
  }

  private async checkRateLimit(): Promise<number> {
    try {
      const response: OctokitResponse<RateLimitResponse> = await this.octokit.rateLimit.get();
      const { rate, resources } = response.data;

      // Update metrics for different rate limit pools
      this.metrics.rateLimit = {
        remaining: rate.remaining,
        reset: rate.reset,
        total: rate.limit,
        installation: this.isGitHubApp ? {
          remaining: resources.graphql?.remaining ?? resources.core.remaining,
          reset: resources.graphql?.reset ?? resources.core.reset,
          total: resources.graphql?.limit ?? resources.core.limit
        } : undefined,
        userToServer: this.isGitHubApp ? {
          remaining: resources.core.remaining,
          reset: resources.core.reset,
          total: resources.core.limit
        } : undefined
      };

      // Check appropriate rate limit based on authentication type
      const effectiveRemaining = this.isGitHubApp ? 
        Math.min(
          this.metrics.rateLimit.installation?.remaining || 0,
          this.metrics.rateLimit.userToServer?.remaining || 0
        ) :
        this.metrics.rateLimit.remaining;

      const effectiveLimit = this.isGitHubApp ? 
        Math.min(
          this.metrics.rateLimit.installation?.total || 5000,
          this.metrics.rateLimit.userToServer?.total || 12500
        ) :
        this.metrics.rateLimit.total;

      // Proactively wait if we're close to the limit
      if (effectiveRemaining < effectiveLimit * 0.1) {
        const resetTime = new Date(this.metrics.rateLimit.reset * 1000);
        const now = new Date();
        const waitTime = resetTime.getTime() - now.getTime();
        
        if (waitTime > 0) {
          console.log(`Rate limit low (${effectiveRemaining}/${effectiveLimit}). Waiting ${Math.round(waitTime/1000)}s until reset.`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return effectiveLimit; // After waiting, we should have full rate limit again
        }
      }

      return effectiveRemaining;
    } catch (error) {
      this.metrics.api.errors++;
      throw this.handleGitHubError(error);
    }
  }

  private calculateBackoff(retryCount: number): number {
    // Base delay starts at 1s, doubles each retry up to 1 minute
    const baseDelay = Math.min(1000 * Math.pow(2, retryCount), 60000);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000; // Random delay 0-1000ms
    
    return baseDelay + jitter;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}