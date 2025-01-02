import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth/auth-options';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get('callbackUrl');
    // Ensure we always request repo scope
    const requestedScope = searchParams.get('scope');
    const scope = requestedScope ? `${requestedScope} repo read:user user:email` : 'repo read:user user:email';

    console.log('[GitHub Auth] Initial request:', {
      hasSession: !!session,
      callbackUrl,
      requestedScope,
      finalScope: scope,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    if (session) {
      console.log('[GitHub Auth] Existing session:', {
        hasGithubToken: !!session.user?.githubToken,
        scope: session.user?.scope,
        hasPrivateAccess: session.user?.hasPrivateAccess
      });

      // If user is already signed in, redirect them
      if (callbackUrl) {
        console.log('[GitHub Auth] User already signed in, redirecting to:', callbackUrl);
        redirect(callbackUrl);
      }
      console.log('[GitHub Auth] User already signed in, redirecting to home');
      redirect('/');
    }

    // Get the current URL for the redirect_uri
    const currentUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const redirectUri = `${currentUrl}/api/auth/callback/github`;

    // Construct GitHub OAuth URL with proper scopes
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', process.env.GITHUB_ID || '');
    githubAuthUrl.searchParams.set('scope', scope);
    githubAuthUrl.searchParams.set('response_type', 'code');
    githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
    githubAuthUrl.searchParams.set('prompt', 'consent'); // Always show consent screen to ensure proper scopes

    if (callbackUrl) {
      // Store callback URL in state parameter
      const state = Buffer.from(JSON.stringify({ callbackUrl })).toString('base64');
      githubAuthUrl.searchParams.set('state', state);
    }

    console.log('[GitHub Auth] Redirecting to GitHub:', {
      url: githubAuthUrl.toString(),
      scope,
      callbackUrl,
      redirectUri,
      params: Object.fromEntries(githubAuthUrl.searchParams.entries())
    });

    redirect(githubAuthUrl.toString());
  } catch (error) {
    console.error('[GitHub Auth] Error:', error);
    redirect('/auth/error?error=GithubAuthError');
  }
}
