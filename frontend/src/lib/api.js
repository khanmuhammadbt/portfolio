/**
 * Shared HTTP transport for feature API services.
 */
export class ApiError extends Error {
    constructor(status, code, message, retryAfter) {
        super(message);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "retryAfter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.status = status;
        this.code = code;
        this.retryAfter = retryAfter;
    }
}
let csrfToken = null;
let apiBase = null;
export function setCsrfToken(token) {
    csrfToken = token;
}
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
export async function request(path, options = {}) {
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
