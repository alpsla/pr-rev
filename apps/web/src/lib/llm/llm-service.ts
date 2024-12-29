import { PRAnalysis } from '../github/types/pr-analysis';

interface LLMConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface PRReport {
  impact: {
    score: number;
    analysis: string;
  };
  codeQuality: {
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
  samples: {
    improvements: Array<{
      file: string;
      code: string;
      explanation: string;
    }>;
  };
}

export interface RepositoryReport {
  codeQuality: {
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
}

export class LLMService {
  private config: LLMConfig;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generatePRReport(analysis: PRAnalysis): Promise<PRReport> {
    const prompt = this.generatePRPrompt(analysis);
    const response = await this.callLLM(prompt);
    return this.parsePRResponse(response);
  }

  async generateRepositoryReport(analysis: {
    metrics: {
      stars: number;
      forks: number;
      issues: number;
      watchers: number;
    };
    techStack: string[];
  }): Promise<RepositoryReport> {
    const prompt = this.generateRepositoryPrompt(analysis);
    const response = await this.callLLM(prompt);
    return this.parseRepositoryResponse(response);
  }

  private generatePRPrompt(analysis: PRAnalysis): string {
    return `Analyze this pull request and provide a detailed report. Here's the data:

Files Changed: ${analysis.diffAnalysis.filesChanged}
Additions: ${analysis.diffAnalysis.additions}
Deletions: ${analysis.diffAnalysis.deletions}

Changed Files:
${analysis.diffAnalysis.changedFiles.map(file => `- ${file.filename} (${file.status})`).join('\n')}

Impact Metrics:
- Complexity: ${analysis.impactMetrics.complexity}
- Risk: ${analysis.impactMetrics.risk}
- Test Coverage: ${analysis.impactMetrics.testCoverage}
- Documentation: ${analysis.impactMetrics.documentation}

Review History:
- Approvals: ${analysis.reviewHistory.approvalCount}
- Changes Requested: ${analysis.reviewHistory.changesRequestedCount}
- Reviewers: ${analysis.reviewHistory.reviewers.join(', ')}

Test Results:
- Passed: ${analysis.automatedChecks.testResults.passed}
- Failed: ${analysis.automatedChecks.testResults.failed}
- Skipped: ${analysis.automatedChecks.testResults.skipped}
- Coverage: ${analysis.automatedChecks.testResults.coverage ?? 'N/A'}

Please provide a comprehensive analysis including:
1. Impact assessment with a score and explanation
2. Code quality analysis with suggestions for improvement
3. Testing assessment with specific recommendations
4. Documentation review with suggestions
5. Specific code improvement suggestions

Format the response as a JSON object matching the PRReport interface with the following structure:
{
  "impact": { "score": number, "analysis": string },
  "codeQuality": { "score": number, "analysis": string, "suggestions": string[] },
  "testing": { "coverage": number, "analysis": string, "suggestions": string[] },
  "documentation": { "score": number, "analysis": string, "suggestions": string[] },
  "samples": { "improvements": Array<{ "file": string, "code": string, "explanation": string }> }
}`;
  }

  private generateRepositoryPrompt(analysis: {
    metrics: {
      stars: number;
      forks: number;
      issues: number;
      watchers: number;
    };
    techStack: string[];
  }): string {
    return `Analyze this repository and provide a detailed report. Here's the data:

Repository Metrics:
- Stars: ${analysis.metrics.stars}
- Forks: ${analysis.metrics.forks}
- Issues: ${analysis.metrics.issues}
- Watchers: ${analysis.metrics.watchers}

Tech Stack:
${analysis.techStack.join(', ')}

Please provide a comprehensive analysis including:
1. Code quality assessment with recommendations
2. Security analysis with potential vulnerabilities and recommendations
3. Performance analysis with recommendations

Format the response as a JSON object matching the RepositoryReport interface with the following structure:
{
  "codeQuality": { "score": number, "analysis": string, "recommendations": string[] },
  "security": { "score": number, "vulnerabilities": string[], "recommendations": string[] },
  "performance": { "score": number, "analysis": string, "recommendations": string[] }
}`;
  }

  private async callLLM(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        })
      });

      if (!response.ok) {
        const errorMessage = `LLM API error: ${response.status} ${response.statusText}`;
        console.error('Error calling LLM:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get LLM response');
    }
  }

  private parsePRResponse(response: string): PRReport {
    try {
      return JSON.parse(response) as PRReport;
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      // Return a default response if parsing fails
      return {
        impact: {
          score: 0,
          analysis: 'Failed to analyze impact'
        },
        codeQuality: {
          score: 0,
          analysis: 'Failed to analyze code quality',
          suggestions: []
        },
        testing: {
          coverage: 0,
          analysis: 'Failed to analyze testing',
          suggestions: []
        },
        documentation: {
          score: 0,
          analysis: 'Failed to analyze documentation',
          suggestions: []
        },
        samples: {
          improvements: []
        }
      };
    }
  }

  private parseRepositoryResponse(response: string): RepositoryReport {
    try {
      return JSON.parse(response) as RepositoryReport;
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      // Return a default response if parsing fails
      return {
        codeQuality: {
          score: 0,
          analysis: 'Failed to analyze code quality',
          recommendations: []
        },
        security: {
          score: 0,
          vulnerabilities: [],
          recommendations: []
        },
        performance: {
          score: 0,
          analysis: 'Failed to analyze performance',
          recommendations: []
        }
      };
    }
  }

  // Keep old method names for backward compatibility
  async analyzePR(analysis: PRAnalysis): Promise<PRReport> {
    return this.generatePRReport(analysis);
  }

  async analyzeRepository(analysis: {
    metrics: {
      stars: number;
      forks: number;
      issues: number;
      watchers: number;
    };
    techStack: string[];
  }): Promise<RepositoryReport> {
    return this.generateRepositoryReport(analysis);
  }
}
