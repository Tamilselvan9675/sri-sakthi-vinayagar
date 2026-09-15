/**
 * Theme Provider (Client Component)
 *
 * Wraps the application with next-themes ThemeProvider.
 * Supports light, dark, and system themes.
 *
 * Usage:
 *   <ThemeProvider>
 *     {children}
 *   </ThemeProvider>
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
