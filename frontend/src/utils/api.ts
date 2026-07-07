export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Route API requests relatively through the Next.js reverse proxy
    return `${window.location.origin}/api/backend`;
  }
  return "http://127.0.0.1:8000";
}

export function getWsBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Route WebSocket upgrades relatively through Next.js proxy
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/backend`;
  }
  return "ws://127.0.0.1:8000";
}
