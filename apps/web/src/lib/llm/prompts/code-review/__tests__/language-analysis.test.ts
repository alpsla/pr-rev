import { analyzeLanguages, SUPPORTED_LANGUAGES } from '../language-analysis';
import { PRAnalysis } from '../../../../github/types/pr-analysis';

describe('Language Analysis', () => {
  const createMockPRAnalysis = (files: Array<{ filename: string }>): PRAnalysis => ({
    id: 1,
    number: 1,
    title: 'Test PR',
    body: 'Test description',
    state: 'open',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    closedAt: null,
    mergedAt: null,
    draft: false,
    user: {
      login: 'test-user',
      id: 1,
      node_id: 'test-node',
      avatar_url: '',
      gravatar_id: '',
      url: '',
      html_url: '',
      followers_url: '',
      following_url: '',
      gists_url: '',
      starred_url: '',
      subscriptions_url: '',
      organizations_url: '',
      repos_url: '',
      events_url: '',
      received_events_url: '',
      type: 'User',
      site_admin: false
    },
    diffAnalysis: {
      filesChanged: files.length,
      additions: 100,
      deletions: 50,
      changedFiles: files.map(f => ({
        sha: 'test-sha',
        filename: f.filename,
        status: 'modified',
        additions: 10,
        deletions: 5,
        changes: 15,
        patch: '@@ test patch'
      })),
      binaryFiles: 0,
      renamedFiles: 0
    },
    impactMetrics: {
      complexity: 5,
      risk: 3,
      testCoverage: 80,
      documentation: 70
    },
    reviewHistory: {
      approvalCount: 0,
      changesRequestedCount: 0,
      reviewers: [],
      reviews: []
    },
    automatedChecks: {
      status: 'success',
      testResults: {
        passed: 10,
        failed: 0,
        skipped: 0,
        coverage: 80
      },
      lintingErrors: 0,
      securityIssues: 0
    }
  });

  describe('Single Language Detection', () => {
    it('should detect TypeScript files correctly', () => {
      const analysis = createMockPRAnalysis([
        { filename: 'src/app.ts' },
        { filename: 'src/components/Button.tsx' }
      ]);

      const result = analyzeLanguages(analysis);

      expect(result.primaryLanguage).toBe('TypeScript');
      expect(result.languages).toHaveLength(1);
      expect(result.languages[0]).toEqual({
        name: 'TypeScript',
        percentage: 100,
        files: ['src/app.ts', 'src/components/Button.tsx'],
        primaryInChanges: true
      });
    });

    it('should detect Python files correctly', () => {
      const analysis = createMockPRAnalysis([
        { filename: 'src/main.py' },
        { filename: 'tests/test_main.py' }
      ]);

      const result = analyzeLanguages(analysis);

      expect(result.primaryLanguage).toBe('Python');
      expect(result.languages).toHaveLength(1);
      expect(result.frameworks).toContain('Django');
      expect(result.buildTools).toContain('pip');
    });
  });

  describe('Multi-Language Detection', () => {
    it('should handle multiple languages with correct percentages', () => {
      const analysis = createMockPRAnalysis([
        { filename: 'src/app.ts' },
        { filename: 'src/styles.css' },
        { filename: 'scripts/build.sh' },
        { filename: 'src/app.ts' }
      ]);

      const result = analyzeLanguages(analysis);

      expect(result.languages).toHaveLength(2); // TypeScript and Bash
      expect(result.primaryLanguage).toBe('TypeScript');
      
      const typescript = result.languages.find(l => l.name === 'TypeScript');
      const bash = result.languages.find(l => l.name === 'Bash');

      expect(typescript).toBeDefined();
      expect(typescript?.percentage).toBe(50);
      expect(bash).toBeDefined();
      expect(bash?.percentage).toBe(50);
    });

    it('should detect frameworks across multiple languages', () => {
      const analysis = createMockPRAnalysis([
        { filename: 'src/App.tsx' },
        { filename: 'api/main.py' },
        { filename: 'src/App.tsx' }
      ]);

      const result = analyzeLanguages(analysis);

      expect(result.frameworks).toContain('React'); // From TypeScript
      expect(result.frameworks).toContain('Django'); // From Python
      expect(result.languages).toHaveLength(2);
    });
  });

  describe('Framework and Build Tool Detection', () => {
    it('should detect multiple frameworks for the same language', () => {
      const analysis = createMockPRAnalysis([
        { filename: 'src/App.tsx' },
        { filename: 'pages/index.tsx' }
      ]);

      const result = analyzeLanguages(analysis);

      expect(result.frameworks).toContain('React');
      expect(result.frameworks).toContain('Next.js');
      expect(result.buildTools).toContain('webpack');
      expect(result.buildTools).toContain('tsc');
    });

    it('should detect build tools for each language', () => {
      const analysis = createMockPRAnalysis([
        { filename: 'src/main.rs' },
        { filename: 'src/lib.rs' }
      ]);

      const result = analyzeLanguages(analysis);

      expect(result.buildTools).toContain('cargo');
      expect(result.buildTools).toContain('rustc');
    });
  });

  describe('Unsupported Languages', () => {
    it('should track unsupported file extensions', () => {
      const analysis = createMockPRAnalysis([
        { filename: 'src/app.ts' },
        { filename: 'data.xyz' },
        { filename: 'script.unknown' }
      ]);

      const result = analyzeLanguages(analysis);

      expect(result.unsupportedLanguages).toContain('xyz');
      expect(result.unsupportedLanguages).toContain('unknown');
      expect(result.languages).toHaveLength(1); // Only TypeScript should be detected
    });

    it('should handle files without extensions', () => {
      const analysis = createMockPRAnalysis([
        { filename: 'src/app.ts' },
        { filename: 'Dockerfile' },
        { filename: 'README' }
      ]);

      const result = analyzeLanguages(analysis);

      expect(result.languages).toHaveLength(1); // Only TypeScript
      expect(result.unsupportedLanguages).toHaveLength(0); // No extensions to track
    });
  });

  describe('Language Support Verification', () => {
    it('should support all documented languages', () => {
      // Get unique list of languages from the extensions
      const supportedExtensions = Object.values(SUPPORTED_LANGUAGES).flatMap(lang => 
        lang.extensions.map(ext => ext.slice(1)) // Remove the dot
      );

      // Create a mock analysis with one file of each type
      const analysis = createMockPRAnalysis(
        supportedExtensions.map(ext => ({ filename: `test.${ext}` }))
      );

      const result = analyzeLanguages(analysis);

      // Verify each language is detected
      Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
        expect(
          result.languages.map(l => l.name)
        ).toContain(lang);
      });
    });

    it('should include appropriate frameworks for each language', () => {
      // Test each language's frameworks
      Object.values(SUPPORTED_LANGUAGES).forEach(config => {
        const extensions = config.extensions.map(ext => ext.slice(1));
        const analysis = createMockPRAnalysis(
          extensions.map(ext => ({ filename: `test.${ext}` }))
        );

        const result = analyzeLanguages(analysis);
        
        config.frameworks.forEach(framework => {
          expect(result.frameworks).toContain(framework);
        });
      });
    });

    it('should include appropriate build tools for each language', () => {
      // Test each language's build tools
      Object.values(SUPPORTED_LANGUAGES).forEach(config => {
        const extensions = config.extensions.map(ext => ext.slice(1));
        const analysis = createMockPRAnalysis(
          extensions.map(ext => ({ filename: `test.${ext}` }))
        );

        const result = analyzeLanguages(analysis);
        
        config.buildTools.forEach(tool => {
          expect(result.buildTools).toContain(tool);
        });
      });
    });
  });
});
