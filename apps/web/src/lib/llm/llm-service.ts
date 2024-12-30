import { LLMError, LLMErrorCode } from './types/error';
import { validatePRAnalysisResponse } from './validators/pr-analysis-validator';
import {
  LLMResponse,
  LLMRepositoryAnalysis,
  LLMPRAnalysis,
  RepositoryReport,
  PRReport,
} from './types/analysis';
import type { RepositoryAnalysis } from '../github/types/repository';
import type { PRAnalysis } from '../github/types/pr-analysis';

interface LLMOptions {
  model: string;
  requestId: string;
}

export class LLMService {
  async generateRepositoryReport(
    analysis: RepositoryAnalysis,
    options: LLMOptions
  ): Promise<LLMResponse<LLMRepositoryAnalysis>> {
    try {
      if (!analysis.description) {
        throw new LLMError('Missing repository description', LLMErrorCode.UnexpectedError);
      }

      const legacyReport = await this.generateLegacyRepositoryReport(analysis, options);
      return this.convertRepositoryReport(legacyReport);
    } catch (error) {
      const llmError = error instanceof LLMError ? error : new LLMError(
        error instanceof Error ? error.message : 'Unknown error',
        LLMErrorCode.InvalidResponse
      );
      return {
        analysis: this.getDefaultRepositoryAnalysis(),
        issues: [llmError],
      };
    }
  }

  async generatePRReport(
    analysis: PRAnalysis,
    options: LLMOptions
  ): Promise<LLMResponse<LLMPRAnalysis>> {
    try {
      if (!analysis.title) {
        throw new LLMError('Missing PR title', LLMErrorCode.UnexpectedError);
      }

      const legacyReport = await this.generateLegacyPRReport(analysis, options);
      const validatedReport = validatePRAnalysisResponse(legacyReport);
      return this.convertPRReport(validatedReport);
    } catch (error) {
      const llmError = error instanceof LLMError ? error : new LLMError(
        error instanceof Error ? error.message : 'Unknown error',
        LLMErrorCode.InvalidResponse
      );
      return {
        analysis: this.getDefaultPRAnalysis(),
        issues: [llmError],
      };
    }
  }

  private async generateLegacyRepositoryReport(
    analysis: RepositoryAnalysis,
    options: LLMOptions
  ): Promise<RepositoryReport> {
    // TODO: Implement actual LLM call
    return {
      summary: `Analysis of ${analysis.name} (${options.model})`,
      codeQuality: {
        score: 0.8,
        testCoverage: 0.75,
        documentation: 0.7,
        maintainability: 0.85,
        organization: [{
          finding: 'Code organization needs improvement',
          priority: 'Medium',
          recommendation: 'Consider restructuring code into smaller modules',
          impact: 'Improves maintainability'
        }],
      },
      security: {
        vulnerabilities: [{
          finding: 'Potential security issue found',
          priority: 'High',
          recommendation: 'Update dependencies to latest versions',
          severity: 'High',
          description: 'Outdated dependencies may have known vulnerabilities',
          impact: 'Could lead to security breaches',
          risk: 'High'
        }],
        score: 0.9,
        authPatterns: [],
        dataHandling: [],
      },
      dependencies: {
        total: 0,
        outdated: [],
        vulnerable: [],
        direct: 0,
        dev: 0,
        compatibility: [],
      },
      workflow: {
        commitPatterns: [],
        prManagement: [],
        collaboration: [],
        releaseProcess: [],
      },
      architecture: {
        patterns: [],
      },
      suggestions: [],
      reviewConfidence: 0.85,
    };
  }

  private async generateLegacyPRReport(
    analysis: PRAnalysis,
    options: LLMOptions
  ): Promise<PRReport> {
    // TODO: Implement actual LLM call
    return {
      summary: `Analysis of PR #${analysis.number} (${options.model})`,
      codeQuality: {
        score: 0.8,
        testCoverage: 0.75,
        documentation: 0.7,
        maintainability: 0.85,
        organization: [{
          finding: 'Code organization needs improvement',
          priority: 'Medium',
          recommendation: 'Consider restructuring code into smaller modules',
          impact: 'Improves maintainability'
        }],
      },
      security: {
        vulnerabilities: [{
          finding: 'Potential security issue found',
          priority: 'High',
          recommendation: 'Update dependencies to latest versions',
          severity: 'High',
          description: 'Outdated dependencies may have known vulnerabilities',
          impact: 'Could lead to security breaches',
          risk: 'High'
        }],
        score: 0.9,
      },
      workflow: {
        commitPatterns: [],
      },
      suggestions: [{
        type: 'Code Quality',
        description: 'Consider adding more test coverage',
        priority: 'Medium',
        location: 'src/components/'
      }],
      impact: {
        complexity: 0.5,
        coverage: 0.8,
        security: 0.9,
      },
      reviewConfidence: 0.85,
    };
  }

  private getDefaultRepositoryAnalysis(): LLMRepositoryAnalysis {
    return {
      summary: 'Analysis failed',
      findings: [{
        category: 'Error',
        description: 'Failed to generate analysis',
        severity: 'high',
        recommendation: 'Please try again or contact support if the issue persists'
      }],
      recommendations: [{
        category: 'System',
        description: 'Retry analysis',
        priority: 'high',
        impact: 'Required for complete code review'
      }],
    };
  }

  private getDefaultPRAnalysis(): LLMPRAnalysis {
    return {
      summary: 'Analysis failed',
      findings: [{
        category: 'Error',
        description: 'Failed to generate PR analysis',
        severity: 'high',
        suggestion: 'Please try again or contact support if the issue persists'
      }],
      recommendations: [{
        category: 'System',
        description: 'Retry PR analysis',
        priority: 'high',
        rationale: 'Required for complete PR review'
      }],
    };
  }

  private convertRepositoryReport(report: RepositoryReport): LLMResponse<LLMRepositoryAnalysis> {
    const findings = [
      ...report.codeQuality.organization.map(org => ({
        category: 'Code Quality',
        description: org.finding,
        severity: org.priority.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
        recommendation: org.recommendation,
      })),
      ...report.security.vulnerabilities.map(vuln => ({
        category: 'Security',
        description: vuln.finding,
        severity: vuln.priority.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
        recommendation: vuln.recommendation,
      })),
    ];

    const recommendations = [
      ...report.suggestions.map(sugg => ({
        category: sugg.category,
        description: sugg.description,
        priority: sugg.priority.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
        impact: 'Improves code quality and maintainability',
      })),
    ];

    return {
      analysis: {
        summary: report.summary,
        findings,
        recommendations,
      },
      issues: [],
    };
  }

  private convertPRReport(report: PRReport): LLMResponse<LLMPRAnalysis> {
    const findings = [
      ...report.codeQuality.organization.map(org => ({
        category: 'Code Quality',
        description: org.finding,
        severity: org.priority.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
        suggestion: org.recommendation,
      })),
      ...report.security.vulnerabilities.map(vuln => ({
        category: 'Security',
        description: vuln.finding,
        severity: vuln.priority.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
        suggestion: vuln.recommendation,
      })),
    ];

    const recommendations = report.suggestions.map(sugg => ({
      category: sugg.type,
      description: sugg.description,
      priority: sugg.priority.toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
      rationale: `Impact on: complexity (${report.impact.complexity}), coverage (${report.impact.coverage}), security (${report.impact.security})`,
    }));

    return {
      analysis: {
        summary: report.summary,
        findings,
        recommendations,
      },
      issues: [],
    };
  }
}
