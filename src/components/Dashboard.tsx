import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Client, Plan, Settings } from "../types";
import { calculateFact, calculatePlan, calculateProgress, getFunnelMetrics, getRecommendations, money, percent } from "../utils/calculations";
import { KpiCard } from "./KpiCard";
import { ProgressBar } from "./ProgressBar";

type Props = {
  clients: Client[];
  settings: Settings;
  plan: Plan;
};

export function Dashboard({ clients, settings, plan }: Props) {
  const metrics = getFunnelMetrics(clients, settings, plan);
  const planCalc = calculatePlan(plan);
  const fact = calculateFact(clients, plan);
  const progress = calculateProgress(fact, plan);
  const recommendations = getRecommendations(clients, settings, plan);

  const stageNames = Object.fromEntries(settings.stages.map((s) => [s.id, s.name]));
  const countData = [
    { name: stageNames.stage1, value: metrics.stage1 },
    { name: stageNames.stage2, value: metrics.stage2 },
    { name: stageNames.stage3, value: metrics.stage3 }
  ];
  const moneyData = [
    { name: "Счет", value: metrics.invoiceTotal },
    { name: "Оплачено", value: metrics.revenue },
    { name: "Прибыль", value: metrics.netProfit }
  ];

  return (
    <div className="stack">
      <section className="kpi-grid">
        <KpiCard title="Всего клиентов" value={clients.length} />
        <KpiCard title="В работе" value={metrics.stage2} />
        <KpiCard title="Оплатили" value={metrics.stage3} />
        <KpiCard title="Выручка" value={money(metrics.revenue, settings.currency)} />
        <KpiCard title="Средний чек" value={money(metrics.averageCheck, settings.currency)} />
        <KpiCard title="Чистая прибыль" value={money(metrics.netProfit, settings.currency)} />
        <KpiCard title="Конверсия 1-2" value={percent(metrics.conversion1)} />
        <KpiCard title="Конверсия 2-3" value={percent(metrics.conversion2)} />
        <KpiCard title="Общая конверсия" value={percent(metrics.totalConversion)} />
      </section>

      <section className="card">
        <h3 className="purple">Воронка продаж</h3>
        <div className="funnel-table">
          <div className="yellow">{stageNames.stage1}: {metrics.stage1}</div>
          <div className="green">Конверсия 1-2: {percent(metrics.conversion1)}</div>
          <div className="yellow">{stageNames.stage2}: {metrics.stage2}</div>
          <div className="green">Конверсия 2-3: {percent(metrics.conversion2)}</div>
          <div className="yellow">{stageNames.stage3}: {metrics.stage3}</div>
          <div className="green">Средний чек: {money(metrics.averageCheck, settings.currency)}</div>
          <div className="yellow">Выручка: {money(metrics.revenue, settings.currency)}</div>
          <div className="green">Рентабельность: {percent(plan.profitability)}</div>
          <div className="yellow">Чистая прибыль: {money(metrics.netProfit, settings.currency)}</div>
        </div>
      </section>

      <section className="card">
        <h3>Клиенты по этапам</h3>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height={220}><BarChart data={countData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#229ED9" /></BarChart></ResponsiveContainer></div>
      </section>

      <section className="card">
        <h3>Деньги по этапам</h3>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height={220}><BarChart data={moneyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#b6d7a8" /></BarChart></ResponsiveContainer></div>
      </section>

      <section className="card">
        <h3>План / Факт</h3>
        <ProgressBar label="Потенциальные" value={progress.leads} />
        <ProgressBar label="В работе" value={progress.stage2} />
        <ProgressBar label="Оплатили" value={progress.stage3} />
        <ProgressBar label="Выручка" value={progress.revenue} />
        <ProgressBar label="Чистая прибыль" value={progress.profit} />
      </section>

      <section className="card">
        <h3>Прогноз</h3>
        <p>Этап 2: {planCalc.stage2} клиентов</p>
        <p>Этап 3: {planCalc.stage3} клиентов</p>
        <p>Ожидаемая выручка: {money(planCalc.revenue, settings.currency)}</p>
        <p>Ожидаемая чистая прибыль: {money(planCalc.profit, settings.currency)}</p>
      </section>

      <section className="card">
        <h3>Что делать дальше</h3>
        {recommendations.map((r) => <p key={r}>- {r}</p>)}
      </section>
    </div>
  );
}
