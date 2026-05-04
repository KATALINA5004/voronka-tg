export type StageId = "stage1" | "stage2" | "stage3" | "stage4" | "stage5";

export type Stage = {
  id: StageId;
  name: string;
  color: string;
};

export type StageScripts = Record<StageId, string[]>;

export type Touchpoint = {
  id: string;
  date: string;
  type: string;
  text: string;
};

/** Фиксация использования скрипта (какой вариант на каком этапе и текст на момент сохранения). */
export type ScriptHistoryEntry = {
  id: string;
  at: string;
  stageId: StageId;
  variantIndex: number;
  templateText: string;
};

export type Client = {
  id: string;
  stageId: StageId;
  createdAt: string;
  updatedAt: string;
  date: string;
  fullName: string;
  rating: number | null;
  phone: string;
  source: string;
  /** Тип/источник базы: например "TG канал", "CRM", "Партнеры" */
  baseType: string;
  manager: string;
  comment: string;
  niche: string;
  nextContactDate: string;
  email: string;
  instagram: string;
  telegram: string;
  vk: string;
  invoiceAmount: number;
  paidAmount: number;
  repeats: number;
  bought: boolean;
  /** 0–2: какой из 3 шаблонов этапа выбран; null — не выбран */
  scriptVariantIndex: number | null;
  /** На каком этапе выбран/зафиксирован скрипт */
  scriptStageId: StageId | null;
  /** Все зафиксированные варианты скриптов по ходу работы */
  scriptHistory: ScriptHistoryEntry[];
  touchpoints: Touchpoint[];
};

export type Plan = {
  /** Название плана */
  period: string;
  /** Дата старта плана */
  startDate: string;
  /** Дата дедлайна плана */
  endDate: string;
  /** Цель по чистой прибыли */
  targetProfit: number;
  averageCheck: number;
  profitability: number;
  /** Сколько оплат нужно для targetProfit */
  targetPaidClients: number;
  conversion4to5: number;
  conversion3to4: number;
  conversion2to3: number;
  conversion1to2: number;
};

export type Settings = {
  stages: Stage[];
  currency: string;
  defaultAverageCheck: number;
  defaultProfitability: number;
  /** По 3 шаблона на каждый этап; используйте {имя} */
  stageScripts: StageScripts;
  /** Набор типов касаний для карточки клиента */
  touchpointTypes: string[];
};

export type AppState = {
  clients: Client[];
  settings: Settings;
  plan: Plan;
};

export type ActiveScreen = "dashboard" | "clients" | "calculator" | "settings";
