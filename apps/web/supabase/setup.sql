-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE platform_type AS ENUM ('GITHUB', 'GITLAB', 'AZURE_DEVOPS', 'BITBUCKET');
CREATE TYPE analysis_category AS ENUM ('CODE_QUALITY', 'DEPENDENCIES', 'PERFORMANCE', 'SECURITY', 'BEST_PRACTICES', 'DOCUMENTATION', 'TESTING');

-- Create platforms table
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type platform_type NOT NULL,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  config JSONB,
  capabilities JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create programming_languages table
CREATE TABLE programming_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  extensions TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT true,
  analyzers JSONB,
  patterns JSONB,
  best_practices JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create repositories table
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_id UUID NOT NULL REFERENCES platforms(id),
  external_id TEXT NOT NULL,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  last_analyzed TIMESTAMP WITH TIME ZONE,
  codebase_size INTEGER,
  primary_language_id UUID REFERENCES programming_languages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(platform_id, external_id),
  UNIQUE(platform_id, owner, name)
);

-- Create repository_languages table
CREATE TABLE repository_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID NOT NULL REFERENCES repositories(id),
  language_id UUID NOT NULL REFERENCES programming_languages(id),
  percentage DECIMAL NOT NULL,
  lines_of_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(repository_id, language_id)
);

-- Create pull_requests table
CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID NOT NULL REFERENCES repositories(id),
  external_id TEXT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  language_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(repository_id, external_id),
  UNIQUE(repository_id, number)
);

-- Create pr_languages table
CREATE TABLE pr_languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pull_request_id UUID NOT NULL REFERENCES pull_requests(id),
  language_id UUID NOT NULL REFERENCES programming_languages(id),
  lines_changed INTEGER NOT NULL,
  files_changed INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pull_request_id, language_id)
);

-- Create analysis_rule_sets table
CREATE TABLE analysis_rule_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category analysis_category NOT NULL,
  version TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  rules JSONB NOT NULL,
  thresholds JSONB NOT NULL,
  severity JSONB NOT NULL,
  language_overrides JSONB,
  description JSONB NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create category_analysis table
CREATE TABLE category_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category analysis_category NOT NULL,
  rule_set_id UUID NOT NULL REFERENCES analysis_rule_sets(id),
  findings JSONB NOT NULL,
  metrics JSONB NOT NULL,
  score DECIMAL,
  severity TEXT NOT NULL,
  report_id UUID NOT NULL,
  language_id UUID REFERENCES programming_languages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_platforms_updated_at
  BEFORE UPDATE ON platforms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programming_languages_updated_at
  BEFORE UPDATE ON programming_languages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repositories_updated_at
  BEFORE UPDATE ON repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repository_languages_updated_at
  BEFORE UPDATE ON repository_languages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pull_requests_updated_at
  BEFORE UPDATE ON pull_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pr_languages_updated_at
  BEFORE UPDATE ON pr_languages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_rule_sets_updated_at
  BEFORE UPDATE ON analysis_rule_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_analysis_updated_at
  BEFORE UPDATE ON category_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial data

-- Seed platforms
INSERT INTO platforms (type, name, enabled, config, capabilities) VALUES
('GITHUB', 'GitHub', true, 
  jsonb_build_object(
    'api_version', 'v3',
    'base_url', 'https://api.github.com'
  ),
  jsonb_build_object(
    'pull_requests', true,
    'code_review', true,
    'webhooks', true
  )
),
('GITLAB', 'GitLab', false, 
  jsonb_build_object(
    'api_version', 'v4'
  ),
  jsonb_build_object(
    'pull_requests', true,
    'code_review', true,
    'webhooks', true
  )
);

-- Seed programming languages
INSERT INTO programming_languages (name, extensions, enabled, analyzers, patterns, best_practices) VALUES
('JavaScript', ARRAY['.js', '.jsx', '.mjs'], true,
  jsonb_build_object(
    'eslint', true,
    'prettier', true
  ),
  jsonb_build_object(
    'async_await', 'Use async/await instead of callbacks',
    'const_let', 'Prefer const over let when possible'
  ),
  jsonb_build_object(
    'error_handling', 'Always use try-catch with async operations',
    'type_checking', 'Use TypeScript or JSDoc for type safety'
  )
),
('TypeScript', ARRAY['.ts', '.tsx'], true,
  jsonb_build_object(
    'eslint', true,
    'prettier', true,
    'tsc', true
  ),
  jsonb_build_object(
    'strict_types', 'Enable strict type checking',
    'interfaces', 'Use interfaces for object shapes'
  ),
  jsonb_build_object(
    'null_checks', 'Use strict null checks',
    'type_inference', 'Let TypeScript infer types when obvious'
  )
),
('Python', ARRAY['.py'], true,
  jsonb_build_object(
    'pylint', true,
    'black', true,
    'mypy', true
  ),
  jsonb_build_object(
    'type_hints', 'Use type hints for better code clarity',
    'list_comprehension', 'Use list comprehensions when appropriate'
  ),
  jsonb_build_object(
    'pep8', 'Follow PEP 8 style guide',
    'docstrings', 'Document functions and classes with docstrings'
  )
);

-- Seed analysis rule sets
INSERT INTO analysis_rule_sets (category, version, rules, thresholds, severity, description, tags) VALUES
('CODE_QUALITY', '1.0.0',
  jsonb_build_object(
    'complexity', jsonb_build_object(
      'cyclomatic', 'Function cyclomatic complexity should be less than 10',
      'cognitive', 'Function cognitive complexity should be less than 15'
    ),
    'duplication', jsonb_build_object(
      'threshold', 'No more than 3 duplicated blocks',
      'min_lines', 'Minimum 6 lines for duplication check'
    )
  ),
  jsonb_build_object(
    'complexity_threshold', 10,
    'duplication_threshold', 3
  ),
  jsonb_build_object(
    'high', 'Must fix before merge',
    'medium', 'Should fix before merge',
    'low', 'Consider fixing'
  ),
  jsonb_build_object(
    'en', 'Code quality analysis ruleset',
    'description', 'Analyzes code quality metrics including complexity and duplication'
  ),
  ARRAY['quality', 'complexity', 'duplication']
),
('BEST_PRACTICES', '1.0.0',
  jsonb_build_object(
    'naming', jsonb_build_object(
      'camelCase', 'Use camelCase for variable names',
      'PascalCase', 'Use PascalCase for class names'
    ),
    'comments', jsonb_build_object(
      'required', 'Functions must have JSDoc comments',
      'format', 'Comments should explain why, not what'
    )
  ),
  jsonb_build_object(
    'naming_violations_threshold', 5,
    'comment_coverage_threshold', 0.8
  ),
  jsonb_build_object(
    'high', 'Must fix before merge',
    'medium', 'Should fix before merge',
    'low', 'Consider fixing'
  ),
  jsonb_build_object(
    'en', 'Best practices ruleset',
    'description', 'Enforces coding best practices and conventions'
  ),
  ARRAY['best-practices', 'naming', 'documentation']
);
