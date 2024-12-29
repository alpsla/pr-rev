import { PRAnalysis } from '../../../github/types/pr-analysis';
import { AnalysisInput, PromptContext, RepositoryAnalysisInput } from '../../types/analysis';
import { generateBasePrompt } from './base';
import { generateTypeScriptPrompt } from './typescript';

export type SupportedLanguage = 
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'go'
  | 'rust';

export class PromptManager {
  private static isRepositoryAnalysis(analysis: AnalysisInput): analysis is RepositoryAnalysisInput {
    return 'type' in analysis && analysis.type === 'repository';
  }

  private static detectPrimaryLanguage(analysis: PRAnalysis, context: PromptContext): SupportedLanguage | null {
    // First check if repository has a defined primary language
    if (context.repository.language) {
      const lang = context.repository.language.toLowerCase();
      if (this.isLanguageSupported(lang)) {
        return lang as SupportedLanguage;
      }
    }

    // If no primary language is defined, analyze changed files
    const fileExtensions = analysis.diffAnalysis.changedFiles.map(file => {
      const parts = file.filename.split('.');
      return parts[parts.length - 1].toLowerCase();
    });

    // Count occurrences of each extension
    const extensionCounts = fileExtensions.reduce((acc, ext) => {
      acc[ext] = (acc[ext] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Map extensions to languages
    const languageMap: Record<string, SupportedLanguage> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust'
    };

    // Find the most common language
    let maxCount = 0;
    let primaryLanguage: SupportedLanguage | null = null;

    Object.entries(extensionCounts).forEach(([ext, count]) => {
      const language = languageMap[ext];
      if (language && count > maxCount) {
        maxCount = count;
        primaryLanguage = language;
      }
    });

    return primaryLanguage;
  }

  private static isLanguageSupported(language: string): boolean {
    const supportedLanguages: SupportedLanguage[] = [
      'typescript',
      'javascript',
      'python',
      'java',
      'go',
      'rust'
    ];
    return supportedLanguages.includes(language as SupportedLanguage);
  }

  static generatePrompt(analysis: AnalysisInput, context: PromptContext): string {
    if (this.isRepositoryAnalysis(analysis)) {
      return generateBasePrompt(analysis, context);
    }

    const primaryLanguage = this.detectPrimaryLanguage(analysis, context);

    // If we can't detect the language or it's not supported, use base prompt
    if (!primaryLanguage) {
      return generateBasePrompt(analysis, context);
    }

    // Select language-specific prompt generator
    switch (primaryLanguage) {
      case 'typescript':
        return generateTypeScriptPrompt(analysis, context);
      // Add other language-specific generators as they're implemented
      default:
        // For now, use base prompt for unsupported languages
        return generateBasePrompt(analysis, context);
    }
  }

  static async generatePromptWithRetry(
    analysis: AnalysisInput,
    context: PromptContext,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return this.generatePrompt(analysis, context);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error in prompt generation');
        console.error(`Prompt generation attempt ${attempt + 1} failed:`, lastError);
        
        // Wait before retrying, with exponential backoff
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to generate prompt after multiple attempts');
  }

  static validateContext(context: PromptContext): void {
    const requiredFields = {
      repository: ['name', 'techStack'],
      pullRequest: ['title', 'description', 'author', 'baseBranch', 'targetBranch']
    };

    // Validate repository fields
    for (const field of requiredFields.repository) {
      if (!context.repository[field as keyof typeof context.repository]) {
        throw new Error(`Missing required repository field: ${field}`);
      }
    }

    // Validate pullRequest fields
    for (const field of requiredFields.pullRequest) {
      if (!context.pullRequest[field as keyof typeof context.pullRequest]) {
        throw new Error(`Missing required pull request field: ${field}`);
      }
    }

    // Validate techStack is an array
    if (!Array.isArray(context.repository.techStack)) {
      throw new Error('repository.techStack must be an array');
    }
  }
}
