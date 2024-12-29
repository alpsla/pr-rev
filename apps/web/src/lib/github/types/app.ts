export type GitHubAccountType = 'User' | 'Organization';

export interface GitHubAccount {
  login: string;
  id: number;
  avatar_url: string;
  type: GitHubAccountType;
}

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  clientId: string;
  clientSecret: string;
}

export interface InstallationTokenResponse {
  token: string;
  expires_at: string;
  permissions: Record<string, 'read' | 'write' | 'admin'>;
  repository_selection: 'all' | 'selected';
}

export interface GitHubInstallation {
  id: number;
  account: GitHubAccount;
  app_id: number;
  target_type: GitHubAccountType;
  permissions: Record<string, 'read' | 'write' | 'admin'>;
  events: string[];
  repository_selection: 'all' | 'selected';
  created_at: string;
  updated_at: string;
  single_file_name: string | null;
}
