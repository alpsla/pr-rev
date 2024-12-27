"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useToast } from "../ui/use-toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    console.log('[auth-provider] Session state:', {
      status,
      hasSession: !!session,
      accessToken: session?.accessToken ? `${session.accessToken.toString().substring(0, 4)}...` : null,
      hasPrivateAccess: session?.user?.hasPrivateAccess,
      scope: session?.scope,
      error: session?.error,
      user: session?.user ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      } : null
    });

    // Handle session errors
    if (session?.error === 'RefreshAccessTokenError') {
      console.log('[auth-provider] Token expired, requesting re-authentication');
      toast({
        title: "Session Expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      signIn('github');
    }
  }, [session, status, toast]);

  // Log initial mount
  useEffect(() => {
    console.log('[auth-provider] Mounted');
    return () => console.log('[auth-provider] Unmounted');
  }, []);

  // Don't block rendering while loading
  return <>{children}</>;
}
