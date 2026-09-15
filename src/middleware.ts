import { NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
const { auth } = NextAuth(authConfig);

export const middleware = auth((request) => {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for internal paths and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // e.g., favicon.ico, images
  ) {
    return NextResponse.next();
  }

  // Auth check for admin routes
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/en/admin") || pathname.startsWith("/ta/admin");
  const isLoginRoute = pathname.includes("/admin/login");

  if (isAdminRoute && !isLoginRoute) {
    // We can rely on authorized callback from authConfig for /admin, 
    // but auth() wrapper also populates request.auth
    if (!request.auth) {
      const loginUrl = new URL("/en/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if the pathname already has a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirect to default locale if no locale is present
  const locale = defaultLocale;
  const redirectUrl = new URL(`/${locale}${pathname}`, request.url);

  // Preserve query parameters
  redirectUrl.search = request.nextUrl.search;

  return NextResponse.redirect(redirectUrl);
});

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and files with extensions
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
