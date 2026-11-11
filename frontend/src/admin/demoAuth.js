/**
 * Demo-mode auth is intentionally disabled for production use.
 * The backend is the only supported admin auth path.
 */
import { readStorage, writeStorage } from "../utils/storage";
export class LockedError extends Error {
    constructor(retryAfter) {
        super("Too many failed attempts");
        Object.defineProperty(this, "retryAfter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.retryAfter = retryAfter;
    }
}
export class BadCredentialsError extends Error {
}
const HASH_KEY = "km-admin-hash";
const ATTEMPTS_KEY = "km-admin-attempts";
const SESSION_KEY = "km-admin-session";
export const DEMO_USERNAME = "admin";
const FACTORY_HASH = "1e1bd75ce3395f5faf242146ee84144f1de6a173d738ed36cad5c83842b9f4ef";
const MAX_ATTEMPTS = 5;
const IDLE_MS = 30 * 60 * 1000;
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;
async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
function readAttempts() {
    try {
        return JSON.parse(readStorage(ATTEMPTS_KEY, '{"fails":0,"lockUntil":0}'));
    }
    catch {
        return { fails: 0, lockUntil: 0 };
    }
}
function writeAttempts(a) {
    writeStorage(ATTEMPTS_KEY, JSON.stringify(a));
}
export function demoLockRemaining() {
    return 0;
}
export function demoSession() {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
}
export async function demoLogin() {
    throw new Error("Admin demo mode is disabled. Start the Flask backend to sign in.");
}
export function demoLogout() {
    sessionStorage.removeItem(SESSION_KEY);
}
export async function demoChangePassword() {
    throw new Error("Admin demo mode is disabled. Start the Flask backend to change the password.");
}
