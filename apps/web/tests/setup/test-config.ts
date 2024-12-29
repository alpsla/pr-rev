import { config } from 'dotenv';
import { resolve } from 'path';

// Load test environment variables from .env.test
config({
  path: resolve(__dirname, '../../.env.test')
});

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}\n` +
      'Make sure you have created a .env.test file based on .env.test.example'
    );
  }
}
