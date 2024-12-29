import { Octokit } from '@octokit/rest';
import { RateLimiter } from './rate-limiter';

export interface GitHubUser {
  name?: string | null;
  email?: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  starred_at?: string;
}

export interface GitHubPRReview {
  id: number;
  node_id: string;
  user: GitHubUser | null;
  body: string | null;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  html_url: string;
  pull_request_url: string;
  submitted_at: string | null;
  commit_id: string;
  _links: {
    html: { href: string };
    pull_request: { href: string };
  };
}

export interface GitHubComment {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: GitHubUser | null;
  created_at: string;
  updated_at: string;
  issue_url: string;
  author_association: string;
}

export interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    } | null;
    committer: {
      name: string;
      email: string;
      date: string;
    } | null;
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: GitHubUser | null;
  committer: GitHubUser | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
}

export class GitHubIntegrationService {
  protected octokit: Octokit;
  protected rateLimiter: RateLimiter;
  private token: string;

  constructor(token: string, userId: string) {
    this.token = token;
    this.octokit = new Octokit({
      auth: token,
      request: {
        fetch: this.fetchWithRetry.bind(this)
      }
    });
    this.rateLimiter = new RateLimiter(userId);
  }

  async getPRReviews(owner: string, repo: string, prNumber: number): Promise<GitHubPRReview[]> {
    return this.executeWithRateLimit(async () => {
      const { data } = await this.octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: prNumber
      });
      return data as GitHubPRReview[];
    });
  }

  protected async executeWithRateLimit<T>(operation: () => Promise<T>): Promise<T> {
    return this.rateLimiter.executeWithRateLimit(operation);
  }

  protected async fetchWithRateLimit<T>(endpoint: string): Promise<T> {
    return this.executeWithRateLimit(async () => {
      const response = await this.fetchRaw(endpoint);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error: ${response.status} ${errorText}`);
      }
      return response.json();
    });
  }

  protected async fetchRaw(endpoint: string): Promise<Response> {
    const baseUrl = 'https://api.github.com';
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    return response;
  }

  private async getAccessToken(): Promise<string> {
    const auth = await this.octokit.auth();
    if (!auth) {
      return this.token;
    }
    if (typeof auth === 'object' && 'token' in auth && typeof auth.token === 'string') {
      return auth.token;
    }
    return this.token;
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        if (response.status === 403) {
          const resetTime = response.headers.get('x-ratelimit-reset');
          if (resetTime) {
            const waitTime = (parseInt(resetTime) * 1000) - Date.now();
            if (waitTime > 0) {
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
        }
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to fetch after retries');
  }

  async close(): Promise<void> {
    await this.rateLimiter.close();
  }
}
