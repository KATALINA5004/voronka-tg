import { Client, Plan, Settings, StageId } from "../types";

export const money = (value: number, currency = "RUB") =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);

export const percent = (value: number) => `${(value || 0).toFixed(1)}%`;

const safeConv = (a: number, b: number) => (b === 0 ? 0 : (a / b) * 100);

export function getStageClients(clients: Client[], stageId: StageId) {
  return clients.filter((c) => c.stageId === stageId);
}

export function getFunnelMetrics(clients: Client[], settings: Settings, plan: Plan) {
  const stage1 = getStageClients(clients, "stage1").length;
  const stage2 = getStageClients(clients, "stage2").length;
  const stage3 = getStageClients(clients, "stage3").length;
  const revenue = clients.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
  const invoiceTotal = clients.reduce((sum, c) => sum + (Number(c.invoiceAmount) || 0), 0);
  const paidCount = clients.filter((c) => c.paidAmount > 0).length;
  const averageCheck = paidCount ? revenue / paidCount : 0;
  const netProfit = (revenue * plan.profitability) / 100;
  const conversion1 = safeConv(stage2, stage1);
  const conversion2 = safeConv(stage3, stage2);
  const totalConversion = safeConv(stage3, stage1);
  return { stage1, stage2, stage3, revenue, invoiceTotal, averageCheck, netProfit, conversion1, conversion2, totalConversion };
}

export function calculatePlan(plan: Plan) {
  const stage2 = Math.ceil((plan.plannedLeads * plan.conversion1) / 100);
  const stage3 = Math.ceil((stage2 * plan.conversion2) / 100);
  const revenue = stage3 * plan.averageCheck;
  const profit = (revenue * plan.profitability) / 100;
  const conv1 = plan.conversion1 / 100 || 0;
  const conv2 = plan.conversion2 / 100 || 0;
  const requiredPaidForRevenue = plan.averageCheck ? plan.targetRevenue / plan.averageCheck : 0;
  const requiredStage2ForRevenue = conv2 ? requiredPaidForRevenue / conv2 : 0;
  const requiredLeadsForRevenue = conv1 ? requiredStage2ForRevenue / conv1 : 0;
  const requiredRevenueForProfit = plan.profitability ? plan.targetProfit / (plan.profitability / 100) : 0;
  const requiredPaidForProfit = plan.averageCheck ? requiredRevenueForProfit / plan.averageCheck : 0;
  const requiredStage2ForProfit = conv2 ? requiredPaidForProfit / conv2 : 0;
  const requiredLeadsForProfit = conv1 ? requiredStage2ForProfit / conv1 : 0;
  return {
    stage2,
    stage3,
    revenue,
    profit,
    requiredPaidForRevenue: Math.ceil(requiredPaidForRevenue),
    requiredStage2ForRevenue: Math.ceil(requiredStage2ForRevenue),
    requiredLeadsForRevenue: Math.ceil(requiredLeadsForRevenue),
    requiredRevenueForProfit,
    requiredPaidForProfit: Math.ceil(requiredPaidForProfit),
    requiredStage2ForProfit: Math.ceil(requiredStage2ForProfit),
    requiredLeadsForProfit: Math.ceil(requiredLeadsForProfit)
  };
}

export function calculateFact(clients: Client[], plan: Plan) {
  const m = getFunnelMetrics(clients, { stages: [], currency: "RUB", defaultAverageCheck: 0, defaultProfitability: 0 }, plan);
  return {
    leads: m.stage1,
    stage2: m.stage2,
    stage3: m.stage3,
    revenue: m.revenue,
    profit: m.netProfit
  };
}

export function calculateProgress(fact: ReturnType<typeof calculateFact>, plan: Plan) {
  const by = (f: number, p: number) => (p ? (f / p) * 100 : 0);
  return {
    leads: by(fact.leads, plan.plannedLeads),
    stage2: by(fact.stage2, (plan.plannedLeads * plan.conversion1) / 100),
    stage3: by(fact.stage3, ((plan.plannedLeads * plan.conversion1) / 100) * (plan.conversion2 / 100)),
    revenue: by(fact.revenue, plan.targetRevenue),
    profit: by(fact.profit, plan.targetProfit)
  };
}

export function getRecommendations(clients: Client[], _settings: Settings, plan: Plan) {
  const m = getFunnelMetrics(clients, _settings, plan);
  const overdue = clients.some((c) => c.nextContactDate && new Date(c.nextContactDate) < new Date());
  const rec: string[] = [];
  if (m.stage1 > m.stage2 * 2) rec.push("Нужно перевести больше клиентов в работу");
  if (m.stage2 > m.stage3 * 2) rec.push("Нужно усилить дожим и оффер");
  if (m.stage3 < ((plan.plannedLeads * plan.conversion1) / 100) * (plan.conversion2 / 100)) rec.push("Вы отстаете от плана продаж");
  if (overdue) rec.push("Есть просроченные касания");
  if (rec.length === 0) rec.push("План выполняется хорошо");
  return rec;
}
