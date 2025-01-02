'use client';

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { PRValidator } from '../lib/github/services/pr-validator';
import { signIn } from 'next-auth/react';

interface Props {
  githubToken?: string;
}

export function PRInputForm({ githubToken }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      // If no token, redirect to auth immediately
      if (!githubToken) {
        console.log('No token available, redirecting to GitHub auth');
        const reviewUrl = `/review?pr=${encodeURIComponent(trimmedUrl)}`;
        
        // Use NextAuth's signIn directly with GitHub provider
        const result = await signIn('github', {
          callbackUrl: reviewUrl,
          redirect: false
        });

        console.log('SignIn result:', result);

        if (result?.error) {
          setError('Authentication failed: ' + result.error);
        } else if (result?.url) {
          // Redirect to GitHub OAuth
          window.location.href = result.url;
        }
        return;
      }

      // If we have a token, go directly to review page
      const reviewUrl = `/review?pr=${encodeURIComponent(trimmedUrl)}`;
      window.location.href = reviewUrl;
      
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
        {isLoading ? 'Validating...' : 'Analyze PR'}
      </Button>
    </form>
  );
}
