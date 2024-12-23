// src/lib/github/types/pullRequest.ts
import { BaseEntity } from './common';
import { RepositoryOwner } from './repository';

export interface PullRequest extends BaseEntity {
  number: number;
  state: PullRequestState;
  locked: boolean;
  title: string;
  user: RepositoryOwner;
  body: string | null;
  
  // Labels & Reviewers
  labels: PullRequestLabel[];
  requested_reviewers: RepositoryOwner[];
  requested_teams: TeamDetails[];
  
  // Branches & Commits
  head: PullRequestBranch;
  base: PullRequestBranch;
  merge_commit_sha: string | null;
  
  // Status
  draft: boolean;
  merged: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  mergeable_state: MergeableState;
  
  // URLs
  html_url: string;
  diff_url: string;
  patch_url: string;
  
  // Timestamps
  closed_at: string | null;
  merged_at: string | null;
  
  // Statistics
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export type PullRequestState = 'open' | 'closed';
export type MergeableState = 'clean' | 'dirty' | 'blocked' | 'behind' | 'unknown';

export interface PullRequestLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface PullRequestBranch {
  label: string;
  ref: string;
  sha: string;
  user: RepositoryOwner;
  repo: {
    id: number;
    name: string;
    url: string;
  };
}

export interface TeamDetails {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  privacy: 'secret' | 'closed';
  permission: 'pull' | 'push' | 'admin';
}