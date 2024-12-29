import { AnalysisInput, PromptContext } from '../../types/analysis';
import { PRAnalysis } from '../../../github/types/pr-analysis';
import { analyzeLanguages, generateLanguageSpecificPrompt } from './language-analysis';

function isPRAnalysis(analysis: AnalysisInput): analysis is PRAnalysis {
  return !('type' in analysis);
}

export function generateBasePrompt(analysis: AnalysisInput, context: PromptContext): string {
  const { repository, pullRequest } = context;

  // Base prompt header
  let prompt = `You are an expert code reviewer with deep knowledge of software development best practices, design patterns, and various programming languages. 
You are reviewing ${isPRAnalysis(analysis) ? 'a pull request' : 'the codebase'} in the repository "${repository.name}"${repository.description ? ` which is ${repository.description}` : ''}.`;

  // Add language analysis for PR reviews
  if (isPRAnalysis(analysis)) {
    const languageAnalysis = analyzeLanguages(analysis);
    prompt += '\n\n' + generateLanguageSpecificPrompt(analysis, context, languageAnalysis);

    prompt += `

Pull Request Details:
Title: ${pullRequest.title}
Author: ${pullRequest.author}
Base Branch: ${pullRequest.baseBranch}
Target Branch: ${pullRequest.targetBranch}
Description: ${pullRequest.description}

Changes Overview:
Files Changed: ${analysis.diffAnalysis.filesChanged}
Additions: ${analysis.diffAnalysis.additions}
Deletions: ${analysis.diffAnalysis.deletions}

Modified Files:
${analysis.diffAnalysis.changedFiles.map(file => `- ${file.filename} (${file.status})`).join('\n')}

Impact Analysis:
- Complexity Score: ${analysis.impactMetrics.complexity}/10
- Risk Score: ${analysis.impactMetrics.risk}/10
- Test Coverage: ${analysis.impactMetrics.testCoverage}%
- Documentation Coverage: ${analysis.impactMetrics.documentation}%

Review History:
- Approvals: ${analysis.reviewHistory.approvalCount}
- Changes Requested: ${analysis.reviewHistory.changesRequestedCount}
- Reviewers: ${analysis.reviewHistory.reviewers.join(', ')}

Test Results:
- Passed: ${analysis.automatedChecks.testResults.passed}
- Failed: ${analysis.automatedChecks.testResults.failed}
- Skipped: ${analysis.automatedChecks.testResults.skipped}
- Coverage: ${analysis.automatedChecks.testResults.coverage ?? 'N/A'}%`;
  } else {
    prompt += `
Repository Metrics:
- Stars: ${analysis.metrics.stars}
- Forks: ${analysis.metrics.forks}
- Issues: ${analysis.metrics.issues}
- Watchers: ${analysis.metrics.watchers}`;
  }

  // Common analysis instructions
  prompt += `

Please analyze ${isPRAnalysis(analysis) ? 'this pull request' : 'this repository'} and provide a comprehensive review focusing on:

1. Code Quality:
   - Clean code principles
   - Design patterns usage
   - Code organization
   - Naming conventions
   - Function/method complexity
   - Code duplication
   - Error handling

2. Testing:
   - Test coverage adequacy
   - Test quality and completeness
   - Missing test scenarios
   - Integration test considerations

3. Security:
   - Potential vulnerabilities
   - Authentication/authorization concerns
   - Data validation
   - Input sanitization
   - Secure coding practices

4. Performance:
   - Algorithmic efficiency
   - Resource usage
   - Database query optimization
   - Caching considerations
   - Memory management

5. Documentation:
   - Code comments quality
   - API documentation
   - Implementation notes
   - Architecture decisions

6. Best Practices:
   - Language-specific conventions
   - Framework guidelines
   - Project standards
   - Error handling patterns

Please provide specific examples and suggestions for improvement where applicable. Include code snippets for complex suggestions.

Format your response as a JSON object with the following structure:
${isPRAnalysis(analysis) ? `{
  "impact": {
    "score": number (1-10),
    "analysis": string (detailed impact analysis)
  },
  "codeQuality": {
    "score": number (1-10),
    "analysis": string (overall code quality assessment),
    "suggestions": string[] (specific improvement suggestions)
  },
  "testing": {
    "coverage": number (0-100),
    "analysis": string (testing assessment),
    "suggestions": string[] (testing improvement suggestions)
  },
  "documentation": {
    "score": number (1-10),
    "analysis": string (documentation assessment),
    "suggestions": string[] (documentation improvement suggestions)
  },
  "samples": {
    "improvements": [
      {
        "file": string (filename),
        "code": string (suggested code),
        "explanation": string (why this improvement helps)
      }
    ]
  }
}` : `{
  "codeQuality": {
    "score": number (1-10),
    "analysis": string (overall code quality assessment),
    "recommendations": string[] (specific improvement recommendations)
  },
  "security": {
    "score": number (1-10),
    "vulnerabilities": string[] (potential security issues),
    "recommendations": string[] (security improvement recommendations)
  },
  "performance": {
    "score": number (1-10),
    "analysis": string (performance assessment),
    "recommendations": string[] (performance improvement recommendations)
  }
}`}`;

  return prompt;
}
