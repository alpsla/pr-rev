# PR Review

A modern pull request review tool that integrates with GitHub and provides intelligent code review suggestions.

## Features

- GitHub Integration
- Intelligent Code Review
- Custom Review Rules
- Multiple Language Support
- Team Collaboration

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- GitHub Account
- Supabase Account

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
cp apps/web/.env.example apps/web/.env.local
```

Fill in your environment variables in `.env.local`.

4. Start the development server:
```bash
pnpm dev
```

## Testing

We use Jest for testing and follow a comprehensive testing strategy including unit tests and integration tests.

### Setting Up Test Environment

1. Copy the test environment template:
```bash
cp apps/web/.env.test.example apps/web/.env.test
```

2. Fill in the test environment variables (see [Testing Guide](docs/Testing/guide.md) for details)

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test apps/web/src/lib/github/__tests__

# Run integration tests
pnpm test apps/web/tests/integration
```

For detailed testing information, see our [Testing Guide](docs/Testing/guide.md).

## Project Structure

```
apps/
├── web/                 # Next.js web application
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   └── lib/        # Core libraries
│   └── tests/          # Integration tests
└── api/                # API service (if needed)

packages/
├── ui/                 # Shared UI components
├── config/            # Shared configuration
└── types/             # Shared TypeScript types
```

## Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and write tests

3. Run tests and linting:
```bash
pnpm test
pnpm lint
```

4. Submit a pull request

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
