"use client";

import { ThemeProvider } from './theme-provider';
import { Toaster } from '../ui/toaster';
import { AuthProvider } from '../auth/auth-provider';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  console.log('[providers] Initializing providers');
  
  return (
    <SessionProvider
      refetchInterval={0} // Disable periodic refetching
      refetchOnWindowFocus={false} // Disable refetch on window focus
      refetchWhenOffline={false} // Disable refetch when offline
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
