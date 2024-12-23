/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './babel.config.js' }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@octokit|@babel/runtime|@babel/runtime-corejs3|universal-user-agent|before-after-hook|is-plain-object|node-fetch|once|wrappy|tr46|whatwg-url|webidl-conversions)/)'
  ],
  // Ensure mocks are loaded first
  setupFiles: ['<rootDir>/__mocks__/@prisma/client.ts'],
  setupFilesAfterEnv: [
    '<rootDir>/src/lib/github/__tests__/setup.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // Add moduleDirectories to ensure mocks are found
  moduleDirectories: ['node_modules', '<rootDir>/__mocks__'],
  // Explicitly set the mock path
  modulePaths: ['<rootDir>/__mocks__'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  testTimeout: 10000,
  automock: false,
  resetMocks: false,
  restoreMocks: false,
  // Add clearMocks to ensure clean state between tests
  clearMocks: true
};
