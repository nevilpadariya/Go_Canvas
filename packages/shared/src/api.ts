function getRuntimeApiBase(): string {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
    return (env.EXPO_PUBLIC_API_URL || env.REACT_APP_API_URL || "").trim();
}

function normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.trim().replace(/\/+$/, "");
}

let API_BASE = getRuntimeApiBase();
let getToken: () => string | null | Promise<string | null> = () => null;

export interface ApiConfig {
    baseUrl?: string;
    getToken?: () => string | null | Promise<string | null>;
}

export function configureApi(config: ApiConfig) {
    if (config.baseUrl) API_BASE = normalizeBaseUrl(config.baseUrl);
    if (config.getToken) getToken = config.getToken;
}

export function getApiUrl(path: string): string {
    if (!API_BASE) {
        throw new Error(
            "API base URL is not configured. Set VITE_API_URL (web) or EXPO_PUBLIC_API_URL (mobile)."
        );
    }
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE}${p}`;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchApi<T = unknown>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = getApiUrl(path);
    let res: Response;
    try {
        const authHeaders = await getAuthHeaders();
        res = await fetch(url, {
            ...options,
            headers: { ...authHeaders, ...(options.headers as Record<string, string>) },
        });
    } catch (e) {
        const msg =
            e instanceof TypeError && (e.message === "Failed to fetch" || e.message === "Load failed")
                ? `Cannot reach the server at ${API_BASE}. Make sure the backend is running.`
                : e instanceof Error
                    ? e.message
                    : "Network error";
        throw new Error(msg);
    }
    if (!res.ok) {
        const body = await res.text().catch(() => res.statusText);
        let errMessage = body || res.statusText;
        try {
            const j = JSON.parse(body);
            if (j.detail) errMessage = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
        } catch (_) { }
        if (res.status === 401 && errMessage === (body || res.statusText)) {
            errMessage = "Session expired or invalid. Please log in again.";
        }
        throw new Error(errMessage);
    }
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) return res.json() as Promise<T>;
    return res.text() as Promise<T>;
}

export async function getApi<T = unknown>(path: string): Promise<T> {
    return fetchApi<T>(path, { method: "GET" });
}

export async function postApi<T = unknown>(path: string, body: unknown): Promise<T> {
    return fetchApi<T>(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

export async function putApi<T = unknown>(path: string, body: unknown): Promise<T> {
    return fetchApi<T>(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

export async function deleteApi<T = unknown>(path: string): Promise<T> {
    return fetchApi<T>(path, { method: "DELETE" });
}

export const delApi = deleteApi;
