import { z } from 'zod';

export const PriorityEnum = z.enum(['Critical', 'High', 'Medium', 'Low']);
export type Priority = z.infer<typeof PriorityEnum>;

export interface Finding {
  finding: string;
  priority: Priority;
  recommendation: string;
  impact: string;
}

export interface SecurityFinding extends Finding {
  risk: string;
}

export interface TechnicalDebtFinding extends Finding {
  estimatedEffort: string;
}

export interface PerformanceFinding extends Finding {
  estimatedImprovement: string;
}

export interface DependencyFinding {
  package: string;
  currentVersion: string;
  latestVersion: string;
  priority: Priority;
  breakingChanges: boolean;
  recommendation: string;
}

export interface SecurityDependencyFinding {
  package: string;
  vulnerability: string;
  priority: Priority;
  recommendation: string;
}

export interface PatternFinding extends Finding {
  benefit: string;
}

export interface LLMRepositoryAnalysis {
  codeQuality: {
    organization: Finding[];
    testCoverage: Finding[];
    documentation: Finding[];
    technicalDebt: TechnicalDebtFinding[];
  };
  security: {
    vulnerabilities: SecurityFinding[];
    authPatterns: SecurityFinding[];
    dataHandling: SecurityFinding[];
  };
  performance: {
    bottlenecks: PerformanceFinding[];
    scalability: Finding[];
    caching: Finding[];
  };
  dependencies: {
    outdated: DependencyFinding[];
    security: SecurityDependencyFinding[];
    compatibility: Finding[];
  };
  bestPractices: {
    standards: Finding[];
    patterns: PatternFinding[];
    errorHandling: Finding[];
    logging: Finding[];
    cicd: PatternFinding[];
  };
  workflow: {
    commitPatterns: Finding[];
    prManagement: Finding[];
    collaboration: PatternFinding[];
    releaseProcess: PatternFinding[];
  };
  summary: {
    overallHealth: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mainStrengths: string[];
    mainConcerns: string[];
    recommendedNextSteps: string[];
  };
}

export function transformLLMAnalysisToRepositoryAnalysis(
  llmAnalysis: LLMRepositoryAnalysis
): {
  quality: { codeQuality: number; testCoverage: number; documentation: number; maintainability: number };
  security: { vulnerabilities: number; securityScore: number; lastAudit: string | null };
  dependencies: { total: number; outdated: number; vulnerable: number; directDependencies: number; devDependencies: number };
  activity: { lastCommit: string | null; lastRelease: string | null; commitsLastMonth: number; prsLastMonth: number; issuesLastMonth: number };
} {
  // Calculate code quality metrics
  const quality = {
    codeQuality: calculateQualityScore(llmAnalysis.codeQuality.organization),
    testCoverage: calculateQualityScore(llmAnalysis.codeQuality.testCoverage),
    documentation: calculateQualityScore(llmAnalysis.codeQuality.documentation),
    maintainability: 100 - calculateTechnicalDebtScore(llmAnalysis.codeQuality.technicalDebt),
  };

  // Calculate security metrics
  const security = {
    vulnerabilities: llmAnalysis.security.vulnerabilities.length,
    securityScore: calculateSecurityScore(llmAnalysis.security),
    lastAudit: null, // This would come from repository data
  };

  // Calculate dependency metrics
  const dependencies = {
    total: llmAnalysis.dependencies.outdated.length + llmAnalysis.dependencies.security.length,
    outdated: llmAnalysis.dependencies.outdated.length,
    vulnerable: llmAnalysis.dependencies.security.length,
    directDependencies: countDirectDependencies(llmAnalysis.dependencies),
    devDependencies: countDevDependencies(llmAnalysis.dependencies),
  };

  // Calculate activity metrics
  const activity = {
    lastCommit: null, // These would come from repository data
    lastRelease: null,
    commitsLastMonth: calculateCommitActivity(llmAnalysis.workflow.commitPatterns),
    prsLastMonth: calculatePRActivity(llmAnalysis.workflow.prManagement),
    issuesLastMonth: 0, // This would come from repository data
  };

  return {
    quality,
    security,
    dependencies,
    activity,
  };
}

function calculateQualityScore(findings: Finding[]): number {
  const weights = { Critical: 1, High: 0.7, Medium: 0.4, Low: 0.2 };
  const totalIssues = findings.length;
  if (totalIssues === 0) return 100;

  const weightedSum = findings.reduce((sum, finding) => sum + weights[finding.priority], 0);
  return Math.max(0, Math.min(100, 100 - (weightedSum / totalIssues) * 20));
}

function calculateTechnicalDebtScore(findings: TechnicalDebtFinding[]): number {
  const weights = { Critical: 1, High: 0.7, Medium: 0.4, Low: 0.2 };
  const totalIssues = findings.length;
  if (totalIssues === 0) return 0;

  const weightedSum = findings.reduce((sum, finding) => sum + weights[finding.priority], 0);
  return Math.min(100, (weightedSum / totalIssues) * 25);
}

function calculateSecurityScore(security: LLMRepositoryAnalysis['security']): number {
  const allFindings = [
    ...security.vulnerabilities,
    ...security.authPatterns,
    ...security.dataHandling,
  ];
  const weights = { Critical: 1, High: 0.7, Medium: 0.4, Low: 0.2 };
  const totalIssues = allFindings.length;
  if (totalIssues === 0) return 100;

  const weightedSum = allFindings.reduce((sum, finding) => sum + weights[finding.priority], 0);
  return Math.max(0, Math.min(100, 100 - (weightedSum / totalIssues) * 25));
}

function countDirectDependencies(dependencies: LLMRepositoryAnalysis['dependencies']): number {
  return dependencies.outdated.filter(dep => !dep.package.includes('dev')).length;
}

function countDevDependencies(dependencies: LLMRepositoryAnalysis['dependencies']): number {
  return dependencies.outdated.filter(dep => dep.package.includes('dev')).length;
}

function calculateCommitActivity(commitPatterns: Finding[]): number {
  // Estimate based on commit pattern findings
  return commitPatterns.reduce((sum, pattern) => {
    const match = pattern.finding.match(/(\d+)\s+commits?/i);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);
}

function calculatePRActivity(prPatterns: Finding[]): number {
  // Estimate based on PR pattern findings
  return prPatterns.reduce((sum, pattern) => {
    const match = pattern.finding.match(/(\d+)\s+PRs?/i);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);
}
