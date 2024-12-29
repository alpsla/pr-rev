import { PRAnalysis } from '../../../github/types/pr-analysis';
import { AnalysisInput, PromptContext } from '../../types/analysis';
import { generateBasePrompt } from './base';

function isPRAnalysis(analysis: AnalysisInput): analysis is PRAnalysis {
  return !('type' in analysis);
}

export function generateTypeScriptPrompt(analysis: AnalysisInput, context: PromptContext): string {
  // Only generate TypeScript-specific prompts for PR analysis
  if (!isPRAnalysis(analysis)) {
    return generateBasePrompt(analysis, context);
  }

  const basePrompt = generateBasePrompt(analysis, context);
  const tsFiles = analysis.diffAnalysis.changedFiles.filter(file =>
    file.filename.endsWith('.ts') || file.filename.endsWith('.tsx')
  );
  
  if (tsFiles.length === 0) {
    return basePrompt; // No TypeScript files changed, use base prompt
  }

  return `${basePrompt}

Additional TypeScript-Specific Review Criteria:

1. Type System Usage:
   - Proper type definitions and interfaces
   - Effective use of generics
   - Correct usage of union and intersection types
   - Appropriate use of type assertions
   - Type inference optimization
   - Strict null checks compliance

2. TypeScript Best Practices:
   - Proper usage of 'any' type (should be minimal)
   - Interface vs Type alias usage
   - Readonly properties where appropriate
   - Proper handling of optional properties
   - Discriminated unions for complex state
   - Proper error types and handling

3. Modern TypeScript Features:
   - Template literal types
   - Conditional types
   - Mapped types
   - Utility types usage (Pick, Omit, etc.)
   - Proper async/await implementation
   - Decorators usage if applicable

4. Common TypeScript Patterns:
   - Factory patterns implementation
   - Builder pattern usage
   - Dependency injection
   - Module organization
   - Proper export/import usage
   - Namespace organization

5. Framework-Specific Considerations:
   ${context.repository.techStack.includes('React') ? `
   React TypeScript Patterns:
   - Proper component prop types
   - Event handling types
   - Hook typing patterns
   - Context API typing
   - Higher-order component typing
   - Render prop patterns` : ''}
   
   ${context.repository.techStack.includes('Next.js') ? `
   Next.js TypeScript Patterns:
   - Page props typing
   - API route typing
   - GetServerSideProps/GetStaticProps typing
   - Dynamic route typing
   - Middleware typing` : ''}

6. Performance Considerations:
   - Type inference optimization
   - Import/export efficiency
   - Type-level computation complexity
   - Generic constraint optimization
   - Conditional type resolution

7. Testing Patterns:
   - Proper type mocking
   - Test utility types
   - Fixture type safety
   - Test case type coverage
   - Mock function typing

Please pay special attention to:
- Type safety vs code complexity balance
- Type inference optimization opportunities
- Generic type constraints and bounds
- Proper error type propagation
- Type guard implementation
- Discriminated union patterns
- Module augmentation usage
- Declaration merging patterns

For code suggestions, include TypeScript-specific improvements such as:
- Better type definitions
- More precise generic constraints
- Improved type guards
- Enhanced error type handling
- Optimized conditional types
- Better utility type usage`;
}
