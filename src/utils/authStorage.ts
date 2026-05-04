export const AUTH_STORAGE_KEY = "funnel-tg-auth-v1";
export const AUTH_SESSION_KEY = "funnel-tg-auth-session-v1";

export type AuthRecord = {
  ownerTgId: number;
  salt: string;
  passwordHash: string;
};

async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt(): string {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function loadAuthRecord(): AuthRecord | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as AuthRecord;
    if (typeof p.ownerTgId !== "number" || typeof p.salt !== "string" || typeof p.passwordHash !== "string") return null;
    return p;
  } catch {
    return null;
  }
}

export function saveAuthRecord(rec: AuthRecord): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(rec));
}

export async function createAuthRecord(ownerTgId: number, password: string): Promise<AuthRecord> {
  const salt = randomSalt();
  const passwordHash = await sha256Hex(`${password}:${salt}`);
  const rec: AuthRecord = { ownerTgId, salt, passwordHash };
  saveAuthRecord(rec);
  return rec;
}

export async function verifyPassword(rec: AuthRecord, password: string): Promise<boolean> {
  const h = await sha256Hex(`${password}:${rec.salt}`);
  return h === rec.passwordHash;
}

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === "1";
}

export function setSessionUnlocked(): void {
  sessionStorage.setItem(AUTH_SESSION_KEY, "1");
}

export function clearSession(): void {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}
