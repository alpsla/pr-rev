import { describe, expect, beforeEach, test } from '@jest/globals';
import { GitHubService } from '../api';
import { 
  createMockContext, 
  createMockGitHubUser, 
  createMockPlatform 
} from './utils/mock-factory';
import { 
  PullRequestWebhookPayload,
  PullRequestReviewWebhookPayload,
  RepositoryWebhookPayload,
  WebhookEventPayload
} from './utils/mock-types';
import { ReviewStatus } from '@prisma/client';

describe('GitHubService', () => {
  let service: GitHubService;
  let ctx = createMockContext();

  beforeEach(() => {
    ctx = createMockContext();
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
    ctx.prisma.platform.findFirstOrThrow.mockResolvedValue(createMockPlatform());
  });

  describe('Webhook Event Handling', () => {
    describe('Pull Request Events', () => {
      // Create a complete mock user using the utility function
      const mockUser = createMockGitHubUser({
        id: 1,
        login: 'testuser'
      });
      
      const mockPayload: PullRequestWebhookPayload = {
        action: 'opened',
        pull_request: {
          number: 1,
          title: 'Test PR',
          state: 'open',
          user: createMockGitHubUser(),  // This will now be correctly typed
          head: {
            ref: 'feature',
            sha: 'abc123',
          },
          base: {
            ref: 'main',
          },
          draft: false,
        },
        repository: {
          id: '123',
          name: 'test-repo',
          full_name: 'org/test-repo',
          owner: createMockGitHubUser()  // This will now be correctly typed
        }
      };
      test('handles opened pull request', async () => {
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
    
      test('handles closed pull request', async () => {
        const closedPayload: PullRequestWebhookPayload = {
          ...mockPayload,
          action: 'closed',
          pull_request: {
            ...mockPayload.pull_request,
            state: 'closed',
            merged: true,
            merged_at: '2024-01-01T00:00:00Z',
          },
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
      const mockUser = createMockGitHubUser({
        login: 'reviewer'
      });

      const baseReviewPayload: PullRequestReviewWebhookPayload = {
        action: 'submitted',
        review: {
          id: 1,
          state: 'approved',
          body: 'LGTM',
          user: mockUser,
          submitted_at: '2024-01-01T00:00:00Z',
          commit_id: 'abc123'
        },
        pull_request: {
          id: 'pr123',
          number: 1,
          state: 'open',
          user: createMockGitHubUser()
        },
        repository: {
          id: '123',
          name: 'test-repo',
          full_name: 'org/test-repo',
          owner: createMockGitHubUser()
        }
      };

      test('handles submitted review', async () => {
        await service.handleWebhookEvent('pull_request_review', baseReviewPayload);
    
        expect(ctx.prisma.review.create).toHaveBeenCalledWith({
          data: {
            pullRequestId: 'pr123',
            reviewerId: 'reviewer',
            status: ReviewStatus.APPROVED,
            body: 'LGTM',
            submittedAt: expect.any(Date)
          }
        });
      });
    
      test('handles dismissed review', async () => {
        const dismissedPayload: PullRequestReviewWebhookPayload = {
          ...baseReviewPayload,
          action: 'dismissed',
          review: {
            ...baseReviewPayload.review,
            state: 'dismissed',
            body: null
          }
        };
    
        await service.handleWebhookEvent('pull_request_review', dismissedPayload);
    
        expect(ctx.prisma.review.updateMany).toHaveBeenCalledWith({
          where: {
            pullRequestId: 'pr123',
            reviewerId: 'reviewer'
          },
          data: {
            status: ReviewStatus.DISMISSED
          }
        });
      });
    });

    describe('Repository Events', () => {
      const mockUser = createMockGitHubUser({
        id: 1,
        login: 'testuser'
      });
    
      const mockPayload: RepositoryWebhookPayload = {
        action: 'created',
        repository: {
          id: '123',
          name: 'test-repo',
          full_name: 'org/test-repo',
          private: false,
          html_url: 'https://github.com/org/test-repo',
          owner: mockUser
        }
      };
    
      test('handles repository creation', async () => {
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
    
      test('handles repository deletion', async () => {
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
    
      test('handles repository visibility change', async () => {
        const privatizedPayload: RepositoryWebhookPayload = {
          ...mockPayload,
          action: 'privatized',
          repository: {
            ...mockPayload.repository,
            private: true,
          },
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
    
      test('handles invalid repository action', async () => {
        const invalidPayload = {
          ...mockPayload,
          action: 'invalid_action'
        } as unknown as WebhookEventPayload;
    
        await expect(service.handleWebhookEvent('repository', invalidPayload))
          .rejects
          .toThrow('Unsupported repository action: invalid_action');
      });
    
      test('handles missing repository data', async () => {
        const invalidPayload = {
          action: 'created',
          repository: undefined
        } as unknown as WebhookEventPayload;
    
        await expect(service.handleWebhookEvent('repository', invalidPayload))
          .rejects
          .toThrow('Invalid repository data');
      });
    });
  });
});