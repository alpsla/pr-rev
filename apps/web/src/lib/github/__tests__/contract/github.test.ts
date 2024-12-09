import { Octokit } from '@octokit/rest';
import type { GitHubError } from '../../types';

describe('GitHub API Contract Tests', () => {
  let octokit: Octokit;
  
  const TEST_REPO_OWNER = 'test-owner';
  const TEST_REPO_NAME = 'test-repo';
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  beforeAll(() => {
    octokit = new Octokit({
      auth: GITHUB_TOKEN
    });
  });

  describe('Repository Contract', () => {
    it('should match expected repository structure', async () => {
      const response = await octokit.repos.get({
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME
      });

      // Verify response matches our expected structure
      const repo = response.data;
      expect(repo).toEqual(expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        full_name: expect.any(String),
        private: expect.any(Boolean),
        description: expect.any(String),
        default_branch: expect.any(String),
        language: expect.any(String) || null,
        stargazers_count: expect.any(Number),
        forks_count: expect.any(Number),
        archived: expect.any(Boolean),
        disabled: expect.any(Boolean),
        visibility: expect.any(String),
        permissions: expect.objectContaining({
          admin: expect.any(Boolean),
          push: expect.any(Boolean),
          pull: expect.any(Boolean)
        })
      }));
    });
  });

  describe('Pull Request Contract', () => {
    it('should match expected pull request structure', async () => {
      const response = await octokit.pulls.get({
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME,
        pull_number: 1
      });

      const pr = response.data;
      expect(pr).toEqual(expect.objectContaining({
        number: expect.any(Number),
        title: expect.any(String),
        body: expect.any(String) || null,
        state: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
        merged_at: expect.any(String) || null,
        draft: expect.any(Boolean),
        mergeable: expect.any(Boolean) || null,
        rebaseable: expect.any(Boolean) || null,
        mergeable_state: expect.any(String)
      }));
    });
  });

  describe('Review Contract', () => {
    it('should match expected review structure', async () => {
      const response = await octokit.pulls.listReviews({
        owner: TEST_REPO_OWNER,
        repo: TEST_REPO_NAME,
        pull_number: 1
      });

      // Verify each review matches expected structure
      response.data.forEach(review => {
        expect(review).toEqual(expect.objectContaining({
          id: expect.any(Number),
          user: review.user ? expect.objectContaining({
            login: expect.any(String),
            avatar_url: expect.any(String)
          }) : null,
          body: expect.any(String) || null,
          state: expect.stringMatching(/^(PENDING|COMMENTED|APPROVED|CHANGES_REQUESTED|DISMISSED)$/),
          commit_id: expect.any(String),
          submitted_at: expect.any(String) || null
        }));
      });
    });
  });

  describe('Error Contracts', () => {
    it('should return expected error format for non-existent repository', async () => {
      try {
        await octokit.repos.get({
          owner: TEST_REPO_OWNER,
          repo: 'non-existent-repo'
        });
        fail('Expected request to fail');
      } catch (error) {
        const githubError = error as GitHubError;
        expect(githubError).toMatchObject({
          status: 404,
          message: expect.any(String)
        });
      }
    });

    it('should return expected error format for invalid authentication', async () => {
      const invalidOctokit = new Octokit({
        auth: 'invalid-token'
      });

      try {
        await invalidOctokit.repos.get({
          owner: TEST_REPO_OWNER,
          repo: TEST_REPO_NAME
        });
        fail('Expected request to fail');
      } catch (error) {
        const githubError = error as GitHubError;
        expect(githubError).toMatchObject({
          status: 401,
          message: expect.any(String)
        });
      }
    });

    it('should return expected error format for rate limit exceeded', async () => {
      // Make many requests to trigger rate limit
      const requests = Array(100).fill(null).map(() => 
        octokit.repos.get({
          owner: TEST_REPO_OWNER,
          repo: TEST_REPO_NAME
        })
      );

      try {
        await Promise.all(requests);
      } catch (error) {
        const githubError = error as GitHubError;
        // Only verify error if we actually hit the rate limit
        if (githubError.status === 403 && githubError.message.includes('API rate limit exceeded')) {
          expect(githubError).toMatchObject({
            status: 403,
            message: expect.stringContaining('API rate limit exceeded')
          });
        }
      }
    });
  });
});
