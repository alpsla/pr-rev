import { GitHubIntegrationService, GitHubPRReview } from './github-integration';
import { DiffAnalysis, GitHubPRFile, PRAnalysis, ImpactMetrics, AutomatedChecks } from '../types/pr-analysis';

export class GitHubPRAnalysisService extends GitHubIntegrationService {
  async analyzePR(owner: string, repo: string, prNumber: number): Promise<PRAnalysis> {
    const [prData, files, reviews] = await Promise.all([
      this.fetchPRData(owner, repo, prNumber),
      this.fetchPRFiles(owner, repo, prNumber),
      this.getPRReviews(owner, repo, prNumber)
    ]);

    if (!prData) {
      throw new Error('Failed to fetch PR data');
    }

    const diffAnalysis = this.analyzeDiff(files);
    const reviewHistory = this.analyzeReviews(reviews);
    const impactMetrics = this.calculateImpactMetrics(files);
    const automatedChecks = await this.getAutomatedChecks(owner, repo, prNumber);

    return {
      id: prData.id,
      number: prData.number,
      title: prData.title,
      body: prData.body,
      state: prData.state,
      createdAt: prData.created_at,
      updatedAt: prData.updated_at,
      closedAt: prData.closed_at,
      mergedAt: prData.merged_at,
      draft: prData.draft ?? false,
      user: prData.user,
      diffAnalysis,
      impactMetrics,
      reviewHistory,
      automatedChecks
    };
  }

  private analyzeDiff(files: GitHubPRFile[]): DiffAnalysis {
    const binaryFiles = files.filter(file => 
      !file.patch && file.changes === 0 && file.status !== 'renamed'
    ).length;

    const renamedFiles = files.filter(file => 
      file.status === 'renamed' && file.previous_filename
    ).length;

    return {
      filesChanged: files.length,
      additions: files.reduce((sum, file) => sum + file.additions, 0),
      deletions: files.reduce((sum, file) => sum + file.deletions, 0),
      changedFiles: files,
      binaryFiles,
      renamedFiles
    };
  }

  private calculateImpactMetrics(files: GitHubPRFile[]): ImpactMetrics {
    const totalChanges = files.reduce((sum, file) => sum + file.changes, 0);
    const testFiles = files.filter(file => file.filename.includes('test') || file.filename.includes('spec'));
    const docFiles = files.filter(file => file.filename.includes('docs') || file.filename.includes('README'));

    return {
      complexity: Math.min(10, Math.ceil(totalChanges / 100)),
      risk: Math.min(10, Math.ceil(files.length / 10)),
      testCoverage: testFiles.length > 0 ? 100 : 0,
      documentation: docFiles.length > 0 ? 100 : 0
    };
  }

  private async getAutomatedChecks(owner: string, repo: string, prNumber: number): Promise<AutomatedChecks> {
    try {
      // In a real implementation, this would fetch CI/CD results from GitHub Actions or other CI systems
      const { data: checks } = await this.octokit.checks.listForRef({
        owner,
        repo,
        ref: `refs/pull/${prNumber}/head`
      });

      const testResults = {
        passed: checks.check_runs?.filter(run => run.conclusion === 'success').length ?? 0,
        failed: checks.check_runs?.filter(run => run.conclusion === 'failure').length ?? 0,
        skipped: checks.check_runs?.filter(run => run.status === 'queued').length ?? 0,
        coverage: undefined
      };

      const lintingErrors = checks.check_runs?.filter(run => 
        run.name.toLowerCase().includes('lint') && run.conclusion === 'failure'
      ).length ?? 0;

      const securityIssues = checks.check_runs?.filter(run =>
        run.name.toLowerCase().includes('security') && run.conclusion === 'failure'
      ).length ?? 0;

      return {
        status: checks.check_runs?.every(run => run.conclusion === 'success') ? 'success' :
               checks.check_runs?.some(run => run.conclusion === 'failure') ? 'failure' :
               checks.check_runs?.some(run => run.status === 'in_progress') ? 'pending' : 'unknown',
        testResults,
        lintingErrors,
        securityIssues
      };
    } catch (error) {
      // Log error for debugging
      console.error('Failed to fetch automated checks:', error);
      
      // Return default values if checks API fails
      return {
        status: 'unknown',
        testResults: {
          passed: 0,
          failed: 0,
          skipped: 0
        },
        lintingErrors: 0,
        securityIssues: 0
      };
    }
  }

  private async fetchPRData(owner: string, repo: string, prNumber: number) {
    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber
    });
    return data;
  }

  private async fetchPRFiles(owner: string, repo: string, prNumber: number): Promise<GitHubPRFile[]> {
    const { data } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber
    });
    return data as GitHubPRFile[];
  }

  private analyzeReviews(reviews: GitHubPRReview[]) {
    const approvalCount = reviews.filter(review => review.state === 'APPROVED').length;
    const changesRequestedCount = reviews.filter(review => review.state === 'CHANGES_REQUESTED').length;
    const reviewers = Array.from(new Set(reviews.map(review => review.user?.login).filter(Boolean) as string[]));

    return {
      approvalCount,
      changesRequestedCount,
      reviewers,
      reviews
    };
  }
}
