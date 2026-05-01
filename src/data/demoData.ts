import { AppState, Client, Stage } from "../types";

const now = new Date();
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const byDays = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return fmt(d);
};

const stages: Stage[] = [
  { id: "stage1", name: "Потенциальные", color: "#ffd966" },
  { id: "stage2", name: "Проявлен интерес", color: "#ffd966" },
  { id: "stage3", name: "Выставление счета", color: "#ffd966" },
  { id: "stage4", name: "Оплачено", color: "#ffd966" }
];

const mkClient = (id: number, stageId: Client["stageId"], paid = 0): Client => ({
  id: `client-${id}`,
  stageId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  date: byDays(-id * 2),
  fullName: `Клиент ${id}`,
  rating: (id % 10) + 1,
  phone: `+7999000${String(id).padStart(4, "0")}`,
  source: ["Instagram", "Telegram", "Рекомендация"][id % 3],
  manager: ["Анна", "Иван", "Мария"][id % 3],
  comment: "Первичный контакт",
  niche: ["Услуги", "Онлайн-школа", "Ритейл"][id % 3],
  nextContactDate: byDays(id % 4 === 0 ? -2 : id),
  email: `client${id}@mail.ru`,
  instagram: `@client${id}`,
  telegram: `client${id}`,
  vk: `vk.com/client${id}`,
  invoiceAmount: paid > 0 ? paid * 1.2 : 25000 + id * 1000,
  paidAmount: paid,
  repeats: id % 4,
  bought: stageId === "stage4" || paid > 0,
  touchpoints: []
});

const clients: Client[] = [
  ...Array.from({ length: 12 }, (_, i) => mkClient(i + 1, "stage1", 0)),
  ...Array.from({ length: 7 }, (_, i) => mkClient(i + 13, "stage2", 0)),
  ...Array.from({ length: 4 }, (_, i) => mkClient(i + 20, "stage3", 0)),
  mkClient(24, "stage4", 35000),
  mkClient(25, "stage4", 42000),
  mkClient(26, "stage4", 56000)
];

export const demoData: AppState = {
  clients,
  settings: {
    stages,
    currency: "RUB",
    defaultAverageCheck: 40000,
    defaultProfitability: 35
  },
  plan: {
    period: "Май 2026",
    plannedLeads: 60,
    conversion1: 35,
    conversion2: 25,
    averageCheck: 40000,
    profitability: 35,
    targetRevenue: 500000,
    targetProfit: 180000
  }
};
