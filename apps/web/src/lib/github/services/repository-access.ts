import { Octokit } from '@octokit/rest';

type GetRepoError = { status: number };

export class RepositoryAccessService {
  private octokit: Octokit;

  constructor(token?: string) {
    console.log('Initializing RepositoryAccessService', { hasToken: !!token });
    this.octokit = new Octokit({
      auth: token,
    });
  }

  /**
   * Checks if a repository is accessible with the current authentication state
   * @returns true if repository is accessible, false if not
   */
  async isRepositoryAccessible(owner: string, repo: string): Promise<boolean> {
    console.log('Checking repository accessibility', { owner, repo });
    try {
      const response = await this.octokit.repos.get({ owner, repo });
      console.log('Repository access check result', {
        status: response.status,
        isPrivate: response.data.private,
        hasAdminAccess: response.data.permissions?.admin,
        hasPushAccess: response.data.permissions?.push,
        hasPullAccess: response.data.permissions?.pull
      });
      return true;
    } catch (error) {
      if (this.isGitHubError(error)) {
        console.log('Repository access check failed', {
          status: error.status,
          owner,
          repo
        });
        if (error.status === 404 || error.status === 401 || error.status === 403) {
          return false;
        }
      }
      console.error('Unexpected error checking repository access', error);
      throw error; // Re-throw unexpected errors
    }
  }

  /**
   * Checks if a repository is public
   * Uses unauthenticated request to determine if repo is publicly accessible
   */
  async isRepositoryPublic(owner: string, repo: string): Promise<boolean> {
    console.log('Checking if repository is public', { owner, repo });
    const publicOctokit = new Octokit(); // No auth token = public access
    try {
      const response = await publicOctokit.repos.get({ owner, repo });
      const isPublic = !response.data.private;
      console.log('Repository visibility check result', {
        owner,
        repo,
        isPublic,
        status: response.status
      });
      return isPublic;
    } catch (error) {
      if (this.isGitHubError(error)) {
        console.log('Repository visibility check failed', {
          status: error.status,
          owner,
          repo
        });
        if (error.status === 404) {
          return false; // Repo is private or doesn't exist
        }
      }
      console.error('Unexpected error checking repository visibility', error);
      throw error; // Re-throw unexpected errors
    }
  }

  private isGitHubError(error: unknown): error is GetRepoError {
    return typeof error === 'object' && error !== null && 'status' in error;
  }
}
