import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  // Convert http/https to ws/wss
  const wsUrl = backendUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  return NextResponse.json({ wsUrl });
}
