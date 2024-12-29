import { PRReport, RepositoryReport } from '../llm-service';

export class ResponseValidator {
  static validatePRReport(response: unknown): PRReport {
    if (!this.isObject(response)) {
      throw new Error('Response must be an object');
    }

    const report = response as Partial<PRReport>;

    // Validate impact section
    if (!this.isValidImpact(report.impact)) {
      throw new Error('Invalid impact section in response');
    }

    // Validate codeQuality section
    if (!this.isValidCodeQuality(report.codeQuality)) {
      throw new Error('Invalid codeQuality section in response');
    }

    // Validate testing section
    if (!this.isValidTesting(report.testing)) {
      throw new Error('Invalid testing section in response');
    }

    // Validate documentation section
    if (!this.isValidDocumentation(report.documentation)) {
      throw new Error('Invalid documentation section in response');
    }

    // Validate samples section
    if (!this.isValidSamples(report.samples)) {
      throw new Error('Invalid samples section in response');
    }

    return report as PRReport;
  }

  static validateRepositoryReport(response: unknown): RepositoryReport {
    if (!this.isObject(response)) {
      throw new Error('Response must be an object');
    }

    const report = response as Partial<RepositoryReport>;

    // Validate codeQuality section
    if (!this.isValidRepoCodeQuality(report.codeQuality)) {
      throw new Error('Invalid codeQuality section in response');
    }

    // Validate security section
    if (!this.isValidSecurity(report.security)) {
      throw new Error('Invalid security section in response');
    }

    // Validate performance section
    if (!this.isValidPerformance(report.performance)) {
      throw new Error('Invalid performance section in response');
    }

    return report as RepositoryReport;
  }

  private static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private static isValidScore(score: unknown): score is number {
    return typeof score === 'number' && score >= 0 && score <= 10;
  }

  private static isValidPercentage(value: unknown): value is number {
    return typeof value === 'number' && value >= 0 && value <= 100;
  }

  private static isValidString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  private static isValidStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(item => this.isValidString(item));
  }

  private static isValidImpact(impact: unknown): impact is PRReport['impact'] {
    if (!this.isObject(impact)) return false;
    const { score, analysis } = impact as Partial<PRReport['impact']>;
    return this.isValidScore(score) && this.isValidString(analysis);
  }

  private static isValidCodeQuality(
    codeQuality: unknown
  ): codeQuality is PRReport['codeQuality'] {
    if (!this.isObject(codeQuality)) return false;
    const { score, analysis, suggestions } = codeQuality as Partial<PRReport['codeQuality']>;
    return (
      this.isValidScore(score) &&
      this.isValidString(analysis) &&
      this.isValidStringArray(suggestions)
    );
  }

  private static isValidTesting(testing: unknown): testing is PRReport['testing'] {
    if (!this.isObject(testing)) return false;
    const { coverage, analysis, suggestions } = testing as Partial<PRReport['testing']>;
    return (
      this.isValidPercentage(coverage) &&
      this.isValidString(analysis) &&
      this.isValidStringArray(suggestions)
    );
  }

  private static isValidDocumentation(
    documentation: unknown
  ): documentation is PRReport['documentation'] {
    if (!this.isObject(documentation)) return false;
    const { score, analysis, suggestions } = documentation as Partial<PRReport['documentation']>;
    return (
      this.isValidScore(score) &&
      this.isValidString(analysis) &&
      this.isValidStringArray(suggestions)
    );
  }

  private static isValidSamples(samples: unknown): samples is PRReport['samples'] {
    if (!this.isObject(samples)) return false;
    const { improvements } = samples as Partial<PRReport['samples']>;
    if (!Array.isArray(improvements)) return false;
    
    return improvements.every(improvement => {
      if (!this.isObject(improvement)) return false;
      const { file, code, explanation } = improvement as Partial<PRReport['samples']['improvements'][0]>;
      return (
        this.isValidString(file) &&
        this.isValidString(code) &&
        this.isValidString(explanation)
      );
    });
  }

  private static isValidRepoCodeQuality(
    codeQuality: unknown
  ): codeQuality is RepositoryReport['codeQuality'] {
    if (!this.isObject(codeQuality)) return false;
    const { score, analysis, recommendations } = codeQuality as Partial<RepositoryReport['codeQuality']>;
    return (
      this.isValidScore(score) &&
      this.isValidString(analysis) &&
      this.isValidStringArray(recommendations)
    );
  }

  private static isValidSecurity(
    security: unknown
  ): security is RepositoryReport['security'] {
    if (!this.isObject(security)) return false;
    const { score, vulnerabilities, recommendations } = security as Partial<RepositoryReport['security']>;
    return (
      this.isValidScore(score) &&
      this.isValidStringArray(vulnerabilities) &&
      this.isValidStringArray(recommendations)
    );
  }

  private static isValidPerformance(
    performance: unknown
  ): performance is RepositoryReport['performance'] {
    if (!this.isObject(performance)) return false;
    const { score, analysis, recommendations } = performance as Partial<RepositoryReport['performance']>;
    return (
      this.isValidScore(score) &&
      this.isValidString(analysis) &&
      this.isValidStringArray(recommendations)
    );
  }

  static sanitizeResponse(response: string): string {
    // Remove any potential markdown formatting
    response = response.replace(/```json\n?|\n?```/g, '');
    
    // Remove any leading/trailing whitespace
    response = response.trim();
    
    // Attempt to extract JSON if the response contains other text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      response = jsonMatch[0];
    }
    
    return response;
  }
}
