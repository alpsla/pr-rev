import { RepositoryAnalysis } from '../../../github/types/repository';

export function generateRepositoryAnalysisPrompt(analysis: RepositoryAnalysis): string {
  const {
    name,
    description,
    language,
    topics,
    metrics,
    quality,
    security,
    dependencies,
    activity,
    techStack
  } = analysis;

  return `Repository Analysis Request for ${name}

Description: ${description || 'No description provided'}
Primary Language: ${language || 'Not specified'}
Topics: ${topics?.join(', ') || 'None'}
Tech Stack: ${techStack?.join(', ') || 'Not detected'}

Repository Metrics:
${metrics ? `
- Stars: ${metrics.stars || 0}
- Forks: ${metrics.forks || 0}
- Open Issues: ${metrics.openIssues || 0}
- Watchers: ${metrics.watchers || 0}
- Contributors: ${metrics.contributors || 0}
- Commit Frequency: ${metrics.commitFrequency || 0} commits/week
- Issue Resolution Time: ${metrics.issueResolutionTime || 0} days
- PR Merge Time: ${metrics.prMergeTime || 0} days` : 'Metrics not available'}

Code Quality Metrics:
${quality ? `
- Overall Code Quality: ${quality.codeQuality || 0}/100
- Test Coverage: ${quality.testCoverage || 0}%
- Documentation: ${quality.documentation || 0}/100
- Maintainability: ${quality.maintainability || 0}/100` : 'Quality metrics not available'}

Security Analysis:
${security ? `
- Vulnerabilities: ${security.vulnerabilities || 0}
- Security Score: ${security.securityScore || 0}/100
- Last Security Audit: ${security.lastAudit || 'Never'}` : 'Security analysis not available'}

Dependencies:
${dependencies ? `
- Total Dependencies: ${dependencies.total || 0}
- Outdated: ${dependencies.outdated || 0}
- Vulnerable: ${dependencies.vulnerable || 0}
- Direct Dependencies: ${dependencies.directDependencies || 0}
- Dev Dependencies: ${dependencies.devDependencies || 0}` : 'Dependency information not available'}

Activity:
${activity ? `
- Last Commit: ${activity.lastCommit || 'Unknown'}
- Last Release: ${activity.lastRelease || 'No releases'}
- Monthly Commits: ${activity.commitsLastMonth || 0}
- Monthly PRs: ${activity.prsLastMonth || 0}
- Monthly Issues: ${activity.issuesLastMonth || 0}` : 'Activity information not available'}

Please analyze this repository and provide:

1. Code Quality Assessment
   - Evaluate code organization and patterns
   - Assess test coverage and quality
   - Review documentation completeness
   - Identify technical debt areas
   - Suggest specific improvements

2. Security Review
   - Identify potential security concerns
   - Review authentication/authorization patterns
   - Assess data handling practices
   - Evaluate dependency security
   - Provide security enhancement recommendations

3. Performance Analysis
   - Identify potential bottlenecks
   - Review resource usage patterns
   - Assess scalability considerations
   - Evaluate caching strategies
   - Suggest optimization opportunities

4. Dependency Management
   - Review dependency health
   - Identify outdated packages
   - Flag security vulnerabilities
   - Check compatibility issues
   - Recommend updates/alternatives

5. Best Practices Evaluation
   - Check industry standards compliance
   - Review design pattern usage
   - Assess error handling
   - Evaluate logging/monitoring
   - Review CI/CD practices

6. Development Workflow
   - Analyze commit patterns
   - Review PR/issue management
   - Assess collaboration practices
   - Evaluate release process
   - Suggest workflow improvements

Please provide specific examples and actionable recommendations for each area. Include:
- Priority levels for issues (Critical/High/Medium/Low)
- Code snippets for problematic areas
- Specific steps for implementing improvements
- Risk assessment for suggested changes
- Timeline estimates for major improvements

Format the response as a structured analysis with clear sections and bullet points.`;
}
