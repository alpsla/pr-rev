import { NextResponse } from 'next/server';
import { GitHubAnalysisPipelineService } from '@/lib/github/services/analysis-pipeline';
import { getServerSession } from 'next-auth';
import { PullRequest } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { owner, repo, prNumber } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Repository owner and name are required' },
        { status: 400 }
      );
    }

    // Get GitHub token from session or environment
    const githubToken = process.env.GITHUB_TOKEN || session.accessToken;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token not found' },
        { status: 401 }
      );
    }

    const pipeline = new GitHubAnalysisPipelineService(githubToken);

    try {
      // Analyze repository
      const repository = await pipeline.analyzeRepository(owner, repo);

      // If PR number is provided, analyze PR
      let pullRequest: PullRequest | null = null;
      if (prNumber && typeof prNumber === 'number') {
        pullRequest = await pipeline.analyzePR(
          owner,
          repo,
          prNumber,
          session.user.id
        );
      }

      // Generate reports
      const repoReport = await pipeline.generateRepositoryReport(repository.id);
      const prReport = pullRequest 
        ? await pipeline.generatePRReport(pullRequest.id)
        : null;

      return NextResponse.json({
        repository,
        pullRequest,
        reports: {
          repository: repoReport,
          pullRequest: prReport
        }
      });
    } finally {
      await pipeline.close();
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze repository' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repositoryId = searchParams.get('repositoryId');
  const prId = searchParams.get('prId');

  if (!repositoryId && !prId) {
    return NextResponse.json(
      { error: 'Repository ID or PR ID is required' },
      { status: 400 }
    );
  }

  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const githubToken = process.env.GITHUB_TOKEN || session.accessToken;
  if (!githubToken) {
    return NextResponse.json(
      { error: 'GitHub token not found' },
      { status: 401 }
    );
  }

  const pipeline = new GitHubAnalysisPipelineService(githubToken);

  try {
    const result: { repositoryReport?: string; pullRequestReport?: string } = {};

    if (repositoryId) {
      const repoReport = await pipeline.generateRepositoryReport(repositoryId);
      result.repositoryReport = repoReport;
    }

    if (prId) {
      const prReport = await pipeline.generatePRReport(prId);
      result.pullRequestReport = prReport;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reports' },
      { status: 500 }
    );
  } finally {
    await pipeline.close();
  }
}
