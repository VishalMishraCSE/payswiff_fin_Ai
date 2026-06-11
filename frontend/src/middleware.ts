import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  // Protect dashboard routes
  if (path.startsWith("/merchant") || path.startsWith("/admin") || path.startsWith("/analyst")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if ((path === "/login" || path === "/register") && token) {
    return NextResponse.redirect(new URL("/merchant/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/merchant/:path*", "/admin/:path*", "/analyst/:path*", "/login", "/register"],
};
