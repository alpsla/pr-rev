const requiredServerEnvs = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
} as const;

const requiredPublicEnvs = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

// Validate server-side environment variables
Object.entries(requiredServerEnvs).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required server environment variable: ${key}`);
  }
});

// Validate client-side environment variables
Object.entries(requiredPublicEnvs).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required public environment variable: ${key}`);
  }
});

// Feature flags
const featureFlags = {
  enablePrivateRepos: process.env.ENABLE_PRIVATE_REPOS === 'true',
  enableMultiLanguage: process.env.ENABLE_MULTI_LANGUAGE === 'true',
} as const;

// Database configuration
const database = {
  url: requiredServerEnvs.DATABASE_URL,
} as const;

// Supabase configuration
const supabase = {
  url: requiredPublicEnvs.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: requiredPublicEnvs.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: requiredServerEnvs.SUPABASE_SERVICE_ROLE_KEY,
} as const;

// GitHub configuration
const github = {
  clientId: requiredServerEnvs.GITHUB_ID,
  clientSecret: requiredServerEnvs.GITHUB_SECRET,
} as const;

// Auth configuration
const auth = {
  nextAuthUrl: requiredServerEnvs.NEXTAUTH_URL,
  nextAuthSecret: requiredServerEnvs.NEXTAUTH_SECRET,
} as const;

export const config = {
  env: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  features: featureFlags,
  database,
  supabase,
  github,
  auth,
} as const;

// Type helper for environment variables
type Config = typeof config;
export type { Config };
