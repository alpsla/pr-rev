import { describe, expect, beforeEach, test } from '@jest/globals';
import { GitHubService } from '../api';
import { createMockContext, createMockGitHubUser } from './utils/mock-factory';

describe('GitHubService', () => {
  let service: InstanceType<typeof GitHubService>;
  let ctx = createMockContext();

  beforeEach(() => {
    ctx = createMockContext();
    service = new GitHubService(
      ctx.prisma,
      ctx.octokit,
      { type: 'token', credentials: { token: 'test-token' } }
    );
  });

  describe('Webhook Event Handling', () => {
    describe('Pull Request Events', () => {
      const mockUser = createMockGitHubUser();
      const mockPayload = {
        action: 'opened',
        pull_request: {
          number: 1,
          title: 'Test PR',
          state: 'open',
          user: mockUser,
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
          owner: mockUser,
        },
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
            authorId: mockUser.id.toString(),
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
        const closedPayload = {
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
      const mockUser = createMockGitHubUser();
      const mockPayload = {
        action: 'submitted',
        review: {
          id: '456',
          user: mockUser,
          body: 'LGTM',
          state: 'APPROVED',
          submitted_at: '2024-01-01T00:00:00Z',
        },
        pull_request: {
          id: '789',
          number: 1,
          user: mockUser,
        },
        repository: {
          id: '123',
          name: 'test-repo',
          full_name: 'org/test-repo',
          owner: mockUser,
        },
      };

      test('handles submitted review', async () => {
        await service.handleWebhookEvent('pull_request_review', mockPayload);

        expect(ctx.prisma.review.create).toHaveBeenCalledWith({
          data: {
            pullRequestId: '789',
            reviewerId: mockUser.id.toString(),
            status: 'APPROVED',
            body: 'LGTM',
            submittedAt: new Date('2024-01-01T00:00:00Z'),
          },
        });
      });

      test('handles dismissed review', async () => {
        const dismissedPayload = {
          ...mockPayload,
          action: 'dismissed',
          review: {
            ...mockPayload.review,
            state: 'DISMISSED',
          },
        };

        await service.handleWebhookEvent('pull_request_review', dismissedPayload);

        expect(ctx.prisma.review.updateMany).toHaveBeenCalledWith({
          where: {
            pullRequestId: '789',
            reviewerId: mockUser.id.toString(),
            status: 'DISMISSED',
          },
          data: {
            status: 'DISMISSED',
          },
        });
      });
    });

    describe('Repository Events', () => {
      const mockUser = createMockGitHubUser();
      const mockPayload = {
        action: 'created',
        repository: {
          id: '123',
          name: 'test-repo',
          full_name: 'org/test-repo',
          private: false,
          html_url: 'https://github.com/org/test-repo',
          owner: mockUser,
        },
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
        const deletedPayload = {
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
        const privatizedPayload = {
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
    });
  });
});
