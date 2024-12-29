import { PrismaClient } from '@prisma/client';
import type { Octokit } from '@octokit/rest';
import type { 
  Repository,
  PullRequest,
  PullRequestReview,
  GitHubAppConfig
} from './types';
import { 
  GitHubError, 
  NotFoundError, 
  AuthenticationError, 
  RateLimitError, 
  NetworkError, 
  ServerError
} from './errors';

interface GitHubErrorResponse {
  status: number;
  response?: {
    headers?: Record<string, string>;
  };
  code?: string;
}

export class GitHubService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly octokit: Octokit,
    private readonly config: GitHubAppConfig,
  ) {}

  async getRepository(owner: string, repo: string): Promise<Repository> {
    try {
      const response = await this.octokit.repos.get({
        owner,
        repo
      });

      const repository: Repository = {
        id: response.data.id,
        name: response.data.name,
        full_name: response.data.full_name,
        private: response.data.private,
        owner: {
          id: response.data.owner.id,
          login: response.data.owner.login,
          avatar_url: response.data.owner.avatar_url,
          html_url: response.data.owner.html_url
        },
        html_url: response.data.html_url,
        description: response.data.description,
        fork: response.data.fork,
        url: response.data.url,
        default_branch: response.data.default_branch,
        language: response.data.language,
        stargazers_count: response.data.stargazers_count,
        watchers_count: response.data.watchers_count,
        forks_count: response.data.forks_count,
        open_issues_count: response.data.open_issues_count,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at
      };

      return repository;
    } catch (error) {
      this.handleGitHubError(error);
      throw error; // TypeScript needs this even though handleGitHubError always throws
    }
  }

  async getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest> {
    try {
      const response = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: number
      });

      const pullRequest: PullRequest = {
        id: response.data.id,
        number: response.data.number,
        title: response.data.title,
        body: response.data.body,
        state: response.data.state as 'open' | 'closed',
        html_url: response.data.html_url,
        diff_url: response.data.diff_url,
        patch_url: response.data.patch_url,
        merged: response.data.merged,
        mergeable: response.data.mergeable,
        mergeable_state: response.data.mergeable_state,
        merged_by: response.data.merged_by ? {
          id: response.data.merged_by.id,
          login: response.data.merged_by.login,
          avatar_url: response.data.merged_by.avatar_url,
          html_url: response.data.merged_by.html_url
        } : null,
        comments: response.data.comments,
        review_comments: response.data.review_comments,
        commits: response.data.commits,
        additions: response.data.additions,
        deletions: response.data.deletions,
        changed_files: response.data.changed_files,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        head: {
          ref: response.data.head.ref,
          sha: response.data.head.sha,
          repo: {
            id: response.data.head.repo?.id || 0,
            name: response.data.head.repo?.name || '',
            full_name: response.data.head.repo?.full_name || ''
          }
        },
        base: {
          ref: response.data.base.ref,
          sha: response.data.base.sha,
          repo: {
            id: response.data.base.repo.id,
            name: response.data.base.repo.name,
            full_name: response.data.base.repo.full_name
          }
        },
        user: {
          id: response.data.user.id,
          login: response.data.user.login,
          avatar_url: response.data.user.avatar_url,
          html_url: response.data.user.html_url
        }
      };

      return pullRequest;
    } catch (error) {
      this.handleGitHubError(error);
      throw error; // TypeScript needs this even though handleGitHubError always throws
    }
  }

  async getPullRequestReviews(owner: string, repo: string, number: number): Promise<PullRequestReview[]> {
    try {
      const response = await this.octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: number
      });

      return response.data.map(review => {
        if (!review.user) {
          throw new Error('Review user data is missing');
        }

        return {
          id: review.id,
          user: {
            login: review.user.login,
            avatarUrl: review.user.avatar_url,
            type: review.user.type,
            role: 'REVIEWER'
          },
          body: review.body || '',
          state: review.state as 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING',
          commitId: review.commit_id || '',
          submittedAt: review.submitted_at || new Date().toISOString()
        };
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Review user data is missing') {
        throw error;
      }
      this.handleGitHubError(error);
      throw error; // TypeScript needs this even though handleGitHubError always throws
    }
  }

  private handleGitHubError(error: unknown): never {
    const gitHubError = error as GitHubErrorResponse;
    
    if (gitHubError.status === 404) {
      throw new NotFoundError('Resource not found', error);
    }
    if (gitHubError.status === 401) {
      throw new AuthenticationError('Authentication failed', error);
    }
    if (gitHubError.status === 403 && gitHubError.response?.headers?.['x-ratelimit-remaining'] === '0') {
      throw new RateLimitError('Rate limit exceeded', error);
    }
    if (gitHubError.status >= 500) {
      throw new ServerError('GitHub server error', error);
    }
    if (gitHubError.status === 0 || gitHubError.code === 'ECONNREFUSED') {
      throw new NetworkError('Network error', error);
    }
    
    throw new GitHubError('GitHub API error', undefined, error);
  }

  async destroy(): Promise<void> {
    try {
      await this.prisma.$disconnect();
    } catch (error) {
      throw new GitHubError('Failed to destroy service', undefined, error);
    }
  }
}
