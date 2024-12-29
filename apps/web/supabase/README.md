# Supabase Setup

This directory contains the database schema and setup files for the PR Review Assistant's Supabase integration.

## Structure

```
supabase/
├── migrations/           # Database migrations
│   └── 20231225_initial_schema.sql  # Initial schema setup
├── seed.sql             # Seed data for development
└── README.md            # This file
```

## Setup Instructions

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)

2. Get your project configuration:
   - Go to Project Settings > API
   - Copy the Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Copy the `anon` public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Copy the `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`)

3. Add the configuration to your `.env` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Database Setup

### Running Migrations

1. Connect to your Supabase project's SQL editor
2. Copy the contents of `migrations/20231225_initial_schema.sql`
3. Run the SQL commands to create the database schema

### Loading Seed Data

1. Connect to your Supabase project's SQL editor
2. Copy the contents of `seed.sql`
3. Run the SQL commands to populate initial data

## Schema Overview

### Core Tables

- `platforms`: Supported code hosting platforms (GitHub, GitLab, etc.)
- `programming_languages`: Supported programming languages and their configurations
- `repositories`: Code repositories being analyzed
- `pull_requests`: Pull requests being reviewed

### Analysis Tables

- `analysis_rule_sets`: Sets of rules for different types of analysis
- `category_analysis`: Results of analysis runs
- `repository_languages`: Language statistics for repositories
- `pr_languages`: Language statistics for pull requests

## Type Generation

The database types are automatically generated in `src/lib/supabase/types.ts`. These types are used by the Supabase client to provide type safety when interacting with the database.

## Development Workflow

1. Make changes to the schema by creating new migration files
2. Apply migrations to your development database
3. Update seed data if necessary
4. Update the TypeScript types if you've made schema changes

## Common Tasks

### Adding a New Table

1. Create a new migration file with the table definition
2. Add the table to the TypeScript types
3. Update the seed data if needed
4. Add any necessary database operations to the Supabase client

### Modifying Existing Tables

1. Create a new migration file with the ALTER TABLE commands
2. Update the TypeScript types to reflect the changes
3. Update any affected seed data
4. Update any affected database operations in the Supabase client

## Security Considerations

- The `anon` key is safe to use in the browser but has limited permissions
- The `service_role` key has admin privileges and should only be used server-side
- Always use RLS (Row Level Security) policies for sensitive data
- Keep your environment variables secure and never commit them to version control
