import { PROJECT_SLOT_IDS, ProjectSlotId } from "../types";

const LABELS_KEY = "funnel-tg-project-labels-v1";
const ACTIVE_PROJECT_SESSION_KEY = "funnel-tg-active-project-v1";

export type ProjectLabels = Record<ProjectSlotId, string>;

export function loadProjectLabels(): ProjectLabels {
  try {
    const raw = localStorage.getItem(LABELS_KEY);
    if (!raw) return { slot1: "", slot2: "", slot3: "" };
    const p = JSON.parse(raw) as Partial<ProjectLabels>;
    return {
      slot1: typeof p.slot1 === "string" ? p.slot1 : "",
      slot2: typeof p.slot2 === "string" ? p.slot2 : "",
      slot3: typeof p.slot3 === "string" ? p.slot3 : ""
    };
  } catch {
    return { slot1: "", slot2: "", slot3: "" };
  }
}

export function saveProjectLabels(labels: ProjectLabels): void {
  localStorage.setItem(LABELS_KEY, JSON.stringify(labels));
}

export function projectTitle(id: ProjectSlotId, labels: ProjectLabels): string {
  const custom = labels[id]?.trim();
  if (custom) return custom;
  return `Проект ${PROJECT_SLOT_IDS.indexOf(id) + 1}`;
}

export function readSavedProjectSlot(): ProjectSlotId {
  const raw = sessionStorage.getItem(ACTIVE_PROJECT_SESSION_KEY);
  if (raw === "slot1" || raw === "slot2" || raw === "slot3") return raw;
  return "slot1";
}

export function writeSavedProjectSlot(id: ProjectSlotId): void {
  sessionStorage.setItem(ACTIVE_PROJECT_SESSION_KEY, id);
}
