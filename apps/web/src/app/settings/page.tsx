'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ProfileDisplay } from "@/components/profile-display";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, signIn } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrivateReposEnabled, setIsPrivateReposEnabled] = useState(false);
  const [githubStatus, setGithubStatus] = useState<{
    hasPrivateAccess: boolean;
    totalPrivateRepos: number;
    plan: string;
    scopes: string[];
    activePermissions: string[];
    currentAccess: {
      hasPrivateRepos: boolean;
      canAccessPrivateRepos: boolean;
    };
  } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.email) {
      if (!isSaving) {
        router.push('/auth/signin');
      }
      return;
    }

    const fetchGithubPermissions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings/github-permissions');
        
        if (!response.ok) {
          if (response.status === 401 && !isSaving) {
            router.push('/auth/signin');
            return;
          }
          throw new Error('Failed to fetch GitHub permissions');
        }

        const data = await response.json();
        console.log('GitHub permissions fetched:', data);
        
        setGithubStatus(data);
        setIsPrivateReposEnabled(data.hasPrivateAccess);
        
        // Update session if permissions have changed
        if (data.hasPrivateAccess !== session.user.hasPrivateAccess) {
          console.log('Permissions changed, updating session');
          await updateSession();
        }
      } catch (error) {
        console.error('Error fetching GitHub permissions:', error);
        if (!isSaving) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch GitHub permissions. Please try again.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchGithubPermissions();
  }, [session, status, router, toast, isSaving, updateSession]);

  // Debug state changes
  useEffect(() => {
    if (githubStatus) {
      console.log('GitHub Status Updated:', {
        hasPrivateAccess: githubStatus.hasPrivateAccess,
        sessionPrivateAccess: session?.user?.hasPrivateAccess,
        scopes: githubStatus.scopes,
        switchEnabled: isPrivateReposEnabled,
        currentAccess: githubStatus.currentAccess,
      });
    }
  }, [githubStatus, isPrivateReposEnabled, session]);

  const handlePrivateReposToggle = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/github-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enablePrivateAccess: enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update permissions');
      }

      const data = await response.json();
      
      if (data.requiresAuth) {
        window.location.href = data.authUrl;
        return;
      }

      setGithubStatus(data);
      setIsPrivateReposEnabled(data.hasPrivateAccess);
      
      // Update session with new permissions
      await updateSession();

      toast({
        title: "Success",
        description: enabled 
          ? "Private repository access enabled"
          : "Private repository access disabled",
      });
    } catch (error) {
      console.error('Error updating GitHub permissions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update permissions. Please try again.",
      });
      // Reset switch state on error
      setIsPrivateReposEnabled(!enabled);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Call the GitHub permissions API to revoke token
      await fetch('/api/settings/github-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enablePrivateAccess: false }),
      });

      // Sign out and redirect to home page
      await signOut({ 
        callbackUrl: '/',
        redirect: true
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out properly. Please try again.",
      });
    }
  };

  const getAccessMessage = (status: typeof githubStatus) => {
    if (!status) return '';
    
    if (status.hasPrivateAccess) {
      return 'Currently allowing access to private repositories.';
    }
    
    if (status.currentAccess?.hasPrivateRepos) {
      return 'You have private repositories, but this app currently only has access to public repositories. Enable private access to view and analyze private repositories.';
    }
    
    return 'Currently restricted to public repositories only.';
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-4xl font-bold">Settings</h1>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>

          <ProfileDisplay />
          <div className="flex justify-center gap-4">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium">GitHub Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your GitHub integration settings
                </p>
              </div>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium">Repository Access</h3>
                        {isLoading && <span className="text-sm text-muted-foreground">(Loading...)</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getAccessMessage(githubStatus)}
                      </p>
                      {githubStatus && (
                        <div className="text-sm text-muted-foreground mt-4 space-y-4">
                          <div>
                            <p className="font-medium mb-1">Access Status</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>
                                Plan: <span className="capitalize">{githubStatus.plan}</span>
                              </li>
                              <li>
                                Private Repositories: {githubStatus.totalPrivateRepos} available
                              </li>
                              <li>
                                Current Access Level: {
                                  githubStatus.hasPrivateAccess 
                                    ? 'Full Access (including private repositories)'
                                    : githubStatus.currentAccess?.hasPrivateRepos
                                      ? 'Public Repositories Only (private repositories available but not accessible)'
                                      : 'Public Repositories Only'
                                }
                              </li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Current Permissions</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {githubStatus.activePermissions.map((permission, index) => (
                                <li key={index}>{permission}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Switch
                        checked={isPrivateReposEnabled}
                        onCheckedChange={handlePrivateReposToggle}
                        disabled={isSaving || isLoading}
                      />
                      {isSaving && (
                        <span className="text-sm text-muted-foreground">
                          Updating permissions...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {(status as string) === "unauthenticated" || !session?.user?.email ? (
              "Please sign in to access settings"
            ) : (
              "You're authenticated! Manage your access levels below."
            )}
          </p>
        </div>
      </main>
    </div>
  );
}