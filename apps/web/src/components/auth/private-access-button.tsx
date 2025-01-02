'use client';

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

interface PrivateAccessButtonProps {
  repoIsPrivate: boolean;
  owner: string;
  repo: string;
}

export function PrivateAccessButton({ repoIsPrivate, owner, repo }: PrivateAccessButtonProps) {
  if (!repoIsPrivate) {
    return null;
  }

  const handleClick = async () => {
    const reviewPath = `/review/${owner}/${repo}`;
    await signIn('github', {
      callbackUrl: reviewPath,
      redirect: true,
      scope: 'repo' // Request repo scope for private repo access
    });
  };

  return (
    <div className="mb-8">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <h2 className="text-yellow-500 font-medium">Private Repository</h2>
        <p className="text-yellow-500/80 text-sm mt-1">
          This is a private repository. You need to authenticate with GitHub to access it.
        </p>
        <Button
          onClick={handleClick}
          variant="outline"
          className="mt-4"
        >
          Authenticate with GitHub
        </Button>
      </div>
    </div>
  );
}
