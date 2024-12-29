'use client';

import { signIn, useSession } from 'next-auth/react';
import { Button } from '../ui/button';
import { LockIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PrivateAccessButtonProps {
  repoIsPrivate: boolean;
  owner: string;
  repo: string;
}

export function PrivateAccessButton({ repoIsPrivate, owner, repo }: PrivateAccessButtonProps) {
  const { data: session } = useSession();
  const [isRequesting, setIsRequesting] = useState(false);
  const router = useRouter();

  // Don't show if user already has private access or repo is public
  if (!repoIsPrivate || session?.user?.hasPrivateAccess) {
    return null;
  }

  const handleRequestAccess = async () => {
    setIsRequesting(true);
    try {
      const result = await signIn('github', {
        callbackUrl: `/review/${owner}/${repo}`,
        redirect: false,
        authorization: {
          params: {
            scope: 'read:user repo',
            prompt: 'consent',
          },
        },
      });

      if (result?.error) {
        console.error('Failed to request private access:', result.error);
        router.push(`/auth/error?error=${encodeURIComponent(result.error)}`);
      } else if (result?.url) {
        router.push(result.url);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to request private access:', error);
      router.push('/auth/error');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <LockIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-yellow-500">Private Repository Access Required</h3>
          <p className="text-sm text-yellow-500/80 mt-1 mb-3">
            This repository is private. You need to grant additional permissions to access it.
          </p>
          <Button
            onClick={handleRequestAccess}
            disabled={isRequesting}
            variant="outline"
            className="border-yellow-500/30 hover:border-yellow-500/50"
          >
            {isRequesting ? 'Requesting Access...' : 'Grant Private Repository Access'}
          </Button>
        </div>
      </div>
    </div>
  );
}
