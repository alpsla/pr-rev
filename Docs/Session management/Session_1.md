# PR Review Application - Project Overview

## Project Description
An advanced web application that analyzes GitHub Pull Requests and generates comprehensive reports. 
The application performs dual analysis:
1. PR-specific changes analysis against the main branch
2. Whole project analysis including:
   - Code quality
   - Performance metrics
   - Security assessment
   - Dependency validation
   - Structure efficiency

## Key Features
- Language Support:
  - Multiple coding languages with specific tooling
  - Multi-language UI interface
  - Localization system for global users

- AI Integration:
  - Pluggable LLM agent architecture
  - Dynamic selection of best-performing AI models
  - Extensible analysis pipeline

- Export & Integration:
  - Direct GitHub PR comments
  - PDF report generation
  - Markdown download
  - Clipboard copy
  - Custom export formats (extensible)

## Technical Stack
- Frontend: Next.js with TypeScript
- UI: Tailwind CSS + shadcn/ui
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth with GitHub OAuth
- AI Integration: Pluggable LLM System
- Testing: Jest

## Current Project Status
- Core infrastructure completed
- Basic GitHub integration working
- Authentication and authorization implemented
- Database schema established
- UI components library integrated
- Localization support implemented

## Active Development Focus
- GitHub service layer reorganization
- Type system consolidation
- Service architecture improvement

## Repository Structure
```typescript
/src
├── app/                # Next.js app router
├── components/         # React components
├── lib/               # Core business logic
│   ├── github/        # GitHub integration (current focus)
│   ├── ai/            # LLM integration
│   └── export/        # Export services
└── types/             # TypeScript definitions


Current Work Chunk: GitHub Service Reorganization
Goals

Reorganize GitHub service layer
Consolidate type system
Improve service architecture

Scope

/src/lib/github/
├── services/          # Core service implementations
├── types/            # Consolidated type definitions
├── utils/            # Utility functions
└── constants/        # Configuration and constants

Next Steps

2. CI/CD Implementation

Pipeline Structure:
/github/workflows/
├── pr-validation.yml      # PR checks (tests, lint)
├── staging-deploy.yml     # Staging deployment
└── production-deploy.yml  # Production deployment

Environments:
- Development
- Staging
- Production

Session Goals

 Setup base CI/CD structure

 Update existing test.yml
 Create deployment workflows
 Configure environment secrets


 Begin GitHub service reorganization

 Create new directory structure
 Move and refactor types
 Setup service separation



Recovery Points

Original implementation: pass_58 branch
New feature branch: feature/github-reorg
CI/CD configurations tracked separately

Next Session Preparation

Review CI/CD best practices
Document environment variables needed
Plan deployment strategy

Notes

Keep CI/CD setup aligned with service reorganization
Consider monitoring and logging requirements
Plan for database migration handling