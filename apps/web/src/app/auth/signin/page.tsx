'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/settings';
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to PR Review</CardTitle>
          <CardDescription>
            {error === 'AccessDenied' 
              ? 'Please sign in with GitHub to grant additional permissions'
              : 'Sign in with GitHub to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => signIn('github', { callbackUrl })}
          >
            <Github className="mr-2 h-4 w-4" />
            {error === 'AccessDenied' ? 'Grant Access' : 'Sign in with GitHub'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}