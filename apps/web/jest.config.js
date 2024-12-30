const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/test-config.ts',
    '<rootDir>/jest.setup.js'
  ],
  testEnvironment: 'jest-environment-jsdom',
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}'
  ],
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/supabase/',
    '/tests/integration/supabase',
    '/src/lib/supabase'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(next|@next|@babel|@swc|uuid|nanoid|@auth|@vercel|@edge-runtime|cookie|@microsoft|@azure|@aws-sdk|@google-cloud|@octokit|@actions|@primer|preact.*|next-auth)).*/'
  ],
  moduleNameMapper: {
    '^jose$': '<rootDir>/__mocks__/jose.js',
    '^preact-render-to-string$': '<rootDir>/__mocks__/preact-render-to-string.js',
    '^preact$': '<rootDir>/__mocks__/preact.js',
    '^preact/(.*)$': '<rootDir>/__mocks__/preact.js'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
        },
        transform: {
          react: {
            runtime: 'automatic'
          }
        }
      }
    }]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  maxWorkers: 1,
  testTimeout: 60000,
  forceExit: true,
  detectOpenHandles: true,
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: true
    }
  }
};

module.exports = createJestConfig(customJestConfig);
