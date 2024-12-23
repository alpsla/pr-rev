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