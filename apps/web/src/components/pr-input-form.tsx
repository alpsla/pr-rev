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
    console.log('[PRInputForm] Form submitted:', {
      url,
      hasGithubToken: !!githubToken
    });

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
        console.log('[PRInputForm] Invalid PR URL format:', { url: trimmedUrl });
        setError('Invalid PR URL format');
        return;
      }
      console.log('[PRInputForm] PR URL parsed:', prInfo);

      const { owner, repo } = prInfo;
      const repoAccessService = new RepositoryAccessService(githubToken);

      // First check if the repository is public
      const isPublic = await repoAccessService.isRepositoryPublic(owner, repo);
      console.log('[PRInputForm] Repository visibility check:', { 
        isPublic, 
        owner, 
        repo,
        hasGithubToken: !!githubToken 
      });
      
      // Construct review page path
      const reviewPath = `/review/${owner}/${repo}/${prInfo.number}`;

      if (isPublic) {
        // For public repos, redirect directly to review page
        console.log('[PRInputForm] Public repo detected, redirecting to:', reviewPath);
        router.push(reviewPath);
        return;
      }

      // For private repos, we need auth
      if (!githubToken) {
        console.log('[PRInputForm] Private repo detected, no token available');
        console.log('[PRInputForm] Initiating GitHub OAuth flow with callback:', reviewPath);
        
        // Redirect to GitHub OAuth with proper scopes
        await signIn('github', {
          callbackUrl: reviewPath,
          redirect: true,
          scope: 'repo' // Request repo scope for private repo access
        });
        return;
      }

      // Check if we have access to the private repo with current token
      const hasAccess = await repoAccessService.isRepositoryAccessible(owner, repo);
      console.log('[PRInputForm] Repository access check:', { 
        hasAccess, 
        owner, 
        repo,
        hasGithubToken: !!githubToken 
      });

      if (!hasAccess) {
        console.log('[PRInputForm] No access to private repo with current token');
        console.log('[PRInputForm] Re-authenticating with callback:', reviewPath);
        
        // Re-authenticate with GitHub OAuth flow
        await signIn('github', {
          callbackUrl: reviewPath,
          redirect: true,
          scope: 'repo' // Request repo scope for private repo access
        });
        return;
      }

      // We have access to the private repo, proceed to review
      console.log('[PRInputForm] Private repo with access, redirecting to:', reviewPath);
      router.push(reviewPath);
    } catch (err) {
      console.error('[PRInputForm] Error handling PR:', err);
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
