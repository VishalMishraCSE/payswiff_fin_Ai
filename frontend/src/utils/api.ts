export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Route API requests relatively through the Next.js reverse proxy
    return `${window.location.origin}/api/backend`;
  }
  return process.env.BACKEND_URL || "http://127.0.0.1:8000";
}

export function getWsBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Route WebSocket upgrades relatively through Next.js proxy
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/backend`;
  }
  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  return backendUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
}
