export interface GitHubRepositoryData {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  language: string | null;
  topics: string[] | null;
  visibility: 'public' | 'private' | 'internal';
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  archived: boolean;
  disabled: boolean;
  hasIssues: boolean;
  hasProjects: boolean;
  hasWiki: boolean;
  hasPages: boolean;
  hasDownloads: boolean;
  allowForking: boolean;
  isTemplate: boolean;
  webCommitSignoffRequired: boolean;
  license: {
    key: string;
    name: string;
    spdxId: string | null;
    url: string | null;
  } | null;
}
