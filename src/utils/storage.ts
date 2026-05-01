import { AppState } from "../types";
import { demoData } from "../data/demoData";

export const STORAGE_KEY = "funnel-tg-app-state-v1";

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return demoData;
  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return demoData;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
