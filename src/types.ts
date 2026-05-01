export type StageId = "stage1" | "stage2" | "stage3" | "stage4";

export type Stage = {
  id: StageId;
  name: string;
  color: string;
};

export type Touchpoint = {
  id: string;
  date: string;
  type: string;
  text: string;
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
  touchpoints: Touchpoint[];
};

export type Plan = {
  period: string;
  plannedLeads: number;
  conversion1: number;
  conversion2: number;
  averageCheck: number;
  profitability: number;
  targetRevenue: number;
  targetProfit: number;
};

export type Settings = {
  stages: Stage[];
  currency: string;
  defaultAverageCheck: number;
  defaultProfitability: number;
};

export type AppState = {
  clients: Client[];
  settings: Settings;
  plan: Plan;
};

export type ActiveScreen = "dashboard" | "clients" | "calculator" | "settings";
