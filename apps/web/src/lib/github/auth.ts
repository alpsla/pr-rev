import { Account } from 'next-auth';
import { GitHubTokenData, GitHubAuthResult } from './types/auth';

export async function verifyGitHubAccess(accessToken: string): Promise<GitHubAuthResult> {
  console.log('[github-auth] Verifying GitHub access');
  
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  if (!response.ok) {
    console.error('[github-auth] Failed to verify access:', {
      status: response.status,
      statusText: response.statusText
    });
    throw new Error('Failed to verify GitHub access');
  }

  const scopesHeader = response.headers.get('x-oauth-scopes') || '';
  const scopes = scopesHeader.split(',').map(s => s.trim()).filter(Boolean);

  console.log('[github-auth] Verified scopes:', {
    raw: scopesHeader,
    parsed: scopes,
    hasPrivateAccess: scopes.includes('repo')
  });

  return {
    scope: scopesHeader,
    hasPrivateAccess: scopes.includes('repo')
  };
}

export function getGitHubTokenFromAccount(account: Account): GitHubTokenData | null {
  if (account.provider !== 'github' || !account.access_token) {
    return null;
  }

  return {
    accessToken: account.access_token,
    accessTokenExpires: account.expires_at,
    refreshToken: account.refresh_token,
    scope: account.scope || '',
    hasPrivateAccess: account.scope?.includes('repo') || false
  };
}
