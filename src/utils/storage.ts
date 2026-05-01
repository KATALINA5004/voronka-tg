import { AppState } from "../types";
import { demoData } from "../data/demoData";

export const STORAGE_KEY = "funnel-tg-app-state-v1";

export function loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return demoData;
  try {
    const parsed = JSON.parse(raw) as AppState;
    const hasStage4 = parsed.settings?.stages?.some((s) => s.id === "stage4");
    if (hasStage4) return parsed;

    return {
      ...parsed,
      settings: {
        ...parsed.settings,
        stages: [
          { id: "stage1", name: parsed.settings?.stages?.[0]?.name || "Потенциальные", color: "#ffd966" },
          { id: "stage2", name: parsed.settings?.stages?.[1]?.name || "Проявлен интерес", color: "#ffd966" },
          { id: "stage3", name: "Выставление счета", color: "#ffd966" },
          { id: "stage4", name: parsed.settings?.stages?.[2]?.name || "Оплачено", color: "#ffd966" }
        ]
      },
      clients: (parsed.clients || []).map((c) => ({
        ...c,
        stageId: c.stageId === "stage3" ? "stage4" : c.stageId,
        bought: c.stageId === "stage3" ? true : c.bought
      }))
    };
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
