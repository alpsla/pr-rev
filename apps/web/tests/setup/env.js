const path = require('path');
const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({
  path: path.resolve(__dirname, '../../.env.test')
});

// Mock environment variables for testing
process.env = {
  ...process.env,
  GITHUB_APP_ID: process.env.GITHUB_APP_ID || 'test-app-id',
  GITHUB_APP_PRIVATE_KEY: process.env.GITHUB_APP_PRIVATE_KEY || 'test-private-key',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'test-client-id',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'test-client-secret',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'test-token',
  GITHUB_TEST_OWNER: process.env.GITHUB_TEST_OWNER || 'test-owner',
  GITHUB_TEST_REPO: process.env.GITHUB_TEST_REPO || 'test-repo',
  GITHUB_TEST_PR_NUMBER: process.env.GITHUB_TEST_PR_NUMBER || '1',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'
};
