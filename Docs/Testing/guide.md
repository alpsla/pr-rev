# Testing Guide

This guide explains how to set up and run tests for the PR Review project.

## Test Structure

The project uses a multi-layered testing approach:

```
apps/web/
├── src/
│   └── lib/
│       ├── github/
│       │   └── __tests__/      # Unit tests for GitHub functionality
│       └── supabase/
│           └── __tests__/      # Unit tests for Supabase functionality
└── tests/
    ├── integration/           # Integration tests
    │   ├── github.integration.test.ts
    │   └── supabase.integration.test.ts
    ├── setup/                # Test setup and utilities
    │   └── test-config.ts
    └── mocks/                # Global test mocks
```

## Setting Up Test Environment

1. Copy the test environment template:
   ```bash
   cp apps/web/.env.test.example apps/web/.env.test
   ```

2. Fill in the required environment variables in `.env.test`:
   - GitHub Configuration:
     - `GITHUB_TOKEN`: Your GitHub personal access token
     - `TEST_GITHUB_OWNER`: GitHub username for testing
     - `TEST_GITHUB_REPO`: Repository name for testing
     - `TEST_PR_NUMBER`: Pull request number for testing
   
   - Supabase Configuration:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   
   - Database Configuration:
     - `DATABASE_URL`: Your database connection string

## Running Tests

### Unit Tests
Run unit tests for specific modules:
```bash
# Run GitHub service tests
npm test src/lib/github/__tests__

# Run Supabase client tests
npm test src/lib/supabase/__tests__
```

### Integration Tests
Run integration tests:
```bash
# Run all integration tests
npm test tests/integration

# Run specific integration test
npm test tests/integration/github.integration.test.ts
```

### All Tests
Run all tests:
```bash
npm test
```

## Writing Tests

### Unit Tests
- Place unit tests in `__tests__` directories next to the code being tested
- Use descriptive test names that explain the expected behavior
- Mock external dependencies using Jest mock functions
- Follow the Arrange-Act-Assert pattern

Example:
```typescript
describe('GitHub Service', () => {
  it('should fetch repository details', async () => {
    // Arrange
    const service = new GitHubService(...);
    
    // Act
    const repo = await service.getRepository('owner', 'repo');
    
    // Assert
    expect(repo).toHaveProperty('id');
  });
});
```

### Integration Tests
- Place integration tests in `tests/integration`
- Use the test configuration utilities from `tests/setup/test-config.ts`
- Clean up test data after each test
- Test real interactions between services

Example:
```typescript
describe('GitHub Integration', () => {
  beforeAll(() => {
    const { prisma } = initTestClients();
  });

  afterEach(async () => {
    await cleanupTestData(prisma);
  });

  it('should store PR data in database', async () => {
    // Test code here
  });
});
```

### Test Data
- Use the test data generators in `tests/setup/test-config.ts`
- Keep test data isolated and cleaned up
- Use meaningful test data that represents real scenarios

Example:
```typescript
const testPlatform = generateTestPlatform({
  name: 'Custom Platform'
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from other tests

2. **Clean Up**: Always clean up test data in `afterEach` or `afterAll` blocks

3. **Meaningful Tests**: Write tests that verify business logic and user scenarios

4. **Error Cases**: Test both success and error scenarios

5. **Mock External Services**: Use mocks for external services in unit tests, but test real integrations in integration tests

6. **Descriptive Names**: Use clear test names that describe the expected behavior

7. **Maintainable Tests**: Keep tests simple and easy to understand

## Continuous Integration

Tests are run automatically on:
- Pull request creation/updates
- Push to main branch
- Release creation

The CI pipeline runs:
1. Linting
2. Unit tests
3. Integration tests
4. Type checking
