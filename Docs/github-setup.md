# GitHub Setup Guide for PR Reviewer

This guide will help you set up your GitHub account to work with PR Reviewer, including access to private repositories.

## Prerequisites
- A GitHub account
- Admin access to the repositories you want to review
- (Optional) Organization admin access if using with organization repositories

## Setup Steps

### 1. Register OAuth Application in GitHub
1. Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Fill in the application details:
   - Application name: `PR Reviewer` (or your preferred name)
   - Homepage URL: `http://localhost:3000` (development) or your production URL
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Click "Register application"
4. Generate a client secret
   - Store this secret safely; you cannot view it again once you leave the page
   - If you need to replace it later, you can generate a new one

### 2. Environment Configuration

#### Development Setup
You'll need to configure environment variables in two places:

1. Root `.env` file (version controlled):
```env
ENABLE_PRIVATE_REPOS=true/false  # Default setting
```

2. `/apps/web/.env.local` file (not version controlled):
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
ENABLE_PRIVATE_REPOS=true/false  # Override for local development
```

**Important**: When changing `ENABLE_PRIVATE_REPOS`, update both files and restart the server.

### 3. Authorization Screens

#### Public Access Mode (`ENABLE_PRIVATE_REPOS=false`)
When you log in, GitHub will show:
```
PR Reviewer wants to access your account

Repositories
✓ Public repositories only

Personal user data
✓ Email addresses (read-only)
✓ Profile information (read-only)
```

#### Private Access Mode (`ENABLE_PRIVATE_REPOS=true`)
When enabled, GitHub will show:
```
PR Reviewer wants to access your account

Organizations and teams
✓ Read-only access

Personal user data
✓ Email addresses (read-only)
✓ Profile information (read-only)

Repositories
✓ Public and private repositories
```

### Important Notes
1. Environment Variables:
   - `.env` contains default values and is version controlled
   - `.env.local` contains local overrides and should not be committed
   - Changes require server restart to take effect

2. Changing Access Levels:
   - Update `ENABLE_PRIVATE_REPOS` in both files
   - Restart the development server
   - Sign out and sign back in
   - Approve new permissions on GitHub

3. Security:
   - Never commit `.env.local` or any secrets
   - Keep track of which repositories users can access
   - Review organization access carefully

### 4. Organization Access (Optional)
If you're using PR Reviewer with organization repositories:
1. Go to your Organization Settings → Third-party Access
2. Find PR Reviewer in the list
3. Click "Approve & Install"
4. Select the repositories you want to grant access to

### 5. Private Repository Access
For private repositories:
1. First login to PR Reviewer using your GitHub account
2. During first login, GitHub will show the requested permissions
3. Make sure to grant access to the private repositories you want to review
4. You can manage repository access later in GitHub Settings → Applications

### 6. Troubleshooting

#### Common Issues:
1. **"Repository not found" error**
   - Check if you've granted access to the repository
   - Verify you have the correct permissions in GitHub

2. **"Insufficient permissions" error**
   - Ensure you've approved all required OAuth scopes
   - Try logging out and logging back in

3. **Organization access issues**
   - Confirm organization admin has approved PR Reviewer
   - Check organization's third-party access settings

#### Updating Permissions
If you need to update permissions:
1. Go to GitHub Settings → Applications → Authorized OAuth Apps
2. Find PR Reviewer
3. Click to review and update permissions

## Support
If you encounter any issues not covered in this guide, please:
1. Check our GitHub Issues page
2. Contact our support team
3. Open a new issue with details about your problem