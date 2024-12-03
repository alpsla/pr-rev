import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.accessToken) {
      console.log('Session check failed:', { hasEmail: !!session?.user?.email, hasToken: !!session?.accessToken });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Checking GitHub permissions with token:', session.accessToken.slice(0, 8) + '...');

    // 1. First check user data and scopes
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    console.log('User API Response:', {
      status: userResponse.status,
      headers: Object.fromEntries(userResponse.headers.entries()),
      scopes: userResponse.headers.get('x-oauth-scopes'),
      remaining: userResponse.headers.get('x-ratelimit-remaining'),
    });

    if (!userResponse.ok) {
      console.error('User API error:', await userResponse.text());
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: userResponse.status });
    }

    const userData = await userResponse.json();
    console.log('User Data:', {
      login: userData.login,
      type: userData.type,
      privateRepos: userData.total_private_repos,
      plan: userData.plan
    });

    // 2. Check private repos access explicitly
    const reposResponse = await fetch('https://api.github.com/user/repos?visibility=private&per_page=1', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    console.log('Private Repos Check:', {
      status: reposResponse.status,
      headers: Object.fromEntries(reposResponse.headers.entries()),
      remaining: reposResponse.headers.get('x-ratelimit-remaining'),
    });

    const reposData = await reposResponse.json();
    console.log('Private Repos Response:', {
      status: reposResponse.status,
      count: Array.isArray(reposData) ? reposData.length : 'not an array',
      error: !Array.isArray(reposData) ? reposData : undefined
    });

    // Get scopes from headers
    const scopesHeader = userResponse.headers.get('x-oauth-scopes') || '';
    const scopes = scopesHeader.split(',').map(s => s.trim()).filter(Boolean);

    // Determine actual access state
    const hasPrivateAccess = scopes.includes('repo') && reposResponse.status === 200;
    const canListPrivateRepos = Array.isArray(reposData) && reposResponse.status === 200;

    return NextResponse.json({
      hasPrivateAccess,
      totalPrivateRepos: userData.total_private_repos || 0,
      plan: userData.plan?.name || 'free',
      scopes,
      activePermissions: mapScopesToPermissions(scopes),
      currentAccess: {
        hasPrivateRepos: (userData.total_private_repos || 0) > 0,
        canAccessPrivateRepos: canListPrivateRepos
      },
      _debug: {
        userScopes: scopesHeader,
        privateReposStatus: reposResponse.status,
        canListPrivateRepos,
        userType: userData.type,
        rateLimits: {
          user: userResponse.headers.get('x-ratelimit-remaining'),
          repos: reposResponse.headers.get('x-ratelimit-remaining')
        }
      }
    });
  } catch (error) {
    console.error('Error in GitHub permissions check:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
}

function mapScopesToPermissions(scopes: string[]): string[] {
  const mappings: Record<string, string> = {
    'repo': 'Full control of private repositories',
    'public_repo': 'Access public repositories',
    'read:user': 'Read user profile data',
    'user:email': 'Access email addresses',
    'read:org': 'Read organization data'
  };

  return scopes.map(scope => mappings[scope] || scope).filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enablePrivateAccess } = await req.json();
    
    // Use space-separated scopes for GitHub OAuth URL
    const scopes = enablePrivateAccess
      ? 'read:user user:email read:org repo'  // Include repo scope for private access
      : 'read:user user:email read:org';      // Basic scopes only

    const authUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL + '/api/auth/callback/github')}`;

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Error updating GitHub permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    );
  }
}