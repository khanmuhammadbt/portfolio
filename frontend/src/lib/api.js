/**
 * API client for the Flask backend.
 * - CSRF: token fetched once, rotated after login, sent as X-CSRF-Token on mutations
 * - Sessions: cookie-based (HttpOnly, SameSite=Strict) — credentials: "include"
 * - Errors carry lockout info (retryAfter) for brute-force UX
 */
export class ApiError extends Error {
    status;
    code;
    retryAfter;
    constructor(status, code, message, retryAfter) {
        super(message);
        this.status = status;
        this.code = code;
        this.retryAfter = retryAfter;
    }
}
let csrfToken = null;
let apiBase = null;
/** Detect whether the Flask backend is reachable (same origin). */
export async function detectBackend() {
    if (apiBase !== null)
        return apiBase === "";
    try {
        const res = await fetch("/api/health", {
            signal: AbortSignal.timeout(2000),
            cache: "no-store",
            credentials: "include",
        });
        apiBase = res.ok ? "" : null;
        return res.ok;
    }
    catch {
        apiBase = null;
        return false;
    }
}
async function request(path, options = {}) {
    const headers = new Headers(options.headers);
    if (options.body)
        headers.set("Content-Type", "application/json");
    if (csrfToken && !["GET", "HEAD"].includes((options.method ?? "GET").toUpperCase())) {
        headers.set("X-CSRF-Token", csrfToken);
    }
    const res = await fetch(path, { ...options, headers, credentials: "include" });
    let data = {};
    try {
        data = await res.json();
    }
    catch {
        /* no body */
    }
    if (!res.ok) {
        throw new ApiError(res.status, data.code ?? "error", data.message ?? res.statusText, data.retry_after);
    }
    return data;
}
export const api = {
    /** Pre-auth: issues anonymous session + CSRF token */
    async csrf() {
        const data = await request("/api/auth/csrf");
        csrfToken = data.csrf_token;
        return csrfToken;
    },
    async login(username, password) {
        const data = await request("/api/auth/login", {
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
    async me() {
        try {
            return await request("/api/auth/me");
        }
        catch {
            return null;
        }
    },
    async content() {
        try {
            return await request("/api/content");
        }
        catch {
            return null;
        }
    },
    async saveContent(content) {
        return request("/api/content", {
            method: "PUT",
            body: JSON.stringify({ content }),
        });
    },
    async changePassword(current_password, new_password) {
        return request("/api/auth/password", {
            method: "POST",
            body: JSON.stringify({ current_password, new_password }),
        });
    },
    /** Public chat endpoint — server-side rate limited, key never exposed */
    async chat(message, history, lang) {
        return request("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message, history, lang }),
        });
    },
};
