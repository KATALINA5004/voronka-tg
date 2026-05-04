import { Client, Plan, Settings, StageId } from "../types";

export const money = (value: number, currency = "RUB") =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value || 0);

export const percent = (value: number) => `${(value || 0).toFixed(1)}%`;

const safeConv = (a: number, b: number) => (b === 0 ? 0 : (a / b) * 100);

export function getStageClients(clients: Client[], stageId: StageId) {
  return clients.filter((c) => c.stageId === stageId);
}

export function getFunnelMetrics(clients: Client[], _settings: Settings, plan: Plan) {
  const stage1 = getStageClients(clients, "stage1").length;
  const stage2 = getStageClients(clients, "stage2").length;
  const stage3 = getStageClients(clients, "stage3").length;
  const stage4 = getStageClients(clients, "stage4").length;
  const stage5 = getStageClients(clients, "stage5").length;
  const revenue = clients.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0);
  const invoiceTotal = clients.reduce((sum, c) => sum + (Number(c.invoiceAmount) || 0), 0);
  const paidCount = clients.filter((c) => c.paidAmount > 0).length;
  const averageCheck = paidCount ? revenue / paidCount : 0;
  const netProfit = (revenue * plan.profitability) / 100;
  const conversion1 = safeConv(stage2, stage1);
  const conversion2 = safeConv(stage3, stage2);
  const conversion3 = safeConv(stage4, stage3);
  const conversion4 = safeConv(stage5, stage4);
  const totalConversion = safeConv(stage5, stage1);
  return {
    stage1,
    stage2,
    stage3,
    stage4,
    stage5,
    revenue,
    invoiceTotal,
    averageCheck,
    netProfit,
    conversion1,
    conversion2,
    conversion3,
    conversion4,
    totalConversion
  };
}

export function calculatePlan(plan: Plan) {
  const targetRevenue = plan.profitability > 0 ? plan.targetProfit / (plan.profitability / 100) : 0;
  const targetPaidClients = plan.averageCheck > 0 ? Math.ceil(targetRevenue / plan.averageCheck) : 0;
  const requiredStage4 = plan.conversion4to5 > 0 ? Math.ceil(targetPaidClients / (plan.conversion4to5 / 100)) : 0;
  const requiredStage3 = plan.conversion3to4 > 0 ? Math.ceil(requiredStage4 / (plan.conversion3to4 / 100)) : 0;
  const requiredStage2 = plan.conversion2to3 > 0 ? Math.ceil(requiredStage3 / (plan.conversion2to3 / 100)) : 0;
  const requiredStage1 = plan.conversion1to2 > 0 ? Math.ceil(requiredStage2 / (plan.conversion1to2 / 100)) : 0;
  const projectedRevenue = targetPaidClients * plan.averageCheck;
  const projectedProfit = (projectedRevenue * plan.profitability) / 100;
  return {
    targetRevenue,
    targetPaidClients,
    requiredStage4,
    requiredStage3,
    requiredStage2,
    requiredStage1,
    projectedRevenue,
    projectedProfit
  };
}

export function calculateFact(clients: Client[], plan: Plan) {
  const m = getFunnelMetrics(
    clients,
    {
      stages: [],
      currency: "RUB",
      defaultAverageCheck: 0,
      defaultProfitability: 0,
      stageScripts: { stage1: ["", "", ""], stage2: ["", "", ""], stage3: ["", "", ""], stage4: ["", "", ""], stage5: ["", "", ""] },
      touchpointTypes: ["звонок"]
    },
    plan
  );
  return {
    stage1: m.stage1,
    stage2: m.stage2,
    stage3: m.stage3,
    stage4: m.stage4,
    stage5: m.stage5,
    revenue: m.revenue,
    profit: m.netProfit
  };
}

export function calculateProgress(fact: ReturnType<typeof calculateFact>, plan: Plan) {
  const by = (f: number, p: number) => (p ? (f / p) * 100 : 0);
  const calc = calculatePlan(plan);
  return {
    stage1: by(fact.stage1, calc.requiredStage1),
    stage2: by(fact.stage2, calc.requiredStage2),
    stage3: by(fact.stage3, calc.requiredStage3),
    stage4: by(fact.stage4, calc.requiredStage4),
    stage5: by(fact.stage5, calc.targetPaidClients),
    revenue: by(fact.revenue, calc.targetRevenue),
    profit: by(fact.profit, plan.targetProfit)
  };
}

export function calculateDailyDynamics(fact: ReturnType<typeof calculateFact>, plan: Plan) {
  const calc = calculatePlan(plan);
  const start = plan.startDate ? new Date(plan.startDate) : null;
  const end = plan.endDate ? new Date(plan.endDate) : null;
  if (!start || !end || Number.isNaN(+start) || Number.isNaN(+end) || end <= start) {
    return null;
  }
  const MS_DAY = 1000 * 60 * 60 * 24;
  const today = new Date();
  const totalDays = Math.max(1, Math.ceil((+end - +start) / MS_DAY));
  const passedDays = Math.max(0, Math.min(totalDays, Math.ceil((+today - +start) / MS_DAY)));
  const pace = passedDays / totalDays;
  const expectedPaid = calc.targetPaidClients * pace;
  const expectedStage4 = calc.requiredStage4 * pace;
  const expectedStage3 = calc.requiredStage3 * pace;
  const expectedStage2 = calc.requiredStage2 * pace;
  const expectedStage1 = calc.requiredStage1 * pace;
  const expectedProfit = plan.targetProfit * pace;
  const daysLeft = Math.max(0, totalDays - passedDays);
  const perDay = (target: number, factValue: number) => (daysLeft > 0 ? Math.max(0, (target - factValue) / daysLeft) : 0);
  return {
    totalDays,
    passedDays,
    daysLeft,
    expectedStage1,
    expectedStage2,
    expectedStage3,
    expectedStage4,
    expectedPaid,
    expectedProfit,
    perDayStage1: perDay(calc.requiredStage1, fact.stage1),
    perDayStage2: perDay(calc.requiredStage2, fact.stage2),
    perDayStage3: perDay(calc.requiredStage3, fact.stage3),
    perDayStage4: perDay(calc.requiredStage4, fact.stage4),
    perDayStage5: perDay(calc.targetPaidClients, fact.stage5),
    perDayProfit: perDay(plan.targetProfit, fact.profit),
    stage1Delta: fact.stage1 - expectedStage1,
    stage2Delta: fact.stage2 - expectedStage2,
    stage3Delta: fact.stage3 - expectedStage3,
    stage4Delta: fact.stage4 - expectedStage4,
    paidDelta: fact.stage5 - expectedPaid,
    profitDelta: fact.profit - expectedProfit
  };
}

export function getRecommendations(clients: Client[], _settings: Settings, plan: Plan) {
  const m = getFunnelMetrics(clients, _settings, plan);
  const overdue = clients.some((c) => c.nextContactDate && new Date(c.nextContactDate) < new Date());
  const rec: string[] = [];
  const calc = calculatePlan(plan);
  if (calc.requiredStage2 > 0 && m.stage2 < calc.requiredStage2) rec.push("Ниже темп этапа 2: нужно усилить первичные касания");
  if (calc.requiredStage3 > 0 && m.stage3 < calc.requiredStage3) rec.push("Ниже темп этапа 3: нужно усилить обработку интереса");
  if (calc.requiredStage4 > 0 && m.stage4 < calc.requiredStage4) rec.push("Ниже темп этапа 4: не хватает выставленных счетов");
  if (calc.targetPaidClients > 0 && m.stage5 < calc.targetPaidClients) rec.push("Ниже цели по оплатам: нужен дожим на закрытие");
  if (plan.targetProfit > 0 && m.netProfit < plan.targetProfit) rec.push("Чистая прибыль ниже цели: проверьте средний чек и конверсии");
  if (overdue) rec.push("Есть просроченные касания");
  if (rec.length === 0) rec.push("План выполняется хорошо");
  return rec;
}
