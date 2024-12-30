import { Octokit } from '@octokit/rest';
import { RateLimiter } from './rate-limiter';
import type { GitHubRepositoryData, GitHubRepositoryMetrics, GitHubRepositoryActivity } from '../types/github-api';

export class GitHubIntegrationService {
  protected octokit: Octokit;
  protected rateLimiter: RateLimiter;

  constructor(token: string, userId: string) {
    this.octokit = new Octokit({
      auth: token,
    });
    this.rateLimiter = new RateLimiter(userId);
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepositoryData> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { data } = await this.octokit.repos.get({ owner, repo });
      return data as GitHubRepositoryData;
    });
  }

  async getRepositoryMetrics(owner: string, repo: string): Promise<GitHubRepositoryMetrics> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const [repoData, contributors, pulls, branches, releases] = await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.octokit.repos.listContributors({ owner, repo }).catch(() => ({ data: [] })),
        this.octokit.pulls.list({ owner, repo, state: 'all' }).catch(() => ({ data: [] })),
        this.octokit.repos.listBranches({ owner, repo }).catch(() => ({ data: [] })),
        this.octokit.repos.listReleases({ owner, repo }).catch(() => ({ data: [] }))
      ]);

      return {
        stars: repoData.data.stargazers_count,
        forks: repoData.data.forks_count,
        openIssues: repoData.data.open_issues_count,
        watchers: repoData.data.watchers_count,
        contributors: contributors.data.length,
        pullRequests: pulls.data.length,
        branches: branches.data.length,
        size: repoData.data.size,
        releases: releases.data.length,
        lastCommitAt: repoData.data.pushed_at,
        lastReleaseAt: releases.data[0]?.published_at || null,
        lastPushAt: repoData.data.pushed_at
      };
    });
  }

  async getRepositoryActivity(owner: string, repo: string): Promise<GitHubRepositoryActivity> {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const [commits, pulls, issues] = await Promise.all([
        this.octokit.repos.listCommits({ owner, repo, since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }).catch(() => ({ data: [] })),
        this.octokit.pulls.list({ owner, repo, state: 'all', since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }).catch(() => ({ data: [] })),
        this.octokit.issues.listForRepo({ owner, repo, since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }).catch(() => ({ data: [] }))
      ]);

      const lastCommit = commits.data[0]?.commit.author?.date || new Date().toISOString();
      const lastRelease = await this.octokit.repos.getLatestRelease({ owner, repo })
        .then(response => response.data.published_at)
        .catch(() => null);

      return {
        lastCommit,
        lastRelease,
        commitsLastMonth: commits.data.length,
        prsLastMonth: pulls.data.length,
        issuesLastMonth: issues.data.length
      };
    });
  }

  async getPRReviews(owner: string, repo: string, pullNumber: number) {
    return this.rateLimiter.executeWithRateLimit(async () => {
      const { data } = await this.octokit.pulls.listReviews({
        owner,
        repo,
        pull_number: pullNumber
      });
      return data;
    });
  }

  async close(): Promise<void> {
    await this.rateLimiter.close();
  }
}
