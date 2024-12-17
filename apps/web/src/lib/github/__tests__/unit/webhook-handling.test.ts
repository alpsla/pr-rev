import { describe, expect, it, beforeEach } from '@jest/globals';
import { GitHubService } from '../../interfaces';
import { createMockContext } from '../mocks/prisma';
import { createMockGitHubUser } from '../utils/mock-factory';
import { createMockOctokit } from '../mocks/octokit';
import { ReviewStatus } from '@prisma/client';  // Add this import
import { 
  PullRequestWebhookPayload, 
  ReviewWebhookPayload,
  RepositoryWebhookPayload
} from '../../types';

describe('GitHubService Webhook Handling', () => {
  let service: GitHubService;
  let ctx = createMockContext();
  let mockOctokit = createMockOctokit();

  beforeEach(() => {
    ctx = createMockContext();
    mockOctokit = createMockOctokit();
    service = new GitHubService(
      ctx.prisma,
      mockOctokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
  });

  const mockUser = createMockGitHubUser();
  const baseRepository = {
    id: '123',
    name: 'test-repo',
    full_name: 'org/test-repo',
    private: false,
    html_url: 'https://github.com/org/test-repo',
    owner: {
      login: mockUser.login,
      avatar_url: mockUser.avatar_url
    }
  };

  describe('Pull Request Events', () => {
    const mockPayload: PullRequestWebhookPayload = {
      action: 'opened',
      pull_request: {
        number: 1,
        title: 'Test PR',
        body: '',
        state: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        merged_at: null,
        draft: false,
        mergeable: null,
        rebaseable: null,
        labels: [],
        user: {
          login: mockUser.login,
          avatar_url: mockUser.avatar_url
        }
      },
      repository: baseRepository
    };

    it('handles opened pull request', async () => {
      await service.handleWebhookEvent('pull_request', mockPayload);

      expect(ctx.prisma.pullRequest.upsert).toHaveBeenCalledWith({
        where: {
          repositoryId_number: {
            repositoryId: '123',
            number: 1,
          },
        },
        create: {
          number: 1,
          title: 'Test PR',
          status: 'OPEN',
          repositoryId: '123',
          authorId: mockUser.login,
          baseBranch: 'main',
          headBranch: 'feature',
          isDraft: false,
          isReady: true,
        },
        update: {
          title: 'Test PR',
          status: 'OPEN',
          isDraft: false,
          isReady: true,
        },
      });
    });

    it('handles closed pull request', async () => {
      const closedPayload: PullRequestWebhookPayload = {
        ...mockPayload,
        action: 'closed',
        pull_request: {
          ...mockPayload.pull_request,
          state: 'closed',
          merged_at: '2024-01-01T00:00:00Z',
          merged: true
        }
      };

      await service.handleWebhookEvent('pull_request', closedPayload);

      expect(ctx.prisma.pullRequest.update).toHaveBeenCalledWith({
        where: {
          repositoryId_number: {
            repositoryId: '123',
            number: 1,
          },
        },
        data: {
          status: 'MERGED',
          metadata: {
            mergedAt: '2024-01-01T00:00:00Z',
            merged: true,
          },
        },
      });
    });
  });

  describe('Review Events', () => {
    const mockPayload: ReviewWebhookPayload = {
      action: 'submitted',
      review: {
        id: 456,
        user: {
          login: mockUser.login,
          avatar_url: mockUser.avatar_url
        },
        body: 'LGTM',
        state: ReviewStatus.APPROVED,  // Use ReviewStatus enum
        submitted_at: '2024-01-01T00:00:00Z',
        commit_id: 'abc123'
      },
      pull_request: {
        number: 1,
        id: '789'
      },
      repository: baseRepository
    };

    it('handles submitted review', async () => {
      await service.handleWebhookEvent('pull_request_review', mockPayload);

      expect(ctx.prisma.review.create).toHaveBeenCalledWith({
        data: {
          pullRequestId: '789',
          reviewerId: mockUser.login,
          status: ReviewStatus.APPROVED,  // Use ReviewStatus enum
          body: 'LGTM',
          submittedAt: new Date('2024-01-01T00:00:00Z'),
        },
      });
    });

    it('handles dismissed review', async () => {
      const dismissedPayload: ReviewWebhookPayload = {
        ...mockPayload,
        action: 'dismissed',
        review: {
          ...mockPayload.review,
          state: ReviewStatus.DISMISSED,  // Use ReviewStatus enum
        }
      };

      await service.handleWebhookEvent('pull_request_review', dismissedPayload);

      expect(ctx.prisma.review.updateMany).toHaveBeenCalledWith({
        where: {
          pullRequestId: '789',
          reviewerId: mockUser.login,
          status: ReviewStatus.DISMISSED,  // Use ReviewStatus enum
        },
        data: {
          status: ReviewStatus.DISMISSED,  // Use ReviewStatus enum
        },
      });
    });
  });

  describe('Repository Events', () => {
    const mockPayload: RepositoryWebhookPayload = {
      action: 'created',
      repository: baseRepository
    };

    it('handles repository creation', async () => {
      await service.handleWebhookEvent('repository', mockPayload);

      expect(ctx.prisma.repository.create).toHaveBeenCalledWith({
        data: {
          name: 'test-repo',
          fullName: 'org/test-repo',
          private: false,
          url: 'https://github.com/org/test-repo',
          platformId: 'platform-1',
        },
      });
    });

    it('handles repository deletion', async () => {
      const deletedPayload: RepositoryWebhookPayload = {
        ...mockPayload,
        action: 'deleted',
      };

      await service.handleWebhookEvent('repository', deletedPayload);

      expect(ctx.prisma.repository.delete).toHaveBeenCalledWith({
        where: {
          fullName: 'org/test-repo',
        },
      });
    });

    it('handles repository visibility change', async () => {
      const privatizedPayload: RepositoryWebhookPayload = {
        ...mockPayload,
        action: 'privatized',
        repository: {
          ...baseRepository,
          private: true,
        }
      };

      await service.handleWebhookEvent('repository', privatizedPayload);

      expect(ctx.prisma.repository.update).toHaveBeenCalledWith({
        where: {
          fullName: 'org/test-repo',
        },
        data: {
          private: true,
        },
      });
    });
  });
});
