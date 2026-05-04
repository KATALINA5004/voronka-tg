import { ACCOUNT_PAIRS } from "../constants/accountCredentials";
import { AppState, Client, ProjectSlotId, Settings, Stage, StageId, StageScripts } from "../types";

/** Один общий файл состояния до появления аккаунтов. */
export const LEGACY_STORAGE_KEY = "funnel-tg-app-state-v1";

export function getProjectStorageKey(accountLogin: string, projectId: ProjectSlotId): string {
  const slug = accountLogin.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `funnel-tg-data-v2-${slug}-${projectId}`;
}

/** Только первый аккаунт из списка + слот 1: перенос старого одного файла `funnel-tg-app-state-v1`. */
function migrateLegacySingleFileInto(accountLogin: string, projectId: ProjectSlotId): void {
  const primaryLogin = ACCOUNT_PAIRS[0]?.login;
  if (!primaryLogin || accountLogin !== primaryLogin || projectId !== "slot1") return;
  const nk = getProjectStorageKey(accountLogin, projectId);
  if (localStorage.getItem(nk)) return;
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return;
  try {
    JSON.parse(raw) as AppState;
    localStorage.setItem(nk, raw);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

const defaultStagesEmpty: Stage[] = [
  { id: "stage1", name: "Потенциальные", color: "#ffd966" },
  { id: "stage2", name: "Проявлен интерес", color: "#ffd966" },
  { id: "stage3", name: "В работе", color: "#ffd966" },
  { id: "stage4", name: "Выставление счета", color: "#ffd966" },
  { id: "stage5", name: "Оплачено", color: "#ffd966" }
];

/** Пустое приложение без клиентов и без демо. */
export const initialEmptyState: AppState = {
  clients: [],
  settings: {
    stages: defaultStagesEmpty,
    currency: "RUB",
    defaultAverageCheck: 0,
    defaultProfitability: 35,
    stageScripts: {
      stage1: ["", "", ""],
      stage2: ["", "", ""],
      stage3: ["", "", ""],
      stage4: ["", "", ""],
      stage5: ["", "", ""]
    },
    touchpointTypes: ["звонок", "сообщение", "встреча", "консультация", "замер", "оплата", "другое"]
  },
  plan: {
    period: "",
    startDate: "",
    endDate: "",
    targetProfit: 0,
    averageCheck: 0,
    profitability: 35,
    targetPaidClients: 0,
    conversion4to5: 10,
    conversion3to4: 10,
    conversion2to3: 10,
    conversion1to2: 10
  }
};

function normalizeStageScripts(raw?: Partial<Record<StageId, string[]>>): StageScripts {
  const pick = (id: StageId) => {
    const arr = [...(raw?.[id] || [])];
    while (arr.length < 3) arr.push("");
    return arr.slice(0, 3);
  };
  return {
    stage1: pick("stage1"),
    stage2: pick("stage2"),
    stage3: pick("stage3"),
    stage4: pick("stage4"),
    stage5: pick("stage5")
  };
}

function ensureSettings(settings: Settings | undefined): Settings {
  const legacy = settings as Settings & { scriptTemplates?: string[] };
  const stageScripts = settings?.stageScripts
    ? normalizeStageScripts(settings.stageScripts)
    : normalizeStageScripts({
        stage1: (legacy?.scriptTemplates || []).slice(0, 3),
        stage2: ["", "", ""],
        stage3: ["", "", ""],
        stage4: ["", "", ""],
        stage5: ["", "", ""]
      });
  const touchpointTypes = Array.isArray(settings?.touchpointTypes) && settings?.touchpointTypes.length
    ? settings.touchpointTypes.filter(Boolean)
    : ["звонок", "сообщение", "встреча", "консультация", "замер", "оплата", "другое"];
  return {
    stages: settings?.stages || defaultStagesEmpty,
    currency: settings?.currency || "RUB",
    defaultAverageCheck: Number(settings?.defaultAverageCheck) || 0,
    defaultProfitability: Number(settings?.defaultProfitability) || 35,
    stageScripts,
    touchpointTypes
  };
}

function normalizeClient(c: Client): Client {
  let scriptVariantIndex: number | null = null;
  if (c.scriptVariantIndex !== undefined && c.scriptVariantIndex !== null) {
    const n = Number(c.scriptVariantIndex);
    if (!Number.isNaN(n) && n >= 0 && n <= 2) scriptVariantIndex = Math.floor(n);
  }
  return {
    ...c,
    baseType: c.baseType || "",
    scriptVariantIndex,
    scriptStageId: c.scriptStageId || null,
    scriptHistory: Array.isArray(c.scriptHistory) ? c.scriptHistory : [],
    touchpoints: Array.isArray(c.touchpoints) ? c.touchpoints : []
  };
}

function normalizePlan(parsed: AppState["plan"]) {
  const legacy = (parsed || {}) as AppState["plan"] & {
    plannedLeads?: number;
    conversion1?: number;
    conversion2?: number;
    targetRevenue?: number;
  };
  const targetProfit =
    Number(parsed?.targetProfit) ||
    (Number(legacy.targetRevenue) > 0 && Number(parsed?.profitability) > 0
      ? (Number(legacy.targetRevenue) * Number(parsed?.profitability)) / 100
      : 0);
  const averageCheck = Number(parsed?.averageCheck) || 0;
  const profitability = Number(parsed?.profitability) || 35;
  const targetPaidClients = Number(parsed?.targetPaidClients) || 0;
  const conversion4to5 = Number(parsed?.conversion4to5) || 10;
  const conversion3to4 = Number(parsed?.conversion3to4) || 10;
  const conversion2to3 = Number(parsed?.conversion2to3) || Number(legacy.conversion2) || 10;
  const conversion1to2 = Number(parsed?.conversion1to2) || Number(legacy.conversion1) || 10;
  return {
    period: parsed?.period || "",
    startDate: parsed?.startDate || "",
    endDate: parsed?.endDate || "",
    targetProfit,
    averageCheck,
    profitability,
    targetPaidClients,
    conversion4to5,
    conversion3to4,
    conversion2to3,
    conversion1to2
  };
}

/** Миграции со старых версий (3 / 4 этапа) на текущую схему. */
function migrateParsed(parsed: AppState): AppState {
  let clients = (parsed.clients || []).map(normalizeClient);
  let stages = [...(parsed.settings?.stages || [])];
  const ids = new Set(stages.map((s) => s.id));

  if (!ids.has("stage5")) {
    if (ids.has("stage4")) {
      const s4 = stages.find((s) => s.id === "stage4");
      stages = [
        stages.find((s) => s.id === "stage1") || defaultStagesEmpty[0],
        stages.find((s) => s.id === "stage2") || defaultStagesEmpty[1],
        stages.find((s) => s.id === "stage3") || defaultStagesEmpty[2],
        { id: "stage4", name: "Выставление счета", color: "#ffd966" },
        { id: "stage5", name: s4?.name || "Оплачено", color: "#ffd966" }
      ];
      clients = clients.map((c) =>
        c.stageId === "stage4" ? { ...c, stageId: "stage5", bought: true } : c
      );
    } else if (ids.has("stage3")) {
      stages = [
        stages.find((s) => s.id === "stage1") || defaultStagesEmpty[0],
        stages.find((s) => s.id === "stage2") || defaultStagesEmpty[1],
        { id: "stage3", name: stages.find((s) => s.id === "stage3")?.name || "В работе", color: "#ffd966" },
        { id: "stage4", name: "Выставление счета", color: "#ffd966" },
        { id: "stage5", name: "Оплачено", color: "#ffd966" }
      ];
      clients = clients.map((c) =>
        c.stageId === "stage3" ? { ...c, stageId: "stage5", bought: true } : c
      );
    }
  }

  while (stages.length < 5) {
    const i = stages.length;
    stages.push(defaultStagesEmpty[i]);
  }
  stages = stages.slice(0, 5);

  const settings = ensureSettings({
    ...parsed.settings,
    stages
  });

  return { ...parsed, settings, clients, plan: normalizePlan(parsed.plan) };
}

/** Для ответа API / неизвестного JSON. */
export function normalizeLoadedState(parsed: unknown): AppState {
  if (!parsed || typeof parsed !== "object") return initialEmptyState;
  try {
    return migrateParsed(parsed as AppState);
  } catch {
    return initialEmptyState;
  }
}

export function loadStateLocal(accountLogin: string, projectId: ProjectSlotId): AppState {
  migrateLegacySingleFileInto(accountLogin, projectId);
  const key = getProjectStorageKey(accountLogin, projectId);
  const raw = localStorage.getItem(key);
  if (!raw) return initialEmptyState;
  try {
    const parsed = JSON.parse(raw) as AppState;
    return migrateParsed(parsed);
  } catch {
    return initialEmptyState;
  }
}

export function saveStateLocal(accountLogin: string, projectId: ProjectSlotId, state: AppState): void {
  localStorage.setItem(getProjectStorageKey(accountLogin, projectId), JSON.stringify(state));
}

export function clearStateLocal(accountLogin: string, projectId: ProjectSlotId): void {
  localStorage.removeItem(getProjectStorageKey(accountLogin, projectId));
}
