'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ProfileDisplay } from "@/components/profile-display";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const fetchGithubPermissions = useCallback(async () => {
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
      if (session?.user?.hasPrivateAccess !== undefined && data.hasPrivateAccess !== session.user.hasPrivateAccess) {
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
  }, [session, isSaving, router, toast, updateSession]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.email) {
      if (!isSaving) {
        router.push('/auth/signin');
      }
      return;
    }

    fetchGithubPermissions();
  }, [session, status, router, isSaving, fetchGithubPermissions]);

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

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      // For now, this will just re-request GitHub permissions
      // In the future, this could integrate with a payment system
      const response = await fetch('/api/settings/upgrade-access', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to upgrade access');
      }

      // Refresh GitHub permissions
      await fetchGithubPermissions();
      
      toast({
        title: "Access Upgraded",
        description: "You now have access to private repositories",
      });
    } catch (error) {
      console.error('Failed to upgrade access:', error);
      toast({
        title: "Error",
        description: "Failed to upgrade access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Access Level</CardTitle>
                <CardDescription>
                  Manage your access to private repositories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {githubStatus?.plan === 'free' ? 'Basic Access' : 'Pro Access'}
                    </p>
                  </div>
                  <Badge variant={githubStatus?.hasPrivateAccess ? "default" : "secondary"}>
                    {githubStatus?.hasPrivateAccess ? 'Private Access' : 'Public Only'}
                  </Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Pro Access Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Access to private repositories
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Organization repository support
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Advanced analytics and insights
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleUpgrade()}
                  disabled={isLoading || githubStatus?.hasPrivateAccess}
                  className="w-full"
                >
                  {githubStatus?.hasPrivateAccess 
                    ? 'Already on Pro Plan' 
                    : 'Upgrade to Pro Access'}
                </Button>
              </CardFooter>
            </Card>
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
