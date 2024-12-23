import { z } from 'zod';

// Define the environment schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  
  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  
  // Feature Flags
  ENABLE_PRIVATE_REPOS: z.boolean().default(false),
  
  // API Keys
  CLAUDE_API_KEY: z.string().optional(),
  
  // Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Create type from schema
type Env = z.infer<typeof envSchema>;

// Validate and export environment
export const env = envSchema.parse(process.env) as Env;

// Type augmentation for process.env
declare global {
  type ProcessEnv = Env;
}

// Export schema for other uses
export { envSchema };