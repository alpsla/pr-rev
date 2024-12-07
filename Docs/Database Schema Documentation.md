# PR Review System - Database Schema Documentation

## Table of Contents
1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Core Models](#core-models)
4. [Supporting Models](#supporting-models)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Data Management](#data-management)

## Overview

This document outlines the comprehensive database schema for the PR Review system. The schema is designed to support:
- Multi-platform integration (GitHub, GitLab, etc.)
- Multi-language support (both programming and UI languages)
- Comprehensive analysis categories
- Detailed reporting system

## Core Features

### 1. Platform Support
Enables integration with multiple code hosting platforms.

```prisma
enum Platform {
  GITHUB
  GITLAB
  AZURE_DEVOPS
  BITBUCKET
}

model Platform {
  id            String   @id @default(cuid())
  type          Platform
  name          String
  enabled       Boolean  @default(true)
  config        Json?    // Platform-specific configuration
  capabilities  Json?    // Platform features support
  repositories  Repository[]
}
```

### 2. Language Support
Handles both UI languages and programming languages.

```prisma
enum UILanguage {
  EN    // English
  ES    // Spanish
}

model ProgrammingLanguage {
  id            String   @id @default(cuid())
  name          String   // e.g., "Python", "JavaScript"
  extensions    String[] // File extensions
  enabled       Boolean  @default(true)
  analyzers     Json?    // Language-specific analyzers
  patterns      Json?    // Common patterns
  bestPractices Json?    // Language-specific best practices
  repositories  RepositoryLanguage[]
  pullRequests  PRLanguage[]
}
```

### 3. Analysis Categories
Supports various types of code analysis.

```prisma
enum AnalysisCategory {
  CODE_QUALITY
  DEPENDENCIES
  PERFORMANCE
  SECURITY
  BEST_PRACTICES
  DOCUMENTATION
  TESTING
}

model AnalysisRuleSet {
  id          String   @id @default(cuid())
  category    AnalysisCategory
  version     String
  isActive    Boolean  @default(true)
  rules       Json
  thresholds  Json
  severity    Json
  languageOverrides Json?
  description Json
  tags        String[]
}
```

## Core Models

### Repository
Central model for repository data.

```prisma
model Repository {
  id            String   @id @default(cuid())
  platformId    String
  platform      Platform @relation(fields: [platformId], references: [id])
  externalId    String
  owner         String
  name          String
  
  // Analysis data
  lastAnalyzed  DateTime?
  codebaseSize  Int?
  languages     RepositoryLanguage[]
  primaryLanguageId String?
  primaryLanguage   ProgrammingLanguage? @relation(fields: [primaryLanguageId], references: [id])
  
  // Relations
  pullRequests  PullRequest[]
  analyses      RepositoryAnalysis[]
  
  @@unique([platformId, externalId])
  @@unique([platformId, owner, name])
}
```

### Pull Request
Stores PR-specific information.

```prisma
model PullRequest {
  id            String   @id @default(cuid())
  repositoryId  String
  repository    Repository @relation(fields: [repositoryId], references: [id])
  externalId    String
  number        Int
  
  // PR data
  title         String
  description   String?
  author        String
  createdAt     DateTime @default(now())
  
  // Analysis data
  languages     PRLanguage[]
  languageAnalysis Json?
  
  @@unique([repositoryId, externalId])
  @@unique([repositoryId, number])
}
```

### Analysis Results
Stores category-specific analysis results.

```prisma
model CategoryAnalysis {
  id            String   @id @default(cuid())
  category      AnalysisCategory
  createdAt     DateTime @default(now())
  
  ruleSetId     String
  ruleSet       AnalysisRuleSet @relation(fields: [ruleSetId], references: [id])
  
  findings      Json
  metrics       Json
  score         Float?
  severity      String
  
  reportId      String
  report        Report  @relation(fields: [reportId], references: [id])
  
  languageId    String?
  language      ProgrammingLanguage? @relation(fields: [languageId], references: [id])
}
```

### Reports
Comprehensive reporting system.

```prisma
model Report {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  type          ReportType
  status        ReportStatus
  version       Int      @default(1)
  
  title         String
  summary       String?
  content       Json
  format        String?
  
  uiLanguage    UILanguage @default(EN)
  translations  ReportTranslation[]
  
  categoryAnalyses CategoryAnalysis[]
  categorySummaries Json
  
  overallScore     Float?
  criticalIssues   Int     @default(0)
  majorIssues      Int     @default(0)
  minorIssues      Int     @default(0)
  
  platformId    String?
  platform      Platform? @relation(fields: [platformId], references: [id])
  repositoryId  String?
  repository    Repository? @relation(fields: [repositoryId], references: [id])
  
  comments      ReportComment[]
}
```

## Supporting Models

### Language Mappings
Track language usage in repositories and PRs.

```prisma
model RepositoryLanguage {
  id            String   @id @default(cuid())
  repositoryId  String
  repository    Repository @relation(fields: [repositoryId], references: [id])
  languageId    String
  language      ProgrammingLanguage @relation(fields: [languageId], references: [id])
  percentage    Float
  linesOfCode   Int?
  
  @@unique([repositoryId, languageId])
}

model PRLanguage {
  id            String   @id @default(cuid())
  pullRequestId String
  pullRequest   PullRequest @relation(fields: [pullRequestId], references: [id])
  languageId    String
  language      ProgrammingLanguage @relation(fields: [languageId], references: [id])
  linesChanged  Int
  filesChanged  Int
  
  @@unique([pullRequestId, languageId])
}
```

### User Preferences
Manage user-specific settings.

```prisma
model UserCategoryPreferences {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  preferences Json
  thresholds  Json?
  
  @@unique([userId])
}
```

### Notifications
Handle analysis notifications.

```prisma
model CategoryNotification {
  id        String   @id @default(cuid())
  category  AnalysisCategory
  severity  String
  title     Json
  message   Json
  reportId  String
  report    Report @relation(fields: [reportId], references: [id])
  userId    String
  user      User   @relation(fields: [userId], references: [id])
}
```

## Implementation Guidelines

### 1. Platform Integration
- Implement platform-specific API clients
- Handle authentication per platform
- Map platform-specific data to common models

### 2. Language Support
- Implement language detection
- Configure language-specific analyzers
- Handle translations and localization

### 3. Analysis Categories
- Implement category-specific analysis rules
- Handle rule versioning
- Support custom thresholds

### 4. Reporting
- Generate comprehensive reports
- Support multiple formats
- Handle translations

## Data Management

### 1. Performance Considerations
- Index frequently queried fields
- Cache analysis results
- Optimize large JSON fields

### 2. Data Retention
- Archive old reports
- Clean up draft reports
- Maintain analysis history

### 3. Security
- Encrypt sensitive data
- Handle platform tokens securely
- Implement proper access controls