import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { Octokit } from '@octokit/rest';

interface GitHubUrlParts {
  owner: string;
  repo: string;
  number?: string;
}

function parseGitHubUrl(url: string): GitHubUrlParts {
  const urlObj = new URL(url);
  const parts = urlObj.pathname.split('/').filter(Boolean);

  if (urlObj.hostname !== 'github.com' || parts.length < 4) {
    throw new Error('Invalid GitHub URL format');
  }

  return {
    owner: parts[0],
    repo: parts[1],
    number: parts[3],
  };
}

export async function POST(req: Request) {
  console.log('[check-access] Starting repository access check');
  
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);
    console.log('[check-access] Session state:', {
      exists: !!session,
      hasAccessToken: !!session?.accessToken,
      hasError: !!session?.error,
      error: session?.error,
      scope: session?.scope,
      user: {
        name: session?.user?.name,
        email: session?.user?.email,
        hasPrivateAccess: session?.user?.hasPrivateAccess
      }
    });

    // Check for token expiration error
    if (session?.error === 'RefreshAccessTokenError') {
      console.log('[check-access] Token expired, requesting re-authentication');
      return NextResponse.json({ 
        error: 'Token expired',
        needsReauth: true,
        message: 'Your session has expired. Please sign in again.'
      }, { status: 401 });
    }

    // Get access token from session
    const accessToken = session?.accessToken;
    
    if (!accessToken) {
      console.log('[check-access] Authentication state:', {
        hasSession: !!session,
        hasAccessToken: false,
        hasUser: !!session?.user,
        scopes: session?.scope
      });
      return NextResponse.json({ error: 'Unauthorized - No access token' }, { status: 401 });
    }

    const { url } = await req.json();
    console.log('[check-access] Checking URL:', url);
    
    if (!url) {
      console.log('[check-access] No URL provided');
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let urlParts;
    try {
      urlParts = parseGitHubUrl(url);
      console.log('[check-access] Parsed URL parts:', urlParts);
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error 
        ? parseError.message 
        : 'Invalid GitHub URL';
      
      console.log('[check-access] URL parsing error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { owner, repo } = urlParts;

    // Initialize Octokit with user's access token
    const octokit = new Octokit({
      auth: accessToken,
      log: {
        debug: (msg: string) => console.debug(`[GitHub] ${msg}`),
        info: (msg: string) => console.info(`[GitHub] ${msg}`),
        warn: (msg: string) => console.warn(`[GitHub] ${msg}`),
        error: (msg: string) => console.error(`[GitHub] ${msg}`),
      }
    });

    try {
      // Check repository access
      const { data: repository } = await octokit.repos.get({ owner, repo });
      console.log('[check-access] Repository data:', {
        isPrivate: repository.private,
        hasPrivateAccess: session?.user?.hasPrivateAccess,
        permissions: repository.permissions
      });

      if (repository.private && !session?.user?.hasPrivateAccess) {
        console.log('[check-access] Private repository access denied');
        return NextResponse.json({
          needsAccess: true,
          isPrivate: true,
          message: "This is a private repository. Please configure private repository access in Settings to continue."
        });
      }

      // Check pull request access if PR number is provided
      if (urlParts.number) {
        const prNumber = parseInt(urlParts.number, 10);
        if (!isNaN(prNumber)) {
          const { data: pullRequest } = await octokit.pulls.get({
            owner,
            repo,
            pull_number: prNumber
          });
          console.log('[check-access] Pull request data:', {
            number: pullRequest.number,
            state: pullRequest.state,
            draft: pullRequest.draft
          });
        }
      }

      console.log('[check-access] Repository access check successful');
      return NextResponse.json({ needsAccess: false });

    } catch (error) {
      if (error instanceof Error && error.message.includes('Not Found')) {
        console.log('[check-access] Repository not found or no access');
        return NextResponse.json({
          needsAccess: true,
          isPrivate: true,
          message: "Unable to access this repository. Please verify the URL and your permissions."
        });
      }

      console.error('[check-access] Error checking repository access:', error);
      throw error;
    }
  } catch (error) {
    console.error('[check-access] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to check repository access' },
      { status: 500 }
    );
  }
}
