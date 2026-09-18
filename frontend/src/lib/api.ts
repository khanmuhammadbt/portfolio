import type { SiteContent } from "./content";

/**
 * API client for the Flask backend.
 * - CSRF: token fetched once, rotated after login, sent as X-CSRF-Token on mutations
 * - Sessions: cookie-based (HttpOnly, SameSite=Strict) — credentials: "include"
 * - Errors carry lockout info (retryAfter) for brute-force UX
 */

export class ApiError extends Error {
  status: number;
  code: string;
  retryAfter?: number;
  constructor(status: number, code: string, message: string, retryAfter?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

let csrfToken: string | null = null;
let apiBase: string | null = null;

/** Detect whether the Flask backend is reachable (same origin). */
export async function detectBackend(): Promise<boolean> {
  if (apiBase !== null) return apiBase === "";
  try {
    const res = await fetch("/api/health", {
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
      credentials: "include",
    });
    apiBase = res.ok ? "" : null;
    return res.ok;
  } catch {
    apiBase = null;
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (csrfToken && !["GET", "HEAD"].includes((options.method ?? "GET").toUpperCase())) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  const res = await fetch(path, { ...options, headers, credentials: "include" });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data.code as string) ?? "error",
      (data.message as string) ?? res.statusText,
      data.retry_after as number | undefined
    );
  }
  return data as T;
}

export const api = {
  /** Pre-auth: issues anonymous session + CSRF token */
  async csrf(): Promise<string> {
    const data = await request<{ csrf_token: string }>("/api/auth/csrf");
    csrfToken = data.csrf_token;
    return csrfToken;
  },
  async login(username: string, password: string) {
    const data = await request<{ admin: { username: string }; csrf_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    csrfToken = data.csrf_token; // rotated post-auth (session-fixation protection)
    return data.admin;
  },
  async logout() {
    await request("/api/auth/logout", { method: "POST", body: "{}" });
    csrfToken = null;
  },
  async me(): Promise<{ username: string } | null> {
    try {
      return await request<{ username: string }>("/api/auth/me");
    } catch {
      return null;
    }
  },
  async content(): Promise<{ content: SiteContent; updated_at: string } | null> {
    try {
      return await request<{ content: SiteContent; updated_at: string }>("/api/content");
    } catch {
      return null;
    }
  },
  async saveContent(content: SiteContent) {
    return request<{ ok: boolean; updated_at: string }>("/api/content", {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
  },
  async changePassword(current_password: string, new_password: string) {
    return request<{ ok: boolean }>("/api/auth/password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    });
  },
  /** Public chat endpoint — server-side rate limited, key never exposed */
  async chat(message: string, history: { role: "user" | "model"; text: string }[], lang: string) {
    return request<{ reply: string }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, history, lang }),
    });
  },
};
