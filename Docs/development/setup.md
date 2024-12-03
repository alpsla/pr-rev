# Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/pr-rev.git
cd pr-rev
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
CLAUDE_API_KEY=your_claude_api_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Environment Variables

### Generating Secure Secrets

For security-related environment variables like `JWT_SECRET` and `SESSION_SECRET`, you should use strong, random strings. Here's how to generate them:

#### Using Node.js
```bash
# Generate a secure random string for JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate another secure random string for SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example secrets (DO NOT use these in production):
```env
JWT_SECRET=64f5a0e2b3c7d1f8a9b2e4d6c8f3a7b5e9d2c4f6a8b1d3e5c7f9a2b4d6e8c0
SESSION_SECRET=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0
```

⚠️ **Important Security Notes:**
- Never commit real secrets to version control
- Generate unique secrets for each environment (development, staging, production)
- Rotate secrets periodically in production environments
- Use a secure secret management system in production

## Development Workflow

### Starting the Development Server

1. Run the development server:
```bash
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Linting and Type Checking

```bash
# Run ESLint
pnpm lint

# Run type checking
pnpm type-check
```

## Project Structure

```
pr-rev/
├── apps/
│   └── web/              # Next.js web application
├── packages/             # Shared packages
├── .github/             # GitHub Actions and configurations
├── Docs/               # Documentation
└── turbo.json          # Turborepo configuration
```

## Development Guidelines

### Code Style

- Follow the ESLint configuration
- Use TypeScript for type safety
- Follow the component structure in `apps/web/src/components`

### Git Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:
```bash
git add .
git commit -m "feat: your feature description"
```

3. Push your changes:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

### Commit Message Format

Follow the conventional commits specification:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance tasks

## Troubleshooting

### Common Issues

1. **pnpm install fails**
   - Clear pnpm cache: `pnpm store prune`
   - Delete node_modules: `rm -rf node_modules`
   - Try again: `pnpm install`

2. **Type errors**
   - Run `pnpm type-check` to see detailed errors
   - Ensure all dependencies are installed
   - Check for missing type definitions

### Getting Help

- Check existing GitHub issues
- Join our Discord community
- Create a new issue with detailed information

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

### Configuration

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}