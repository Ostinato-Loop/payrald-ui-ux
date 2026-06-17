// RALD PayRald — API client
// Security: JWT stored in module-level memory. Never written to localStorage.
// LILCKY STUDIO LIMITED

const API_BASE = import.meta.env.VITE_API_URL ?? "https://core.pay.rald.cloud";

let _token: string | null = null;

export function setAuthToken(token: string): void {
  _token = token;
}

export function clearAuthToken(): void {
  _token = null;
}

export function getAuthToken(): string | null {
  return _token;
}

export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-RALD-Client": "payrald-ui",
  };
  if (_token) headers["Authorization"] = `Bearer ${_token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let code: string | undefined;
    try {
      const err = await res.json();
      message = err.message ?? err.error ?? message;
      code = err.code;
    } catch {
      // ignore parse error
    }
    throw new ApiError(message, res.status, code);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

export async function apiFetch<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}
