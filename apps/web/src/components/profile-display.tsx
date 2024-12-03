'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

export function ProfileDisplay() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-muted h-12 w-12"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <p className="text-muted-foreground">Please sign in to view your profile.</p>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {session?.user?.image && (
        <Image
          src={session.user.image}
          alt={`${session.user.name}'s avatar`}
          width={48}
          height={48}
          className="rounded-full"
        />
      )}
      <div className="space-y-1">
        <h2 className="font-medium">{session?.user?.name}</h2>
        <p className="text-sm text-muted-foreground font-mono">{session?.user?.email}</p>
      </div>
    </div>
  );
}