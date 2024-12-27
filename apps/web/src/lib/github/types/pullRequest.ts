import { BaseEntity } from './common';
import { RepositoryOwner } from './repository';

export interface PullRequest extends BaseEntity {
  number: number;
  state: 'open' | 'closed';
  title: string;
  user: RepositoryOwner;
  body: string | null;
  html_url: string;
  diff_url: string;
  patch_url: string;
  merged: boolean;
  mergeable: boolean | null;
  mergeable_state: string;
  merged_by: RepositoryOwner | null;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  head: {
    ref: string;
    sha: string;
    repo: {
      id: number;
      name: string;
      full_name: string;
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      id: number;
      name: string;
      full_name: string;
    };
  };
}
