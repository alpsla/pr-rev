'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, ArrowRight, Settings, Code, GitPullRequest, Zap } from "lucide-react";
import { AuthButton } from "@/components/auth/auth-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [prUrl, setPrUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState('');

  const checkRepositoryAccess = async (url: string) => {
    try {
      const response = await fetch('/api/github/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to check repository access');
      }

      const data = await response.json();
      
      if (data.needsAccess) {
        setPermissionMessage(data.message);
        setShowPermissionDialog(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking repository access:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check repository access. Please try again.",
      });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in with GitHub to analyze pull requests.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Basic URL validation
      if (!prUrl.includes('github.com') || !prUrl.includes('/pull/')) {
        toast({
          variant: "destructive",
          title: "Invalid URL",
          description: "Please enter a valid GitHub pull request URL.",
        });
        return;
      }

      // Check repository access
      const hasAccess = await checkRepositoryAccess(prUrl);
      if (hasAccess) {
        // Store URL and proceed to review
        sessionStorage.setItem('pendingPrUrl', prUrl);
        router.push(`/review?pr=${encodeURIComponent(prUrl)}`);
      }
    } catch (error) {
      console.error('Error processing PR URL:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process PR URL. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionUpgrade = () => {
    // Store the PR URL before redirecting
    sessionStorage.setItem('pendingPrUrl', prUrl);
    // Redirect to settings page
    router.push('/settings');
    setShowPermissionDialog(false);
  };

  // Check for pending PR URL after returning from settings
  useEffect(() => {
    const pendingPrUrl = sessionStorage.getItem('pendingPrUrl');
    if (pendingPrUrl && session?.user?.hasPrivateAccess) {
      setPrUrl(pendingPrUrl);
      handleSubmit(new Event('submit') as any);
    }
  }, [session]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            PR Review
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AuthButton />
            {session && (
              <Link href="/settings">
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">PR Review Assistant</h1>
          <p className="text-xl mb-8">Get instant, intelligent feedback on your pull requests</p>
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Analyze Pull Request</h2>
            <p className="text-lg mb-4">Enter a GitHub pull request URL to start the analysis</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="url"
                placeholder="https://github.com/owner/repo/pull/123"
                value={prUrl}
                onChange={(e) => setPrUrl(e.target.value)}
                required
                pattern="https://github\.com/[^/]+/[^/]+/pull/\d+"
                title="Please enter a valid GitHub pull request URL"
                className="w-full p-4 text-lg border rounded-lg mb-4"
                disabled={isLoading || !session}
              />
              
              <Button type="submit" disabled={isLoading || !session}>
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            
            {!session && (
              <p className="text-sm text-muted-foreground">
                Please sign in with GitHub to analyze pull requests
              </p>
            )}
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Smart Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Advanced code analysis to identify potential issues and improvements
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitPullRequest className="h-5 w-5" />
                  PR Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Understand changes in context with detailed explanations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get instant feedback to improve your code quality
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Additional Access Required</DialogTitle>
            <DialogDescription>{permissionMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePermissionUpgrade}>
              Configure Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
