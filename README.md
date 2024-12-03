# PR Rev

A GitHub Pull Request Review application that helps you review PRs more efficiently.

## GitHub Access Configuration

The application supports two levels of repository access:

### 1. Basic Access (Default)
- **Scopes**: `read:user`, `user:email`
- **Capabilities**:
  - Access to public repositories
  - Read user profile information
  - Access user email addresses

### 2. Private Repository Access
- **Additional Scopes**: `repo`, `read:org`
- **Additional Capabilities**:
  - Full access to private repositories
  - Read organization and team membership
  - Read organization projects

### Managing Access Levels

Users can toggle between basic and private repository access in the Settings page:

1. Navigate to the Settings page
2. Find the "Private Repository Access" toggle
3. Switch the toggle to enable/disable private repository access
4. The application will automatically sign you out
5. Sign back in to apply the new permissions

**Note**: When switching from basic to private access, you'll need to authorize the additional GitHub permissions. This is a security measure required by GitHub OAuth.

## Setup

For setup instructions, including how to configure GitHub OAuth credentials, see our [GitHub Setup Guide](Docs/github-setup.md).

## Security

- Access tokens are securely stored in the session
- Scopes are dynamically requested based on user preferences
- The application never stores GitHub credentials
- All authentication is handled through GitHub OAuth
- Application configuration and secrets are managed securely by the application

## Features

- Automated code review using AI
- Detailed PR analysis and suggestions
- Modern web dashboard
- GitHub integration
- Performance metrics and analytics

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- pnpm (v8 or later)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pr-rev.git
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

4. Start the development server:
```bash
pnpm dev
```

## Project Structure

```
pr-reviewer/
├── apps/
│   ├── web/          # Frontend application
│   └── api/          # Backend API service
├── packages/
│   ├── ui/           # Shared UI components
│   ├── core/         # Core business logic
│   └── config/       # Shared configuration
├── docs/             # Documentation
└── tools/            # Development tools & scripts
```

## Development

- `pnpm dev`: Start development servers
- `pnpm build`: Build all packages and apps
- `pnpm test`: Run tests
- `pnpm lint`: Run linting
- `pnpm format`: Format code

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.
