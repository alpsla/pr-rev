import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AnalysisPipeline } from '../../../lib/github/services/analysis-pipeline';
import { GitHubPRAnalysisService } from '../../../lib/github/services/pr-analysis';
import { GitHubRepositoryAnalysisService } from '../../../lib/github/services/repository-analysis';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth/auth-options';

// Custom type for our extended session user
type GitHubUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  hasPrivateAccess?: boolean;
  githubToken?: string | null;
};

// Input validation schema
const analyzeRequestSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  prNumber: z.number().int().positive()
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export interface AnalyzeResponse {
  success: boolean;
  data?: {
    repositoryAnalysis: {
      metrics: {
        stars: number;
        forks: number;
        issues: number;
        watchers: number;
      };
      techStack: string[];
      quality: {
        score: number;
        analysis: string;
        recommendations: string[];
      };
      security: {
        score: number;
        vulnerabilities: string[];
        recommendations: string[];
      };
      performance: {
        score: number;
        analysis: string;
        recommendations: string[];
      };
    };
    prAnalysis: {
      impact: {
        score: number;
        analysis: string;
      };
      quality: {
        score: number;
        analysis: string;
        suggestions: string[];
      };
      testing: {
        coverage: number;
        analysis: string;
        suggestions: string[];
      };
      documentation: {
        score: number;
        analysis: string;
        suggestions: string[];
      };
      improvements: Array<{
        file: string;
        code: string;
        explanation: string;
      }>;
    };
  };
  errors?: string[];
}

export async function POST(request: Request): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // Get session and assert user type
    const session = await getServerSession(authOptions);
    const user = session?.user as GitHubUser | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { success: false, errors: ['Unauthorized'] },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = analyzeRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, errors: ['Invalid request data'] },
        { status: 400 }
      );
    }

    // Check for GitHub token in session
    if (!user.githubToken) {
      return NextResponse.json(
        { success: false, errors: ['GitHub token not found. Please reconnect your GitHub account.'] },
        { status: 401 }
      );
    }

    try {
      // Initialize services
      const prAnalysisService = new GitHubPRAnalysisService(user.githubToken, user.id);
      const repoAnalysisService = new GitHubRepositoryAnalysisService(user.githubToken, user.id);

      // Create analysis pipeline with LLM config
      const pipeline = new AnalysisPipeline(
        prAnalysisService,
        repoAnalysisService,
        {
          model: process.env.OPENAI_MODEL ?? 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          apiKey: process.env.OPENAI_API_KEY ?? ''
        }
      );

      // Perform analysis
      const { owner, repo, prNumber } = validatedData.data;
      const result = await pipeline.analyze(owner, repo, prNumber);

      // Close services
      pipeline.close();

      // Handle analysis failures
      if (!result.repositoryAnalysis || !result.prAnalysis) {
        return NextResponse.json(
          { 
            success: false, 
            errors: result.errors 
          },
          { status: 500 }
        );
      }

      // Transform analysis results into response format
      const response: AnalyzeResponse = {
        success: true,
        data: {
          repositoryAnalysis: {
            metrics: {
              stars: result.repositoryAnalysis.metrics.stars,
              forks: result.repositoryAnalysis.metrics.forks,
              issues: result.repositoryAnalysis.metrics.issues,
              watchers: result.repositoryAnalysis.metrics.watchers
            },
            techStack: result.repositoryAnalysis.techStack,
            quality: result.llmReports.repository?.codeQuality ?? {
              score: 0,
              analysis: 'Analysis not available',
              recommendations: []
            },
            security: result.llmReports.repository?.security ?? {
              score: 0,
              vulnerabilities: [],
              recommendations: []
            },
            performance: result.llmReports.repository?.performance ?? {
              score: 0,
              analysis: 'Analysis not available',
              recommendations: []
            }
          },
          prAnalysis: {
            impact: result.llmReports.pr?.impact ?? {
              score: 0,
              analysis: 'Analysis not available'
            },
            quality: {
              score: result.llmReports.pr?.codeQuality.score ?? 0,
              analysis: result.llmReports.pr?.codeQuality.analysis ?? 'Analysis not available',
              suggestions: result.llmReports.pr?.codeQuality.suggestions ?? []
            },
            testing: {
              coverage: result.llmReports.pr?.testing.coverage ?? 0,
              analysis: result.llmReports.pr?.testing.analysis ?? 'Analysis not available',
              suggestions: result.llmReports.pr?.testing.suggestions ?? []
            },
            documentation: {
              score: result.llmReports.pr?.documentation.score ?? 0,
              analysis: result.llmReports.pr?.documentation.analysis ?? 'Analysis not available',
              suggestions: result.llmReports.pr?.documentation.suggestions ?? []
            },
            improvements: result.llmReports.pr?.samples.improvements ?? []
          }
        }
      };

      // Include any errors that occurred during analysis
      if (result.errors.length > 0) {
        response.errors = result.errors;
      }

      return NextResponse.json(response);

    } catch (error) {
      // Handle GitHub API errors
      if (error instanceof Error) {
        if (error.message.includes('Bad credentials') || error.message.includes('401')) {
          return NextResponse.json(
            { 
              success: false, 
              errors: ['GitHub token expired. Please reconnect your GitHub account.']
            },
            { status: 401 }
          );
        }
        
        if (error.message.includes('rate limit')) {
          return NextResponse.json(
            { 
              success: false, 
              errors: ['GitHub API rate limit exceeded. Please try again later.']
            },
            { status: 429 }
          );
        }
      }
      
      throw error; // Re-throw unexpected errors
    }

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        errors: ['An unexpected error occurred'] 
      },
      { status: 500 }
    );
  }
}
