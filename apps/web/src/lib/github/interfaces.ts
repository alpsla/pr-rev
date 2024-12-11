import type { PrismaClient, ReviewStatus } from '@prisma/client';
import type { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { WebhookEventName, WebhookEventPayload, PullRequestWebhookPayload, PullRequestReviewWebhookPayload, RepositoryWebhookPayload } from '../github/__tests__/utils/mock-types';
import type { Repository, PullRequest, PullRequestReview } from './types';

type OctokitReview = RestEndpointMethodTypes['pulls']['listReviews']['response']['data'][0];

export interface GitHubAuthConfig {
  type: 'token';
  credentials: {
    token: string;
  };
}

export interface GitHubServiceConfig {
  auth: GitHubAuthConfig;
}

export interface IGitHubService {
  handleWebhookEvent(eventName: WebhookEventName, payload: WebhookEventPayload): Promise<void>;
  getRepository(owner: string, repo: string): Promise<Repository>;
  getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest>;
  getPullRequestReviews(owner: string, repo: string, number: number): Promise<PullRequestReview[]>;
  destroy(): Promise<void>;
}

// Export both the class and its type
export class GitHubService implements IGitHubService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly octokit: Octokit,
    private readonly config: GitHubAuthConfig,
  ) {}

  async handleWebhookEvent(eventName: WebhookEventName, payload: WebhookEventPayload): Promise<void> {
    switch (eventName) {
      case 'pull_request':
        if (this.isPullRequestPayload(payload)) {
          await this.handlePullRequestEvent(payload);
        }
        break;
      case 'pull_request_review':
        if (this.isPullRequestReviewPayload(payload)) {
          await this.handlePullRequestReviewEvent(payload);
        }
        break;
      case 'repository':
        if (this.isRepositoryPayload(payload)) {
          await this.handleRepositoryEvent(payload);
        }
        break;
    }
  }

  private isPullRequestPayload(payload: WebhookEventPayload): payload is PullRequestWebhookPayload {
    return 'pull_request' in payload && !('review' in payload);
  }

  private isPullRequestReviewPayload(payload: WebhookEventPayload): payload is PullRequestReviewWebhookPayload {
    return 'review' in payload && 'pull_request' in payload;
  }

  private isRepositoryPayload(payload: WebhookEventPayload): payload is RepositoryWebhookPayload {
    return !('pull_request' in payload) && !('review' in payload);
  }

  private mapReviewState(state: string): ReviewStatus {
    switch (state.toUpperCase()) {
      case 'APPROVED':
        return 'APPROVED';
      case 'CHANGES_REQUESTED':
        return 'CHANGES_REQUESTED';
      case 'COMMENTED':
        return 'COMMENTED';
      case 'DISMISSED':
        return 'DISMISSED';
      case 'PENDING':
        return 'PENDING';
      default:
        return 'PENDING';
    }
  }

  private async handlePullRequestEvent(payload: PullRequestWebhookPayload): Promise<void> {
    const { action, pull_request: pr, repository } = payload;

    switch (action) {
      case 'opened':
      case 'reopened':
      case 'edited':
      case 'synchronize':
        await this.prisma.pullRequest.upsert({
          where: {
            repositoryId_number: {
              repositoryId: repository.id,
              number: pr.number,
            },
          },
          create: {
            number: pr.number,
            title: pr.title,
            status: 'OPEN',
            repositoryId: repository.id,
            authorId: pr.user.login,
            baseBranch: pr.base.ref,
            headBranch: pr.head.ref,
            isDraft: pr.draft,
            isReady: !pr.draft,
          },
          update: {
            title: pr.title,
            status: 'OPEN',
            isDraft: pr.draft,
            isReady: !pr.draft,
          },
        });
        break;

      case 'closed':
        await this.prisma.pullRequest.update({
          where: {
            repositoryId_number: {
              repositoryId: repository.id,
              number: pr.number,
            },
          },
          data: {
            status: pr.merged ? 'MERGED' : 'CLOSED',
            metadata: {
              mergedAt: pr.merged_at,
              merged: pr.merged,
            },
          },
        });
        break;
    }
  }

  private async handlePullRequestReviewEvent(payload: PullRequestReviewWebhookPayload): Promise<void> {
    const { action, review, pull_request: pr } = payload;

    switch (action) {
      case 'submitted':
        await this.prisma.review.create({
          data: {
            pullRequestId: pr.id,
            reviewerId: review.user.login,
            status: this.mapReviewState(review.state),
            body: review.body ?? '',
            submittedAt: new Date(review.submitted_at ?? ''),
          },
        });
        break;

      case 'dismissed':
        await this.prisma.review.updateMany({
          where: {
            pullRequestId: pr.id,
            reviewerId: review.user.login,
            status: this.mapReviewState(review.state),
          },
          data: {
            status: 'DISMISSED',
          },
        });
        break;
    }
  }

  private async handleRepositoryEvent(payload: RepositoryWebhookPayload): Promise<void> {
    const { action, repository } = payload;

    const platform = await this.prisma.platform.findFirstOrThrow({
      where: { type: 'GITHUB' },
    });

    switch (action) {
      case 'created':
        await this.prisma.repository.create({
          data: {
            name: repository.name,
            fullName: repository.full_name,
            private: repository.private ?? false,
            url: repository.html_url ?? '',
            platformId: platform.id,
          },
        });
        break;

      case 'deleted':
        await this.prisma.repository.delete({
          where: {
            fullName: repository.full_name,
          },
        });
        break;

      case 'privatized':
      case 'publicized':
        await this.prisma.repository.update({
          where: {
            fullName: repository.full_name,
          },
          data: {
            private: repository.private ?? false,
          },
        });
        break;
    }
  }

  async getRepository(owner: string, repo: string): Promise<Repository> {
    const { data } = await this.octokit.rest.repos.get({
      owner,
      repo,
    });

    const platform = await this.prisma.platform.findFirstOrThrow({
      where: { type: 'GITHUB' },
    });

    await this.prisma.repository.upsert({
      where: {
        fullName: data.full_name,
      },
      create: {
        name: data.name,
        fullName: data.full_name,
        private: data.private,
        url: data.html_url,
        platformId: platform.id,
      },
      update: {
        name: data.name,
        private: data.private,
      },
    });

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      description: data.description ?? '',
      private: data.private ?? false,
      defaultBranch: data.default_branch,
      language: data.language ?? '',
      stargazersCount: data.stargazers_count,
      forksCount: data.forks_count,
      settings: {
        id: `${data.id}-settings`,
        repositoryId: `${data.id}`,
        autoMergeEnabled: data.allow_auto_merge ?? false,
        requireApprovals: 1,
        protectedBranches: [data.default_branch],
        allowedMergeTypes: [
          ...(data.allow_merge_commit ? ['merge'] : []),
          ...(data.allow_squash_merge ? ['squash'] : []),
          ...(data.allow_rebase_merge ? ['rebase'] : []),
        ],
        branchProtection: {},
      },
    };
  }

  async getPullRequest(owner: string, repo: string, number: number): Promise<PullRequest> {
    const { data } = await this.octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: number,
    });

    await this.prisma.pullRequest.upsert({
      where: {
        repositoryId_number: {
          repositoryId: data.base.repo.id.toString(),
          number: data.number,
        },
      },
      create: {
        number: data.number,
        title: data.title,
        status: data.merged ? 'MERGED' : data.state === 'closed' ? 'CLOSED' : 'OPEN',
        repositoryId: data.base.repo.id.toString(),
        authorId: data.user?.login ?? '',
        baseBranch: data.base.ref,
        headBranch: data.head.ref,
        isDraft: data.draft ?? false,
        isReady: !(data.draft ?? false),
      },
      update: {
        title: data.title,
        status: data.merged ? 'MERGED' : data.state === 'closed' ? 'CLOSED' : 'OPEN',
        isDraft: data.draft ?? false,
        isReady: !(data.draft ?? false),
      },
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body ?? '',
      state: data.state,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      mergedAt: data.merged_at,
      changedFiles: data.changed_files,
      additions: data.additions,
      deletions: data.deletions,
      draft: data.draft ?? false,
      mergeable: data.mergeable ?? null,
      rebaseable: data.rebaseable ?? null,
      labels: data.labels?.map(label => label.name) ?? [],
      mergeableState: this.mapMergeableState(data.mergeable_state),
    };
  }

  private mapMergeableState(state: string | undefined): 'mergeable' | 'conflicting' | 'unknown' {
    switch (state) {
      case 'clean':
        return 'mergeable';
      case 'dirty':
      case 'blocked':
      case 'unstable':
        return 'conflicting';
      default:
        return 'unknown';
    }
  }

  private isValidReview(review: OctokitReview): boolean {
    return Boolean(
      review &&
      review.user?.login &&
      review.user?.avatar_url &&
      review.user?.type &&
      review.commit_id &&
      review.submitted_at &&
      review.state
    );
  }

  async getPullRequestReviews(owner: string, repo: string, number: number): Promise<PullRequestReview[]> {
    const { data } = await this.octokit.rest.pulls.listReviews({
      owner,
      repo,
      pull_number: number,
    });

    return data
      .filter(this.isValidReview)
      .map(review => {
        if (!review.user || !review.commit_id || !review.submitted_at) {
          throw new Error('Invalid review data');
        }

        return {
          id: review.id,
          user: {
            login: review.user.login,
            avatarUrl: review.user.avatar_url,
            type: review.user.type,
            role: 'REVIEWER',
          },
          body: review.body ?? null,
          state: review.state as PullRequestReview['state'],
          commitId: review.commit_id,
          submittedAt: review.submitted_at,
        };
      });
  }

  async destroy(): Promise<void> {
    // Cleanup resources if needed
  }
}
