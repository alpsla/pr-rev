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
    console.log('Initializing PRValidator', { hasToken: !!githubToken });
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  async validatePR(url: string): Promise<void> {
    console.log('Validating PR URL:', url);
    const prInfo = PRValidator.parsePRUrl(url);
    if (!prInfo) {
      console.error('Failed to parse PR URL:', url);
      throw new PRValidationError('Invalid PR URL format');
    }

    try {
      console.log('Fetching PR data from GitHub', prInfo);
      const response = await this.octokit.pulls.get({
        owner: prInfo.owner,
        repo: prInfo.repo,
        pull_number: prInfo.number,
      });

      if (!response?.data) {
        console.error('No PR data returned from GitHub');
        throw new PRValidationError('Failed to get pull request data');
      }

      console.log('PR validation result', {
        state: response.data.state,
        merged: response.data.merged,
        mergeable: response.data.mergeable,
        rebaseable: response.data.rebaseable,
        commits: response.data.commits,
        additions: response.data.additions,
        deletions: response.data.deletions,
        changedFiles: response.data.changed_files
      });

      if (response.data.state !== 'open') {
        console.warn('PR is not open', { state: response.data.state });
        throw new PRValidationError('Pull request is not open');
      }
    } catch (error) {
      if (error instanceof PRValidationError) {
        throw error;
      }

      const octokitError = error as OctokitError;
      console.error('GitHub API error', {
        status: octokitError.status,
        message: octokitError.message,
        url
      });

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
    console.log('Parsing PR URL:', url);
    try {
      const urlObj = new URL(url);
      console.log('URL parts:', {
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        protocol: urlObj.protocol
      });

      if (urlObj.hostname !== 'github.com') {
        console.warn('Invalid hostname:', urlObj.hostname);
        return null;
      }

      const parts = urlObj.pathname.split('/');
      console.log('Path parts:', parts);

      if (parts.length !== 5 || parts[3] !== 'pull' || !parts[4]) {
        console.warn('Invalid path structure:', parts);
        return null;
      }

      const [, owner, repo, , prNumber] = parts;
      const number = parseInt(prNumber, 10);
      if (isNaN(number)) {
        console.warn('Invalid PR number:', prNumber);
        return null;
      }

      const result = { owner, repo, number };
      console.log('Successfully parsed PR URL:', result);
      return result;
    } catch (error) {
      console.error('Error parsing PR URL:', error);
      return null;
    }
  }
}
