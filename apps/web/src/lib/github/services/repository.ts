import { Octokit } from "@octokit/rest";

export class GitHubRepositoryService {
  private octokit: Octokit;

  constructor(token?: string) {
    console.log('[GitHubRepo] Creating service:', { hasToken: !!token });
    this.octokit = new Octokit({
      auth: token,
      headers: {
        accept: 'application/vnd.github.v3+json',
        ...(token && { authorization: `token ${token}` })
      }
    });
  }

  async getRepository(owner: string, repo: string) {
    console.log('[GitHubRepo] Getting repository:', `${owner}/${repo}`);
    console.log('[GitHubRepo] Using auth token:', !!this.octokit.auth);

    try {
      console.log('[GitHubRepo] Making request');
      const response = await this.octokit.repos.get({
        owner,
        repo,
        headers: {
          accept: 'application/vnd.github.v3+json'
        }
      });
      console.log('[GitHubRepo] GET /repos/:owner/:repo - success');
      return response.data;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        const octokitError = error as { status: number; response?: { headers: Record<string, string> } };
        console.log(`[GitHubRepo] GET /repos/${owner}/${repo} - ${octokitError.status} in ${octokitError.response?.headers['x-github-request-id']}`);
      }
      console.log('[GitHubRepo] Error getting repository:', error);
      throw new Error('Failed to get repository');
    }
  }

  async isPrivate(owner: string, repo: string): Promise<boolean> {
    try {
      const repository = await this.getRepository(owner, repo);
      return repository.private;
    } catch (error) {
      // If we get a 404, the repo is either private or doesn't exist
      // In either case, we treat it as private since it requires auth
      if (error && typeof error === 'object' && 'status' in error) {
        const octokitError = error as { status: number };
        if (octokitError.status === 404) {
          return true;
        }
      }
      throw error;
    }
  }
}
