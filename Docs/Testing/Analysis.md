# Current Test Organization
/lib/github/__tests__/
├── contract/         # Contract tests
├── hybrid/          # Hybrid tests
├── integration/     # Integration tests
├── mocks/          # Multiple mock files
├── unit/           # Unit tests with many sub-categories
└── utils/          # Test utilities

Key Observations:
1. Test Fragmentation:
   - Multiple test categories (contract, hybrid, integration, unit)
   - Many separate unit test files for closely related functionality
   - Potential overlap between test types

2. Mock Structure Issues:
   - Multiple mock files (/mocks/ directory has 10+ files)
   - Separate mock utilities in different locations
   - Potential duplication between mocks

3. Test Utils Organization:
   - Multiple utility files (mock-factory.ts, mock-responses.ts, test-helpers.ts)
   - Possible overlapping functionality


   Simplified Test Structure:
   /tests
├── __mocks__/           # Single location for all mocks
│   ├── github.ts        # Consolidated GitHub mocks
│   └── prisma.ts        # Consolidated Prisma mocks
├── unit/                # Pure unit tests
├── integration/         # Integration tests
└── utils/              # Single utilities file


// Single mock factory pattern
export const createMock = {
  repository: (overrides?) => ({ ... }),
  pullRequest: (overrides?) => ({ ... }),
  user: (overrides?) => ({ ... })
};

// Single test utilities file
export const testUtils = {
  setup: () => ({ ... }),
  teardown: () => ({ ... }),
  helpers: { ... }
};