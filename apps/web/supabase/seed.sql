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
