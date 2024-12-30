import { PromptContext } from '../../types/analysis';
import { Repository } from '../../../github/types/repository';

export interface RepositoryAnalysisResult {
  codeQuality: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  security: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  performance: {
    score: number;
    hotspots: string[];
    optimizations: string[];
  };
  dependencies: {
    status: 'healthy' | 'attention' | 'critical';
    outdated: string[];
    vulnerable: string[];
    recommendations: string[];
  };
  bestPractices: {
    score: number;
    adherence: string[];
    violations: string[];
    suggestions: string[];
  };
}

export function generateRepositoryAnalysisPrompt(
  repository: Repository,
  context: PromptContext
): string {
  const { name, description, language, topics, visibility } = repository;

  const prompt = `Repository Analysis Request:
Name: ${name}
Description: ${description || 'No description provided'}
Primary Language: ${language}
Topics: ${topics?.join(', ') || 'None'}
Visibility: ${visibility}

Please analyze this repository with focus on:

1. Code Quality Assessment:
   - Code organization and structure
   - Consistency in coding patterns
   - Documentation quality
   - Test coverage and quality
   - Technical debt indicators

2. Security Analysis:
   - Common security vulnerabilities
   - Authentication and authorization patterns
   - Data handling practices
   - Dependency security status
   - Security best practices adherence

3. Performance Evaluation:
   - Performance bottlenecks
   - Resource usage patterns
   - Scalability considerations
   - Caching strategies
   - Optimization opportunities

4. Dependency Analysis:
   - Dependency health check
   - Version currency
   - Known vulnerabilities
   - Compatibility issues
   - Update recommendations

5. Best Practices Review:
   - Industry standard adherence
   - Design pattern usage
   - Error handling practices
   - Logging and monitoring
   - CI/CD practices

Please provide a structured analysis with:
- Specific examples from the codebase
- Actionable recommendations
- Priority levels for issues
- Concrete improvement steps
- Risk assessment for changes

Format the response as a structured JSON object matching the RepositoryAnalysisResult interface.`;

  return prompt;
}

export function parseRepositoryAnalysisResponse(
  response: string
): RepositoryAnalysisResult {
  try {
    // Attempt to parse the JSON response
    const parsed = JSON.parse(response);
    
    // Validate the required structure
    if (!validateRepositoryAnalysisResult(parsed)) {
      throw new Error('Invalid response structure');
    }

    return parsed;
  } catch (error) {
    // Fallback to a default structure with error indication
    return {
      codeQuality: {
        score: 0,
        strengths: ['Error parsing LLM response'],
        improvements: ['Response parsing failed']
      },
      security: {
        score: 0,
        issues: ['Response parsing error'],
        recommendations: ['Retry analysis']
      },
      performance: {
        score: 0,
        hotspots: ['Unable to analyze performance'],
        optimizations: ['Retry analysis']
      },
      dependencies: {
        status: 'attention',
        outdated: ['Analysis failed'],
        vulnerable: ['Unable to check vulnerabilities'],
        recommendations: ['Retry analysis']
      },
      bestPractices: {
        score: 0,
        adherence: ['Analysis incomplete'],
        violations: ['Unable to check violations'],
        suggestions: ['Retry repository analysis']
      }
    };
  }
}

function validateRepositoryAnalysisResult(
  result: any
): result is RepositoryAnalysisResult {
  return (
    result &&
    typeof result === 'object' &&
    validateCodeQuality(result.codeQuality) &&
    validateSecurity(result.security) &&
    validatePerformance(result.performance) &&
    validateDependencies(result.dependencies) &&
    validateBestPractices(result.bestPractices)
  );
}

function validateCodeQuality(quality: any): boolean {
  return (
    quality &&
    typeof quality.score === 'number' &&
    Array.isArray(quality.strengths) &&
    Array.isArray(quality.improvements)
  );
}

function validateSecurity(security: any): boolean {
  return (
    security &&
    typeof security.score === 'number' &&
    Array.isArray(security.issues) &&
    Array.isArray(security.recommendations)
  );
}

function validatePerformance(performance: any): boolean {
  return (
    performance &&
    typeof performance.score === 'number' &&
    Array.isArray(performance.hotspots) &&
    Array.isArray(performance.optimizations)
  );
}

function validateDependencies(dependencies: any): boolean {
  return (
    dependencies &&
    ['healthy', 'attention', 'critical'].includes(dependencies.status) &&
    Array.isArray(dependencies.outdated) &&
    Array.isArray(dependencies.vulnerable) &&
    Array.isArray(dependencies.recommendations)
  );
}

function validateBestPractices(practices: any): boolean {
  return (
    practices &&
    typeof practices.score === 'number' &&
    Array.isArray(practices.adherence) &&
    Array.isArray(practices.violations) &&
    Array.isArray(practices.suggestions)
  );
}
