import { Client, Plan, Settings } from "../types";
import { calculateFact, calculatePlan, calculateProgress, money } from "../utils/calculations";

type Props = {
  plan: Plan;
  clients: Client[];
  settings: Settings;
  onChange: (plan: Plan) => void;
};

export function FunnelCalculator({ plan, clients, settings, onChange }: Props) {
  const calc = calculatePlan(plan);
  const fact = calculateFact(clients, plan);
  const progress = calculateProgress(fact, plan);

  const numberField = (key: keyof Plan, label: string) => (
    <label>
      {label}
      <input type="number" value={plan[key] as number} onChange={(e) => onChange({ ...plan, [key]: Number(e.target.value) })} />
    </label>
  );

  return (
    <div className="stack">
      <section className="card form-grid">
        <label>Плановый период<input value={plan.period} onChange={(e) => onChange({ ...plan, period: e.target.value })} /></label>
        {numberField("plannedLeads", "Сколько потенциальных клиентов хотим получить")}
        {numberField("conversion1", "Плановая конверсия из 1 этапа во 2, %")}
        {numberField("conversion2", "Плановая конверсия из 2 этапа в 3, %")}
        {numberField("averageCheck", "Плановый средний чек")}
        {numberField("profitability", "Рентабельность, %")}
        {numberField("targetRevenue", "Целевая выручка")}
        {numberField("targetProfit", "Целевая чистая прибыль")}
      </section>
      <section className="card">
        <h3>Автоматический расчет</h3>
        <p>Клиенты на 2 этапе: {calc.stage2}</p>
        <p>Клиенты на 3 этапе: {calc.stage3}</p>
        <p>Ожидаемая выручка: {money(calc.revenue, settings.currency)}</p>
        <p>Ожидаемая чистая прибыль: {money(calc.profit, settings.currency)}</p>
        <p>Нужно лидов для целевой выручки: {calc.requiredLeadsForRevenue}</p>
        <p>Нужно клиентов на этапе 2 для выручки: {calc.requiredStage2ForRevenue}</p>
        <p>Нужно клиентов на этапе 3 для выручки: {calc.requiredPaidForRevenue}</p>
        <p>Нужно лидов для целевой прибыли: {calc.requiredLeadsForProfit}</p>
        <p>Нужно клиентов на этапе 2 для прибыли: {calc.requiredStage2ForProfit}</p>
        <p>Нужно клиентов на этапе 3 для прибыли: {calc.requiredPaidForProfit}</p>
      </section>
      <section className="card">
        <h3>Сравнение план/факт</h3>
        <p>Факт потенциальных: {fact.leads} ({progress.leads.toFixed(1)}%)</p>
        <p>Факт в работе: {fact.stage2} ({progress.stage2.toFixed(1)}%)</p>
        <p>Факт оплатили: {fact.stage3} ({progress.stage3.toFixed(1)}%)</p>
        <p>Факт выручки: {money(fact.revenue, settings.currency)} ({progress.revenue.toFixed(1)}%)</p>
        <p>Факт чистой прибыли: {money(fact.profit, settings.currency)} ({progress.profit.toFixed(1)}%)</p>
      </section>
    </div>
  );
}
