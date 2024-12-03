# API Endpoints Documentation

## Base URL

Development (Local):
```
http://localhost:3000/api/v1
```

Production (When deployed):
```
https://api.pr-reviewer.dev/v1
```

Note: The base URL will vary depending on your environment:
- Local development: Use `http://localhost:3000/api/v1`
- Staging: Use your staging server URL
- Production: Use your production server URL

## Authentication

All API requests require authentication using a Bearer token in the Authorization header:

```http
Authorization: Bearer your_api_token
```

## Endpoints

### Pull Request Analysis

#### Create Analysis

```http
POST /analysis
```

Request body:
```json
{
  "repositoryUrl": "string",
  "pullRequestNumber": "number",
  "branch": "string",
  "settings": {
    "analysisDepth": "basic" | "detailed",
    "includeSuggestions": boolean,
    "includeSecurityCheck": boolean
  }
}
```

Response:
```json
{
  "analysisId": "string",
  "status": "queued",
  "estimatedTime": "number",
  "queuePosition": "number"
}
```

#### Get Analysis Status

```http
GET /analysis/{analysisId}
```

Response:
```json
{
  "analysisId": "string",
  "status": "queued" | "processing" | "completed" | "failed",
  "progress": "number",
  "estimatedTimeRemaining": "number"
}
```

#### Get Analysis Results

```http
GET /analysis/{analysisId}/results
```

Response:
```json
{
  "analysisId": "string",
  "summary": {
    "totalFiles": "number",
    "totalComments": "number",
    "severity": {
      "critical": "number",
      "major": "number",
      "minor": "number"
    }
  },
  "suggestions": [
    {
      "file": "string",
      "line": "number",
      "message": "string",
      "severity": "critical" | "major" | "minor",
      "category": "string"
    }
  ]
}
```

### Repository Settings

#### Get Repository Settings

```http
GET /repositories/{repositoryId}/settings
```

Response:
```json
{
  "repositoryId": "string",
  "settings": {
    "defaultAnalysisDepth": "basic" | "detailed",
    "autoAnalyze": boolean,
    "notificationSettings": {
      "email": boolean,
      "slack": boolean
    }
  }
}
```

#### Update Repository Settings

```http
PATCH /repositories/{repositoryId}/settings
```

Request body:
```json
{
  "settings": {
    "defaultAnalysisDepth": "basic" | "detailed",
    "autoAnalyze": boolean,
    "notificationSettings": {
      "email": boolean,
      "slack": boolean
    }
  }
}
```

### User Management

#### Get User Profile

```http
GET /user
```

Response:
```json
{
  "id": "string",
  "email": "string",
  "preferences": {
    "theme": "light" | "dark",
    "notifications": {
      "email": boolean,
      "slack": boolean
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request parameters"
  }
}
```

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 429 Too Many Requests
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retryAfter": "number"
  }
}
```

## Rate Limiting

- Rate limits are applied per API token
- Default rate limit: 100 requests per minute
- Rate limit headers are included in all responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Webhooks

### Webhook Events

The following events can trigger webhooks:

1. `analysis.completed`
2. `analysis.failed`
3. `repository.updated`
4. `user.settings.updated`

### Webhook Payload Format

```json
{
  "event": "string",
  "timestamp": "string",
  "data": {
    // Event-specific data
  }
}
```

## API Versioning

- API versioning is handled through the URL path
- Current version: `v1`
- Breaking changes will result in a new version number
- Multiple versions may be supported simultaneously