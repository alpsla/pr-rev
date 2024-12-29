'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">
          {error || 'An error occurred during authentication'}
        </p>
        <Button asChild>
          <Link href="/auth/signin">Try Again</Link>
        </Button>
      </div>
    </div>
  );
}
