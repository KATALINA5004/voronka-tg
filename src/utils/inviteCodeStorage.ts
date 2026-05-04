import { INVITE_CODES } from "../constants/inviteCodes";

const APP_UNLOCK_SESSION_KEY = "funnel-tg-app-unlocked-v1";
const USED_INVITE_CODES_KEY = "funnel-tg-used-invite-codes-v1";

export function isAppUnlocked(): boolean {
  return sessionStorage.getItem(APP_UNLOCK_SESSION_KEY) === "1";
}

export function setAppUnlocked(): void {
  sessionStorage.setItem(APP_UNLOCK_SESSION_KEY, "1");
}

function loadUsedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(USED_INVITE_CODES_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function saveUsedSet(used: Set<string>): void {
  localStorage.setItem(USED_INVITE_CODES_KEY, JSON.stringify([...used]));
}

/** Приводит ввод к виду XXXX-XXXX-XXXX или null, если не 12 букв/цифр. */
export function normalizeInviteCodeInput(raw: string): string | null {
  const alnum = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (alnum.length !== 12) return null;
  return `${alnum.slice(0, 4)}-${alnum.slice(4, 8)}-${alnum.slice(8, 12)}`;
}

export type RedeemResult = "ok" | "invalid" | "used";

/** Одно успешное срабатывание — код заносится в used и больше не принимается. */
export function redeemInviteCode(normalized: string): RedeemResult {
  if (!INVITE_CODES.has(normalized)) return "invalid";
  const used = loadUsedSet();
  if (used.has(normalized)) return "used";
  used.add(normalized);
  saveUsedSet(used);
  return "ok";
}
