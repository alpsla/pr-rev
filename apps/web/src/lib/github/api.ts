import { PrismaClient } from '@prisma/client';
import { Octokit } from '@octokit/rest';
import { GitHubService, GitHubAuthConfig, IGitHubService } from './interfaces';

// Re-export the implementation class for both type and value usage
export { GitHubService };

// Export additional types
export type { GitHubAuthConfig };

export function createGitHubService(
  prisma: PrismaClient,
  config: GitHubAuthConfig
): IGitHubService {
  const octokit = new Octokit({
    auth: config.credentials.token,
  });

  return new GitHubService(prisma, octokit, config);
}
