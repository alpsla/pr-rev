// src/lib/github/types/llm.ts

// Base LLM Agent Interface
export interface LLMAgent {
    id: string;
    provider: 'anthropic' | 'openai' | 'google' | 'custom';
    name: string;
    version: string;
    capabilities: LLMCapabilities;
    config: LLMConfig;
  }
  
  export interface LLMCapabilities {
    maxTokens: number;
    supportedLanguages: string[];
    features: {
      codeAnalysis: boolean;
      securityAudit: boolean;
      performanceAnalysis: boolean;
      bestPractices: boolean;
      styleGuide: boolean;
      // Add more feature flags as needed
    };
  }
  
  export interface LLMConfig {
    apiKey: string;
    endpoint?: string;
    timeout?: number;
    retryConfig?: {
      maxRetries: number;
      backoffFactor: number;
    };
    contextWindow?: number;
  }
  
  // Analysis Types
  export interface CodeAnalysisRequest {
    pullRequest: {
      diff: string;
      files: CodeFile[];
      context?: string;
    };
    options: AnalysisOptions;
  }
  
  export interface CodeFile {
    path: string;
    content: string;
    language: string;
    changes: {
      additions: number;
      deletions: number;
    };
  }
  
  export interface AnalysisOptions {
    focus?: Array<'security' | 'performance' | 'style' | 'best-practices'>;
    depth: 'basic' | 'detailed' | 'comprehensive';
    language?: string;
    ignorePatterns?: string[];
  }
  
  export interface AnalysisResponse {
    summary: string;
    sections: AnalysisSection[];
    suggestions: Suggestion[];
    metadata: {
      agent: string;
      analysisTime: number;
      tokensUsed: number;
    };
  }
  
  export interface AnalysisSection {
    title: string;
    content: string;
    severity: 'info' | 'warning' | 'critical';
    category: 'security' | 'performance' | 'style' | 'best-practices';
    lineReferences?: number[];
  }
  
  export interface Suggestion {
    type: 'improvement' | 'warning' | 'error';
    title: string;
    description: string;
    file?: string;
    lineNumber?: number;
    code?: {
      original: string;
      suggested: string;
    };
  }
  
  // Agent Factory
  export interface LLMAgentFactory {
    createAgent(config: LLMConfig): LLMAgent;
    listAvailableAgents(): LLMAgent[];
    getBestAgentForTask(requirements: AnalysisOptions): LLMAgent;
  }