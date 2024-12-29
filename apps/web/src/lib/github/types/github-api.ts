import { GitHubUser } from '../services/github-integration';

export interface GitHubCheckRun {
  id: number;
  name: string;
  head_sha: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required';
  started_at: string;
  completed_at?: string;
  output?: {
    title: string;
    summary: string;
    text?: string;
    annotations_count?: number;
    annotations_url?: string;
    annotations?: Array<{
      path: string;
      start_line: number;
      end_line: number;
      start_column?: number;
      end_column?: number;
      annotation_level: 'notice' | 'warning' | 'failure';
      message: string;
      title?: string;
      raw_details?: string;
    }>;
  };
  url: string;
  html_url: string;
  pull_requests: Array<{
    url: string;
    id: number;
    number: number;
    head: {
      ref: string;
      sha: string;
      repo: {
        id: number;
        name: string;
      };
    };
    base: {
      ref: string;
      sha: string;
      repo: {
        id: number;
        name: string;
      };
    };
  }>;
}

export interface GitHubCheckResponse {
  total_count: number;
  check_runs: GitHubCheckRun[];
}

export interface GitHubPullRequestResponse {
  url: string;
  id: number;
  node_id: string;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: GitHubUser | null;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  additions: number;
  deletions: number;
  changed_files: number;
}
