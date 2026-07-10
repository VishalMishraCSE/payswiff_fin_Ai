import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApiBaseUrl } from "@/utils/api";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Call FastAPI backend login endpoint
    const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Authentication failed" },
        { status: response.status }
      );
    }

    const { access_token, refresh_token } = data;

    // Create NextResponse and set HttpOnly cookies
    const nextResponse = NextResponse.json({ success: true });

    nextResponse.cookies.set({
      name: "access_token",
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30, // 30 mins
      path: "/",
    });

    nextResponse.cookies.set({
      name: "refresh_token",
      value: refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Authentication failed to connect to backend server" },
      { status: 500 }
    );
  }
}
