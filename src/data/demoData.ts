import { AppState, Stage } from "../types";

const stages: Stage[] = [
  { id: "stage1", name: "Потенциальные", color: "#ffd966" },
  { id: "stage2", name: "Проявлен интерес", color: "#ffd966" },
  { id: "stage3", name: "В работе", color: "#ffd966" },
  { id: "stage4", name: "Выставление счета", color: "#ffd966" },
  { id: "stage5", name: "Оплачено", color: "#ffd966" }
];

export const demoData: AppState = {
  clients: [],
  settings: {
    stages,
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
