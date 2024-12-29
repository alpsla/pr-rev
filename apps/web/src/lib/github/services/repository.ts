import { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import type { GitHubRepository, GitHubAccountType } from '../types/repository';

type OctokitRepository = RestEndpointMethodTypes['repos']['get']['response']['data'];

export class GitHubRepositoryService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
      log: {
        debug: (msg: string) => console.debug(`[GitHubRepo] ${msg}`),
        info: (msg: string) => console.info(`[GitHubRepo] ${msg}`),
        warn: (msg: string) => console.warn(`[GitHubRepo] ${msg}`),
        error: (msg: string) => console.error(`[GitHubRepo] ${msg}`)
      }
    });
  }

  /**
   * Get details for a specific repository
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      console.log(`[GitHubRepo] Getting repository: ${owner}/${repo}`);
      const response = await this.octokit.repos.get({
        owner,
        repo
      });

      return this.convertRepository(response.data);
    } catch (error) {
      console.error('[GitHubRepo] Error getting repository:', error);
      throw new Error('Failed to get repository');
    }
  }

  /**
   * List repositories for a user or organization
   */
  async listRepositories(owner: string, type: GitHubAccountType): Promise<GitHubRepository[]> {
    try {
      console.log(`[GitHubRepo] Listing repositories for ${type} ${owner}`);
      
      const response = type === 'Organization'
        ? await this.octokit.repos.listForOrg({
            org: owner,
            per_page: 100
          })
        : await this.octokit.repos.listForUser({
            username: owner,
            per_page: 100
          });

      return response.data.map(repo => this.convertRepository(repo));
    } catch (error) {
      console.error('[GitHubRepo] Error listing repositories:', error);
      throw new Error('Failed to list repositories');
    }
  }

  /**
   * Convert Octokit repository to our GitHubRepository type
   */
  private convertRepository(repository: OctokitRepository): GitHubRepository {
    return {
      id: repository.id,
      name: repository.name,
      fullName: repository.full_name,
      private: repository.private,
      owner: {
        login: repository.owner.login,
        id: repository.owner.id,
        avatarUrl: repository.owner.avatar_url,
        type: repository.owner.type as GitHubAccountType
      },
      description: repository.description,
      fork: repository.fork,
      createdAt: repository.created_at,
      updatedAt: repository.updated_at,
      pushedAt: repository.pushed_at,
      homepage: repository.homepage,
      size: repository.size,
      stargazersCount: repository.stargazers_count,
      watchersCount: repository.watchers_count,
      language: repository.language,
      forksCount: repository.forks_count,
      archived: repository.archived,
      disabled: repository.disabled,
      openIssuesCount: repository.open_issues_count,
      license: repository.license ? {
        key: repository.license.key,
        name: repository.license.name,
        url: repository.license.url
      } : undefined,
      allowForking: repository.allow_forking,
      isTemplate: repository.is_template,
      topics: repository.topics,
      visibility: repository.visibility,
      defaultBranch: repository.default_branch
    };
  }
}
