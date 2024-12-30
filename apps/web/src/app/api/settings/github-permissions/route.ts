import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Session } from 'next-auth';
import { authOptions } from '../../../../lib/auth/auth-options';

interface CustomSession extends Omit<Session, 'user'> {
  accessToken?: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    hasPrivateAccess?: boolean;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = session.accessToken;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const scopes = response.headers.get('x-oauth-scopes')?.split(',').map(s => s.trim()) || [];
    const rateLimit = response.headers.get('x-ratelimit-remaining');

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to verify GitHub permissions' },
        { status: response.status }
      );
    }

    const userData = await response.json();

    // Check private repos access
    const reposResponse = await fetch('https://api.github.com/user/repos?type=private', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const reposRateLimit = reposResponse.headers.get('x-ratelimit-remaining');
    const canListPrivateRepos = reposResponse.status === 200;

    return NextResponse.json({
      hasPrivateAccess: scopes.includes('repo'),
      totalPrivateRepos: userData.total_private_repos || 0,
      plan: userData.plan?.name || 'free',
      scopes,
      activePermissions: scopes.map(scope => {
        switch (scope) {
          case 'repo':
            return 'Full control of private repositories';
          case 'read:user':
            return 'Read user profile data';
          default:
            return scope;
        }
      }),
      currentAccess: {
        hasPrivateRepos: userData.total_private_repos > 0,
        canAccessPrivateRepos: canListPrivateRepos
      },
      _debug: {
        userScopes: scopes.join(','),
        privateReposStatus: reposResponse.status,
        canListPrivateRepos,
        userType: userData.type,
        rateLimits: {
          user: rateLimit,
          repos: reposRateLimit
        }
      }
    });
  } catch (error) {
    console.error('Error checking GitHub permissions:', error);
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const scopes = body.enablePrivateAccess
      ? 'read:user user:email read:org repo'
      : 'read:user user:email read:org';

    const url = `https://github.com/login/oauth/authorize?` +
      `client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(`${process.env.NEXTAUTH_URL}/api/auth/callback/github`)}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    );
  }
}
