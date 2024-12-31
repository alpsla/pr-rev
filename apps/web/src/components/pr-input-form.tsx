'use client';

import { useState } from 'react';
import { Input, Button, Alert, AlertDescription } from '@pr-rev/ui';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { PRValidator, PRValidationError } from '../lib/github/services/pr-validator';

interface Props {
  onSubmit: (url: string) => Promise<void>;
  githubToken: string;
}

export function PRInputForm({ onSubmit, githubToken }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a PR URL');
      return;
    }

    try {
      setIsLoading(true);
      const validator = new PRValidator(githubToken);
      await validator.validatePR(trimmedUrl);
      await onSubmit(trimmedUrl);
    } catch (err) {
      if (err instanceof PRValidationError) {
        setError(err.message);
      } else {
        console.error('PR validation error:', err);
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
          <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
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
