import { AppState, ProjectSlotId } from "../types";
import { normalizeLoadedState } from "./storage";

function supabaseConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isCloudSyncConfigured(): boolean {
  return supabaseConfig() !== null;
}

const TABLE = "funnel_workspace";

function headers(): HeadersInit {
  const c = supabaseConfig()!;
  return {
    apikey: c.key,
    Authorization: `Bearer ${c.key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal,resolution=merge-duplicates"
  };
}

/** Строка из Supabase или null, если нет записи / облако не настроено. */
export async function pullWorkspace(login: string, slot: ProjectSlotId): Promise<AppState | null> {
  const c = supabaseConfig();
  if (!c) return null;
  const qs = `login=eq.${encodeURIComponent(login)}&slot=eq.${encodeURIComponent(slot)}&select=app_state`;
  const r = await fetch(`${c.url}/rest/v1/${TABLE}?${qs}`, { headers: { apikey: c.key, Authorization: `Bearer ${c.key}` } });
  if (!r.ok) return null;
  const rows = (await r.json()) as { app_state?: AppState }[];
  if (!rows?.length || rows[0].app_state == null) return null;
  return normalizeLoadedState(rows[0].app_state);
}

export async function pushWorkspace(login: string, slot: ProjectSlotId, state: AppState): Promise<void> {
  const c = supabaseConfig();
  if (!c) return;
  const body = JSON.stringify([{ login, slot, app_state: state }]);
  await fetch(`${c.url}/rest/v1/${TABLE}`, { method: "POST", headers: headers(), body });
}
