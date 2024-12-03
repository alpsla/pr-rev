'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { GithubIcon, LogOutIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Skeleton className="h-10 w-[120px]" />;
  }

  if (session) {
    return (
      <Button
        variant="outline"
        onClick={() => signOut()}
        className="flex items-center gap-2"
      >
        <LogOutIcon className="h-4 w-4" />
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      onClick={() => signIn('github')}
      className="flex items-center gap-2"
    >
      <GithubIcon className="h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}