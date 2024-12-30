import type { LLMError } from './error';

export interface LLMResponse<T> {
  analysis: T;
  issues: LLMError[];
}

export interface LLMRepositoryAnalysis {
  summary: string;
  findings: Array<{
    category: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  recommendations: Array<{
    category: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    impact: string;
  }>;
}

export interface LLMPRAnalysis {
  summary: string;
  findings: Array<{
    category: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    location?: string;
    suggestion?: string;
  }>;
  recommendations: Array<{
    category: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    rationale: string;
  }>;
}

export interface LLMCodeAnalysis {
  quality: {
    score: number;
    issues: Array<{
      type: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      location?: string;
      suggestion?: string;
    }>;
  };
  security: {
    score: number;
    vulnerabilities: Array<{
      type: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      location?: string;
      mitigation?: string;
    }>;
  };
  maintainability: {
    score: number;
    issues: Array<{
      type: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      location?: string;
      suggestion?: string;
    }>;
  };
}

export interface LLMTestAnalysis {
  coverage: {
    score: number;
    gaps: Array<{
      component: string;
      description: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      suggestion: string;
    }>;
  };
  quality: {
    score: number;
    issues: Array<{
      type: string;
      description: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      location?: string;
      suggestion?: string;
    }>;
  };
}

// Legacy types for backward compatibility
/** @deprecated Use LLMResponse<LLMRepositoryAnalysis> instead */
export interface RepositoryReport {
  summary: string;
  codeQuality: {
    score: number;
    testCoverage: number;
    documentation: number;
    maintainability: number;
    organization: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      impact: string;
    }>;
  };
  security: {
    vulnerabilities: Array<{
      severity: string;
      description: string;
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      impact: string;
      risk: string;
    }>;
    score: number;
    authPatterns: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      risk: string;
    }>;
    dataHandling: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      risk: string;
    }>;
  };
  dependencies: {
    total: number;
    outdated: Array<{
      name: string;
      currentVersion: string;
      latestVersion: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      breakingChanges: boolean;
    }>;
    vulnerable: Array<{
      name: string;
      vulnerability: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      risk: string;
    }>;
    direct: number;
    dev: number;
    compatibility: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
  };
  workflow: {
    commitPatterns: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
    prManagement: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
    collaboration: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
    releaseProcess: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
  };
  architecture: {
    patterns: Array<{
      name: string;
      description: string;
      recommendation?: string;
    }>;
  };
  suggestions: Array<{
    category: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  }>;
  reviewConfidence: number;
}

/** @deprecated Use LLMResponse<LLMPRAnalysis> instead */
export interface PRReport {
  summary: string;
  codeQuality: {
    score: number;
    testCoverage: number;
    documentation: number;
    maintainability: number;
    organization: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      impact: string;
    }>;
  };
  security: {
    vulnerabilities: Array<{
      severity: string;
      description: string;
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
      impact: string;
      risk: string;
    }>;
    score: number;
  };
  workflow: {
    commitPatterns: Array<{
      finding: string;
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
      recommendation: string;
    }>;
  };
  suggestions: Array<{
    type: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    location?: string;
  }>;
  impact: {
    complexity: number;
    coverage: number;
    security: number;
  };
  reviewConfidence: number;
}

// Helper function to convert legacy report to new format
export function convertToLLMResponse<T extends RepositoryReport | PRReport>(report: T): LLMResponse<T> {
  return {
    analysis: report,
    issues: [],
  };
}
