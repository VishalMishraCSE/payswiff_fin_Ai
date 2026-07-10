export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Route API requests relatively through the Next.js reverse proxy
    return `${window.location.origin}/api/backend`;
  }
  return process.env.BACKEND_URL || "http://127.0.0.1:8000";
}

let cachedWsUrl: string | null = null;

export function getWsBaseUrl(): string {
  if (typeof window !== "undefined") {
    if (cachedWsUrl) return cachedWsUrl;

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "/api/ws-url", false); // Synchronous request
      xhr.send(null);
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        cachedWsUrl = data.wsUrl;
        return cachedWsUrl!;
      }
    } catch (error) {
      console.error("Failed to fetch WebSocket URL dynamically:", error);
    }

    // Fallback relative URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/backend`;
  }
  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  return backendUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
}
