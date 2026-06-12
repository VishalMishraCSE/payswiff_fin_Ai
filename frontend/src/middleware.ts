import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal JWT decode function (doesn't verify signature, just reads payload)
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  // Protect dashboard routes
  const isProtectedPath = path.startsWith("/merchant") || path.startsWith("/admin") || path.startsWith("/analyst");
  
  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based protection
    const payload = decodeJwt(token);
    const role = payload?.role || "merchant";

    // Enforce role boundaries
    if (path.startsWith("/merchant") && role !== "merchant") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (path.startsWith("/analyst") && role !== "analyst") {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if ((path === "/login" || path === "/register") && token) {
    const payload = decodeJwt(token);
    const role = payload?.role || "merchant";
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/merchant/:path*", "/admin/:path*", "/analyst/:path*", "/login", "/register"],
};
