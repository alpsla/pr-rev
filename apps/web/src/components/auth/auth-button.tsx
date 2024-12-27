'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '../ui/button';
import { GithubIcon, LogOutIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';

export function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  console.log('[auth-button] Session state:', {
    status,
    hasSession: !!session,
    accessToken: session?.accessToken ? `${session.accessToken.substring(0, 4)}...` : null,
    hasPrivateAccess: session?.user?.hasPrivateAccess,
    scope: session?.scope
  });

  const handleSignIn = async () => {
    console.log('[auth-button] Starting sign in');
    try {
      // Log environment variables
      console.log('[auth-button] Environment:', {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
      });

      // First, try to initiate GitHub OAuth flow
      const result = await signIn('github', {
        callbackUrl: '/dashboard',
        redirect: false,
      });
      
      console.log('[auth-button] Sign in result:', {
        success: !result?.error,
        error: result?.error,
        url: result?.url,
        status: result?.status,
        ok: result?.ok
      });

      if (result?.error) {
        console.error('[auth-button] Sign in error:', result.error);
        router.push(`/auth/error?error=${encodeURIComponent(result.error)}`);
      } else if (result?.url) {
        console.log('[auth-button] Redirecting to:', result.url);
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('[auth-button] Sign in error:', error);
      router.push('/auth/error');
    }
  };

  const handleSignOut = async () => {
    console.log('[auth-button] Starting sign out');
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      });
      console.log('[auth-button] Sign out successful');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('[auth-button] Sign out error:', error);
      router.push('/');
    }
  };

  if (status === 'loading') {
    console.log('[auth-button] Loading state');
    return <Skeleton className="h-10 w-[120px]" />;
  }

  if (session) {
    console.log('[auth-button] Rendering signed-in state');
    return (
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <LogOutIcon className="h-4 w-4" />
        Sign Out
      </Button>
    );
  }

  console.log('[auth-button] Rendering signed-out state');
  return (
    <Button
      onClick={handleSignIn}
      className="flex items-center gap-2"
    >
      <GithubIcon className="h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}
