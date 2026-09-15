/**
 * Auth.js (NextAuth v5) Configuration
 *
 * This is the base authentication configuration.
 * Providers and callbacks will be added when auth features are implemented.
 *
 * Usage:
 *   import { auth, signIn, signOut } from "@/lib/auth";
 */

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

const authConfig: NextAuthConfig = {
  providers: [
    // Providers will be added during auth feature implementation.
    // Examples: Credentials, Google, GitHub
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    // Callbacks will be configured during auth feature implementation.
    // authorized({ auth, request }) { ... }
    // session({ session, token }) { ... }
    // jwt({ token, user }) { ... }
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
