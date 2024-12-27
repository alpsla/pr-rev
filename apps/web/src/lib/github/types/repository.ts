export type GitHubAccountType = 'User' | 'Organization';

export interface GitHubAccount {
  login: string;
  id: number;
  avatarUrl: string;
  type: GitHubAccountType;
}

export interface GitHubLicense {
  key: string;
  name: string;
  url: string | null;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  owner: GitHubAccount;
  description: string | null;
  fork: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  homepage: string | null;
  size: number;
  stargazersCount: number;
  watchersCount: number;
  language: string | null;
  forksCount: number;
  archived: boolean;
  disabled: boolean;
  openIssuesCount: number;
  license: GitHubLicense | undefined;
  allowForking: boolean | undefined;
  isTemplate: boolean | undefined;
  topics: string[] | undefined;
  visibility: string | undefined;
  defaultBranch: string;
}
