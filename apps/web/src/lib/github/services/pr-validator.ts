import { Octokit } from '@octokit/rest';

export class PRValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PRValidationError';
  }
}

interface PRInfo {
  owner: string;
  repo: string;
  number: number;
}

interface OctokitError {
  status: number;
  message: string;
}

export class PRValidator {
  private octokit: Octokit;

  constructor(githubToken: string) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  async validatePR(url: string): Promise<void> {
    const prInfo = PRValidator.parsePRUrl(url);
    if (!prInfo) {
      throw new PRValidationError('Invalid PR URL format');
    }

    try {
      const response = await this.octokit.pulls.get({
        owner: prInfo.owner,
        repo: prInfo.repo,
        pull_number: prInfo.number,
      });

      if (!response?.data) {
        throw new PRValidationError('Failed to get pull request data');
      }

      if (response.data.state !== 'open') {
        throw new PRValidationError('Pull request is not open');
      }
    } catch (error) {
      if (error instanceof PRValidationError) {
        throw error;
      }

      const octokitError = error as OctokitError;
      if ('status' in octokitError) {
        if (octokitError.status === 401) {
          throw new PRValidationError('Invalid GitHub token');
        } else if (octokitError.status === 403) {
          throw new PRValidationError('Rate limit exceeded or access denied');
        } else if (octokitError.status === 404) {
          throw new PRValidationError('Pull request or repository not found');
        }
      }

      throw new PRValidationError('Failed to validate PR');
    }
  }

  static parsePRUrl(url: string): PRInfo | null {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== 'github.com') {
        return null;
      }

      const parts = urlObj.pathname.split('/');
      if (parts.length !== 5 || parts[3] !== 'pull' || !parts[4]) {
        return null;
      }

      const [, owner, repo, , prNumber] = parts;
      const number = parseInt(prNumber, 10);
      if (isNaN(number)) {
        return null;
      }

      return { owner, repo, number };
    } catch {
      return null;
    }
  }
}
