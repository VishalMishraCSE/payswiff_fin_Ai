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

function getRoleDashboard(role: string): string {
  if (role === "customer_care" || role === "customer-care") {
    return "/customer-care/dashboard";
  }
  if (role === "analyst") {
    return "/analyst/dashboard";
  }
  if (role === "admin") {
    return "/admin/dashboard";
  }
  return "/merchant/dashboard";
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  // Normalize /customer_care to /customer-care
  if (path.startsWith("/customer_care")) {
    const normalizedPath = path.replace("/customer_care", "/customer-care");
    return NextResponse.redirect(new URL(normalizedPath, request.url));
  }

  // Protect dashboard routes
  const isProtectedPath =
    path.startsWith("/merchant") ||
    path.startsWith("/admin") ||
    path.startsWith("/analyst") ||
    path.startsWith("/customer-care");

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based protection
    const payload = decodeJwt(token);
    const role = payload?.role || "merchant";

    // Enforce role boundaries
    if (role === "admin") {
      // Admin has superuser access to all pages and portals
      return NextResponse.next();
    }

    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
    }
    if (path.startsWith("/analyst") && role !== "analyst") {
      return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
    }
    if (path.startsWith("/customer-care") && role !== "customer_care" && role !== "customer-care") {
      return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
    }
    if (path.startsWith("/merchant") && role !== "merchant") {
      // Customer care can access merchant customer-care bot & transactions to assist
      if ((role === "customer_care" || role === "customer-care") && (path.startsWith("/merchant/customer-care") || path.startsWith("/merchant/transactions"))) {
        return NextResponse.next();
      }
      // Analyst can access transactions and kyc
      if (role === "analyst" && (path.startsWith("/merchant/transactions") || path.startsWith("/merchant/kyc"))) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if ((path === "/login" || path === "/register") && token) {
    const payload = decodeJwt(token);
    const role = payload?.role || "merchant";
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/merchant/:path*",
    "/admin/:path*",
    "/analyst/:path*",
    "/customer-care/:path*",
    "/customer_care/:path*",
    "/login",
    "/register",
  ],
};

