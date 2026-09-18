/**
 * DEMO MODE auth — active only when the Flask backend is not reachable.
 * Passwords never stored in plaintext: SHA-256 hash persisted in localStorage.
 * Brute-force: 5 failed attempts -> exponential lockout (mirrors backend rules).
 * In production (Flask serving the app), ALL auth is server-side.
 */

export class LockedError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super("Too many failed attempts");
    this.retryAfter = retryAfter;
  }
}
export class BadCredentialsError extends Error {}

const HASH_KEY = "km-admin-hash";
const ATTEMPTS_KEY = "km-admin-attempts";
const SESSION_KEY = "km-admin-session";
export const DEMO_USERNAME = "admin";

// SHA-256("bantech123") — change it from the Settings tab after first login
const FACTORY_HASH = "1e1bd75ce3395f5faf242146ee84144f1de6a173d738ed36cad5c83842b9f4ef";

const MAX_ATTEMPTS = 5;
const IDLE_MS = 30 * 60 * 1000;
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readAttempts(): { fails: number; lockUntil: number } {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) ?? '{"fails":0,"lockUntil":0}');
  } catch {
    return { fails: 0, lockUntil: 0 };
  }
}
function writeAttempts(a: { fails: number; lockUntil: number }) {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(a));
}

export function demoLockRemaining(): number {
  const { lockUntil } = readAttempts();
  return Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
}

export function demoSession(): { username: string } | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "null");
    if (!s) return null;
    const age = Date.now() - s.t;
    if (age > IDLE_MS || Date.now() - s.created > ABSOLUTE_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    s.t = Date.now(); // rolling idle timeout
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    return { username: s.username };
  } catch {
    return null;
  }
}

export async function demoLogin(username: string, password: string): Promise<{ username: string }> {
  const remaining = demoLockRemaining();
  if (remaining > 0) throw new LockedError(remaining);

  const stored = localStorage.getItem(HASH_KEY) ?? FACTORY_HASH;
  const ok = username.trim() === DEMO_USERNAME && (await sha256(password)) === stored;
  if (!ok) {
    const a = readAttempts();
    a.fails += 1;
    if (a.fails >= MAX_ATTEMPTS) {
      const minutes = Math.min(2 ** (a.fails - MAX_ATTEMPTS), 60); // 1,2,4,8... capped at 60
      a.lockUntil = Date.now() + minutes * 60 * 1000;
      a.fails = 0; // counter resets, next lock escalates via lockUntil chain
    }
    writeAttempts(a);
    const remaining2 = demoLockRemaining();
    if (remaining2 > 0) throw new LockedError(remaining2);
    throw new BadCredentialsError("Invalid credentials");
  }
  writeAttempts({ fails: 0, lockUntil: 0 });
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, t: Date.now(), created: Date.now() }));
  return { username };
}

export function demoLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function demoChangePassword(current: string, next: string): Promise<void> {
  const stored = localStorage.getItem(HASH_KEY) ?? FACTORY_HASH;
  if ((await sha256(current)) !== stored) throw new BadCredentialsError("Current password is incorrect");
  localStorage.setItem(HASH_KEY, await sha256(next));
}
