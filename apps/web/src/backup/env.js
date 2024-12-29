"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = exports.env = void 0;
var zod_1 = require("zod");
// Define the environment schema
var envSchema = zod_1.z.object({
    // Database
    DATABASE_URL: zod_1.z.string().url(),
    // GitHub OAuth
    GITHUB_CLIENT_ID: zod_1.z.string(),
    GITHUB_CLIENT_SECRET: zod_1.z.string(),
    // Authentication
    NEXTAUTH_URL: zod_1.z.string().url(),
    NEXTAUTH_SECRET: zod_1.z.string(),
    // Feature Flags
    ENABLE_PRIVATE_REPOS: zod_1.z.boolean().default(false),
    // API Keys
    CLAUDE_API_KEY: zod_1.z.string().optional(),
    // Environment
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
});
exports.envSchema = envSchema;
// Validate and export environment
exports.env = envSchema.parse(process.env);
