export function getApiBaseUrl(): string {
  const baseUrl = (import.meta.env.VITE_API_URL ?? "").trim();
  if (!baseUrl) {
    throw new Error(
      "Frontend API URL is not configured. Set VITE_API_URL in Vercel environment variables."
    );
  }
  return baseUrl.replace(/\/+$/, "");
}

export async function parseApiError(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const data = await response.json();
      if (typeof data?.detail === "string" && data.detail.trim()) {
        return data.detail;
      }
      if (data?.detail) {
        return JSON.stringify(data.detail);
      }
      if (typeof data?.message === "string" && data.message.trim()) {
        return data.message;
      }
    } catch {
      // Fall through to text parsing.
    }
  }

  const text = (await response.text().catch(() => "")).trim();
  return text || fallbackMessage;
}
