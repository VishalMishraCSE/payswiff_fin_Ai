import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/utils/api";

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    // Call FastAPI backend register endpoint
    const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Registration failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, message: data.message });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Registration failed to connect to backend server" },
      { status: 500 }
    );
  }
}
