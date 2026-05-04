import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Client, Plan, Settings, StageId } from "../types";
import { computeScriptEffectivenessForStage } from "../utils/scriptAnalytics";
import { calculateFact, calculatePlan, calculateProgress, getFunnelMetrics, getRecommendations, money, percent } from "../utils/calculations";
import { KpiCard } from "./KpiCard";
import { ProgressBar } from "./ProgressBar";

type Props = {
  clients: Client[];
  settings: Settings;
  plan: Plan;
};

export function Dashboard({ clients, settings, plan }: Props) {
  const [scriptReportStageId, setScriptReportStageId] = useState<StageId>("stage1");
  const scriptEffectRows = computeScriptEffectivenessForStage(clients, scriptReportStageId);
  const metrics = getFunnelMetrics(clients, settings, plan);
  const planCalc = calculatePlan(plan);
  const fact = calculateFact(clients, plan);
  const progress = calculateProgress(fact, plan);
  const recommendations = getRecommendations(clients, settings, plan);

  const stageNames = Object.fromEntries(settings.stages.map((s) => [s.id, s.name]));
  const countData = [
    { name: stageNames.stage1, value: metrics.stage1 },
    { name: stageNames.stage2, value: metrics.stage2 },
    { name: stageNames.stage3, value: metrics.stage3 },
    { name: stageNames.stage4, value: metrics.stage4 },
    { name: stageNames.stage5, value: metrics.stage5 }
  ];

  return (
    <div className="stack">
      <section className="kpi-grid">
        <KpiCard title="Всего клиентов" value={clients.length} />
        <KpiCard title="В работе" value={metrics.stage2} />
        <KpiCard title={stageNames.stage5} value={metrics.stage5} />
        <KpiCard title="Выручка" value={money(metrics.revenue, settings.currency)} />
        <KpiCard title="Средний чек" value={money(metrics.averageCheck, settings.currency)} />
        <KpiCard title="Чистая прибыль" value={money(metrics.netProfit, settings.currency)} />
        <KpiCard title="Конверсия 1-2" value={percent(metrics.conversion1)} />
        <KpiCard title="Конверсия 2-3" value={percent(metrics.conversion2)} />
        <KpiCard title="Конверсия 3-4" value={percent(metrics.conversion3)} />
        <KpiCard title="Конверсия 4-5" value={percent(metrics.conversion4)} />
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
          <div className="green">Конверсия 3-4: {percent(metrics.conversion3)}</div>
          <div className="yellow">{stageNames.stage4}: {metrics.stage4}</div>
          <div className="green">Конверсия 4-5: {percent(metrics.conversion4)}</div>
          <div className="yellow">{stageNames.stage5}: {metrics.stage5}</div>
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
        <h3>Статистика по скриптам этапа</h3>
        <p className="text-muted">
          Сколько клиентов когда-либо фиксировали этот вариант скрипта на выбранном этапе и какая доля затем оказалась глубже по воронке (перешла на следующие этапы).
        </p>
        <label className="script-report-stage">
          Этап для отчёта
          <select value={scriptReportStageId} onChange={(e) => setScriptReportStageId(e.target.value as StageId)}>
            {settings.stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <div className="table-wrap script-eff-wrap">
          <table className="script-eff-table">
            <thead>
              <tr>
                <th>Вариант скрипта</th>
                <th>Клиентов с фиксацией</th>
                <th>Перешли дальше по воронке</th>
                <th>Доля «продвижения»</th>
              </tr>
            </thead>
            <tbody>
              {scriptEffectRows.map((row) => (
                <tr key={row.variantIndex}>
                  <td>Скрипт {row.variantIndex + 1}</td>
                  <td>{row.usedCount}</td>
                  <td>{row.advancedCount}</td>
                  <td>{row.ratePercent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>План / Факт</h3>
        <ProgressBar label="Этап 1" value={progress.stage1} />
        <ProgressBar label="Этап 2" value={progress.stage2} />
        <ProgressBar label="Этап 3" value={progress.stage3} />
        <ProgressBar label="Этап 4" value={progress.stage4} />
        <ProgressBar label="Оплатили (этап 5)" value={progress.stage5} />
        <ProgressBar label="Выручка" value={progress.revenue} />
        <ProgressBar label="Чистая прибыль" value={progress.profit} />
      </section>

      <section className="card">
        <h3>Прогноз</h3>
        <p>Для цели по прибыли нужна выручка: {money(planCalc.targetRevenue, settings.currency)}</p>
        <p>Нужно оплат: {planCalc.targetPaidClients}</p>
        <p>Нужно на этап 4: {planCalc.requiredStage4}</p>
        <p>Нужно на этап 3: {planCalc.requiredStage3}</p>
        <p>Нужно на этап 2: {planCalc.requiredStage2}</p>
        <p>Нужно на этап 1: {planCalc.requiredStage1}</p>
      </section>

      <section className="card">
        <h3>Что делать дальше</h3>
        {recommendations.map((r) => <p key={r}>- {r}</p>)}
      </section>
    </div>
  );
}
