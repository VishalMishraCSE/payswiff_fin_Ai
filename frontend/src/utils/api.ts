export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Dynamically match the host of the client browser
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

export function getWsBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `ws://${window.location.hostname}:8000`;
  }
  return "ws://localhost:8000";
}
