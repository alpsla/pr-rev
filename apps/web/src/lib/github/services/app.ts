import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/rest';
import { GitHubAppConfig, GitHubInstallation, InstallationTokenResponse, GitHubAccountType } from '../types/app';

type OctokitInstallation = RestEndpointMethodTypes['apps']['getInstallation']['response']['data'];

interface GitHubAccountResponse {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  type: 'User' | 'Organization';
  name?: string | null;
  email?: string | null;
}

export class GitHubAppService {
  private config: GitHubAppConfig;
  private octokit: Octokit;

  constructor(config: GitHubAppConfig) {
    this.config = config;
    
    // Initialize Octokit with App authentication
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: this.config.appId,
        privateKey: this.config.privateKey,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      },
      log: {
        debug: (msg: string) => console.debug(`[GitHubApp] ${msg}`),
        info: (msg: string) => console.info(`[GitHubApp] ${msg}`),
        warn: (msg: string) => console.warn(`[GitHubApp] ${msg}`),
        error: (msg: string) => console.error(`[GitHubApp] ${msg}`),
      }
    });
  }

  /**
   * Get an installation access token for a specific installation
   */
  async getInstallationToken(installationId: number): Promise<InstallationTokenResponse> {
    try {
      console.log(`[GitHubApp] Getting installation token for ID: ${installationId}`);
      const response = await this.octokit.apps.createInstallationAccessToken({
        installation_id: installationId,
      });

      const token = response.data;
      console.log(`[GitHubApp] Got installation token, expires: ${token.expires_at}`);

      return {
        token: token.token,
        expires_at: token.expires_at,
        permissions: token.permissions as Record<string, 'read' | 'write' | 'admin'>,
        repository_selection: token.repository_selection || 'all',
      };
    } catch (error) {
      console.error('[GitHubApp] Error getting installation token:', error);
      throw new Error('Failed to get installation token');
    }
  }

  /**
   * Get all installations for the GitHub App
   */
  async getInstallations(): Promise<GitHubInstallation[]> {
    try {
      console.log('[GitHubApp] Fetching all installations');
      const response = await this.octokit.apps.listInstallations();
      
      return response.data.map(installation => this.convertInstallation(installation));
    } catch (error) {
      console.error('[GitHubApp] Error getting installations:', error);
      throw new Error('Failed to get installations');
    }
  }

  /**
   * Get a specific installation
   */
  async getInstallation(installationId: number): Promise<GitHubInstallation> {
    try {
      console.log(`[GitHubApp] Getting installation: ${installationId}`);
      const response = await this.octokit.apps.getInstallation({
        installation_id: installationId,
      });

      return this.convertInstallation(response.data);
    } catch (error) {
      console.error('[GitHubApp] Error getting installation:', error);
      throw new Error('Failed to get installation');
    }
  }

  /**
   * Get installation for a specific repository
   */
  async getRepositoryInstallation(owner: string, repo: string): Promise<GitHubInstallation> {
    try {
      console.log(`[GitHubApp] Getting installation for repo: ${owner}/${repo}`);
      const response = await this.octokit.apps.getRepoInstallation({
        owner,
        repo,
      });

      return this.convertInstallation(response.data);
    } catch (error) {
      console.error('[GitHubApp] Error getting repository installation:', error);
      throw new Error('Failed to get repository installation');
    }
  }

  /**
   * Create an Octokit instance authenticated with an installation token
   */
  async createInstallationClient(installationId: number): Promise<Octokit> {
    try {
      console.log(`[GitHubApp] Creating installation client for ID: ${installationId}`);
      const { token } = await this.getInstallationToken(installationId);
      return new Octokit({
        auth: token,
        log: {
          debug: (msg: string) => console.debug(`[GitHubApp:${installationId}] ${msg}`),
          info: (msg: string) => console.info(`[GitHubApp:${installationId}] ${msg}`),
          warn: (msg: string) => console.warn(`[GitHubApp:${installationId}] ${msg}`),
          error: (msg: string) => console.error(`[GitHubApp:${installationId}] ${msg}`),
        }
      });
    } catch (error) {
      console.error('[GitHubApp] Error creating installation client:', error);
      throw new Error('Failed to create installation client');
    }
  }

  /**
   * Get the app's public page URL
   */
  getAppUrl(): string {
    return `https://github.com/apps/${this.config.appId}`;
  }

  /**
   * Get the app's installation URL
   */
  getInstallUrl(state?: string): string {
    const url = new URL(`https://github.com/apps/${this.config.appId}/installations/new`);
    if (state) {
      url.searchParams.set('state', state);
    }
    return url.toString();
  }

  /**
   * Convert Octokit installation to our GitHubInstallation type
   */
  private convertInstallation(installation: OctokitInstallation): GitHubInstallation {
    if (!installation.account) {
      throw new Error('Installation account is missing');
    }

    const account = installation.account as GitHubAccountResponse;

    // Determine account type
    const accountType = this.getAccountType(account.type);
    const targetType = this.getAccountType(installation.target_type);

    return {
      id: installation.id,
      account: {
        login: account.login,
        id: account.id,
        avatar_url: account.avatar_url,
        type: accountType
      },
      app_id: installation.app_id,
      target_type: targetType,
      permissions: installation.permissions as Record<string, 'read' | 'write' | 'admin'>,
      events: installation.events,
      repository_selection: installation.repository_selection || 'all',
      created_at: installation.created_at,
      updated_at: installation.updated_at,
      single_file_name: installation.single_file_name
    };
  }

  /**
   * Helper to determine account type
   */
  private getAccountType(type: unknown): GitHubAccountType {
    if (typeof type === 'string' && type.toLowerCase() === 'organization') {
      return 'Organization';
    }
    return 'User';
  }
}
