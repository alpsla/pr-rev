'use client';

import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';

export function AuthButton() {
  const handleSignIn = async () => {
    // Get the callback URL from the current URL's search params
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl') || '/';
    
    console.log('Starting GitHub auth with callback:', callbackUrl);
    await signIn('github', {
      callbackUrl: decodeURIComponent(callbackUrl)
    });
  };

  return (
    <Button 
      onClick={handleSignIn}
      className="w-full"
    >
      Continue with GitHub
    </Button>
  );
}
