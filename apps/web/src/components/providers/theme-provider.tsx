"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type Attribute = "class" | "data-theme" | "data-mode";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: Attribute;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
  forcedTheme?: string;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
