'use client';

import { AuthButton } from '@/components/auth/auth-button';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-gray-600">Sign in with your GitHub account to continue</p>
        <AuthButton />
      </div>
    </div>
  );
}
