'use client';

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { PRValidator } from '../lib/github/services/pr-validator';
import { RepositoryAccessService } from '../lib/github/services/repository-access';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
interface Props {
  githubToken?: string;
}

export function PRInputForm({ githubToken }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log('Form submitted with URL:', url);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a PR URL');
      return;
    }

    try {
      setIsLoading(true);

      // Parse the URL first to validate format
      const prInfo = PRValidator.parsePRUrl(trimmedUrl);
      if (!prInfo) {
        setError('Invalid PR URL format');
        return;
      }

      const { owner, repo } = prInfo;
      const repoAccessService = new RepositoryAccessService(githubToken);

      // First check if the repository is public
      const isPublic = await repoAccessService.isRepositoryPublic(owner, repo);
      console.log('Repository visibility check:', { isPublic, owner, repo });
      
      // Construct review page path
      const reviewPath = `/review/${owner}/${repo}/${prInfo.number}`;

      if (isPublic) {
        // For public repos, redirect directly to review page
        console.log('Public repo detected, redirecting to review page:', reviewPath);
        router.push(reviewPath);
        return;
      }

      // For private repos, we need auth
      if (!githubToken) {
        console.log('Private repo detected, redirecting to GitHub auth');
        console.log('Initiating GitHub OAuth flow with callback:', reviewPath);
        
        // Initiate GitHub OAuth flow
        const result = await signIn('github', {
          callbackUrl: reviewPath,
          redirect: false
        });
        if (result?.url) {
          window.location.href = result.url;
        }
        return;
      }

      // Check if we have access to the private repo with current token
      const hasAccess = await repoAccessService.isRepositoryAccessible(owner, repo);
      console.log('Repository access check:', { hasAccess, owner, repo });

      if (!hasAccess) {
        console.log('No access to private repo, requesting new auth');
        
        // Re-authenticate with GitHub OAuth flow
        console.log('Re-authenticating with callback:', reviewPath);
        const result = await signIn('github', {
          callbackUrl: reviewPath,
          redirect: false
        });
        if (result?.url) {
          window.location.href = result.url;
        }
        return;
      }

      // We have access to the private repo, proceed to review
      console.log('Private repo with access, redirecting to review page:', reviewPath);
      router.push(reviewPath);
    } catch (err) {
      console.error('Error handling PR:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to process PR URL');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div className="space-y-2">
        <label htmlFor="pr-url" className="block text-sm font-medium text-gray-700">
          Pull Request URL
        </label>
        <Input
          id="pr-url"
          type="url"
          placeholder="https://github.com/owner/repo/pull/123"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          className="w-full"
          disabled={isLoading}
          aria-label="GitHub Pull Request URL"
          aria-describedby={error ? "pr-url-error" : undefined}
          aria-invalid={error ? "true" : "false"}
          required
        />
      </div>

      {error && (
        <Alert variant="destructive" className="items-center" role="alert" aria-live="polite" id="pr-url-error">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full"
      >
        {isLoading ? 'Processing...' : 'Analyze PR'}
      </Button>
    </form>
  );
}
