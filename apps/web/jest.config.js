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
  setupFilesAfterEnv: [
    '<rootDir>/src/lib/github/__tests__/setup.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  testTimeout: 10000
};
