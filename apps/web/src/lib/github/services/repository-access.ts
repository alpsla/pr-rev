import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth-options";
import { GitHubRepositoryService } from "./repository";

export class RepositoryAccessService {
  private githubToken?: string;
  private hasPrivateAccess: boolean;

  private constructor(githubToken: string | null | undefined, hasPrivateAccess: boolean = false) {
    // Convert null to undefined for consistency
    this.githubToken = githubToken ?? undefined;
    this.hasPrivateAccess = hasPrivateAccess;
  }

  static async fromSession(): Promise<RepositoryAccessService> {
    const session = await getServerSession(authOptions);
    return new RepositoryAccessService(
      session?.user?.githubToken,
      session?.user?.hasPrivateAccess ?? false
    );
  }

  async isRepositoryPublic(owner: string, repo: string): Promise<boolean> {
    try {
      const repoService = new GitHubRepositoryService(this.githubToken);
      const repository = await repoService.getRepository(owner, repo);

      console.log('Repository visibility check:', {
        owner,
        repo,
        hasToken: !!this.githubToken,
        hasPrivateAccess: this.hasPrivateAccess,
        isPrivate: repository.private
      });

      return !repository.private;
    } catch (error) {
      console.log('Repository is not publicly accessible:', {
        owner,
        repo,
        error
      });
      return false;
    }
  }

  async hasRepositoryAccess(owner: string, repo: string): Promise<boolean> {
    try {
      // If we don't have a token or private access scope, we can't access private repos
      if (!this.githubToken || !this.hasPrivateAccess) {
        console.log('No GitHub token or private access:', {
          hasToken: !!this.githubToken,
          hasPrivateAccess: this.hasPrivateAccess
        });
        return false;
      }

      const repoService = new GitHubRepositoryService(this.githubToken);
      const repository = await repoService.getRepository(owner, repo);

      console.log('Repository access check:', {
        owner,
        repo,
        hasToken: !!this.githubToken,
        hasPrivateAccess: this.hasPrivateAccess,
        isPrivate: repository.private
      });

      return true;
    } catch (error) {
      console.log('No access to repository:', {
        owner,
        repo,
        error
      });
      return false;
    }
  }
}
