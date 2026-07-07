import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Safely decode the JWT payload part (index 1) from the base64 encoded string
    const parts = token.split(".");
    if (parts.length !== 3) {
      return NextResponse.json({ authenticated: false }, { status: 400 });
    }

    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    return NextResponse.json({
      authenticated: true,
      email: payload.sub,
      role: payload.role,
    });
  } catch (error) {
    console.error("Error reading session cookies:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
