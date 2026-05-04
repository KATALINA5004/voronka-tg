import { Funnel, FunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import { Client, Plan, Settings } from "../types";
import { calculateDailyDynamics, calculateFact, calculatePlan, calculateProgress, money } from "../utils/calculations";

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
  const dynamics = calculateDailyDynamics(fact, plan);
  const stageNames = Object.fromEntries(settings.stages.map((s) => [s.id, s.name])) as Record<string, string>;
  const planFunnelData = [
    { name: stageNames.stage1 || "Этап 1", value: calc.requiredStage1 },
    { name: stageNames.stage2 || "Этап 2", value: calc.requiredStage2 },
    { name: stageNames.stage3 || "Этап 3", value: calc.requiredStage3 },
    { name: stageNames.stage4 || "Этап 4", value: calc.requiredStage4 },
    { name: stageNames.stage5 || "Этап 5", value: calc.targetPaidClients }
  ];
  const factFunnelData = [
    { name: stageNames.stage1 || "Этап 1", value: fact.stage1 },
    { name: stageNames.stage2 || "Этап 2", value: fact.stage2 },
    { name: stageNames.stage3 || "Этап 3", value: fact.stage3 },
    { name: stageNames.stage4 || "Этап 4", value: fact.stage4 },
    { name: stageNames.stage5 || "Этап 5", value: fact.stage5 }
  ];

  const numberField = (key: keyof Plan, label: string) => (
    <label>
      {label}
      <input type="number" value={plan[key] as number} onChange={(e) => onChange({ ...plan, [key]: Number(e.target.value) })} />
    </label>
  );
  const r = (v: number) => Math.round(v);
  const r1 = (v: number) => Math.round(v * 10) / 10;

  return (
    <div className="stack">
      <section className="card form-grid">
        <label>Название плана<input value={plan.period} onChange={(e) => onChange({ ...plan, period: e.target.value })} /></label>
        <label>Дата старта<input type="date" value={plan.startDate} onChange={(e) => onChange({ ...plan, startDate: e.target.value })} /></label>
        <label>Дата завершения<input type="date" value={plan.endDate} onChange={(e) => onChange({ ...plan, endDate: e.target.value })} /></label>
        {numberField("targetProfit", "Сколько хотим заработать (чистая прибыль)")}
        {numberField("averageCheck", "Плановый средний чек")}
        {numberField("profitability", "Рентабельность, %")}
        {numberField("conversion1to2", `Конверсия: ${stageNames.stage1 || "Этап 1"} -> ${stageNames.stage2 || "Этап 2"}, %`)}
        {numberField("conversion2to3", `Конверсия: ${stageNames.stage2 || "Этап 2"} -> ${stageNames.stage3 || "Этап 3"}, %`)}
        {numberField("conversion3to4", `Конверсия: ${stageNames.stage3 || "Этап 3"} -> ${stageNames.stage4 || "Этап 4"}, %`)}
        {numberField("conversion4to5", `Конверсия: ${stageNames.stage4 || "Этап 4"} -> ${stageNames.stage5 || "Этап 5"}, %`)}
      </section>
      <section className="card">
        <h3>Автоматический расчет</h3>
        <p>Нужная выручка для цели по прибыли: {money(calc.targetRevenue, settings.currency)}</p>
        <p>Нужно успешных оплат ({stageNames.stage5 || "Этап 5"}): {calc.targetPaidClients}</p>
        <p>
          При ваших процентах нужно довести до этапов: {stageNames.stage1 || "Этап 1"} — {calc.requiredStage1}, {stageNames.stage2 || "Этап 2"} — {calc.requiredStage2},{" "}
          {stageNames.stage3 || "Этап 3"} — {calc.requiredStage3}, {stageNames.stage4 || "Этап 4"} — {calc.requiredStage4}, {stageNames.stage5 || "Этап 5"} — {calc.targetPaidClients}
        </p>
        <p>Расчетная прибыль по вашим целям: {money(calc.projectedProfit, settings.currency)}</p>
        <p>Расчетная выручка по вашим целям: {money(calc.projectedRevenue, settings.currency)}</p>
      </section>
      <section className="card">
        <h3>Воронка: план и факт</h3>
        <div className="funnel-compare-grid">
          <div>
            <h4>Плановая воронка</h4>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={planFunnelData} isAnimationActive={false} fill="#229ED9">
                    <LabelList dataKey="name" position="right" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h4>Фактическая воронка</h4>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel dataKey="value" data={factFunnelData} isAnimationActive={false} fill="#7c9df7">
                    <LabelList dataKey="name" position="right" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
      <section className="card">
        <h3>Сравнение план/факт</h3>
        <p>Факт {stageNames.stage1 || "Этап 1"}: {fact.stage1} ({progress.stage1.toFixed(1)}%)</p>
        <p>Факт {stageNames.stage2 || "Этап 2"}: {fact.stage2} ({progress.stage2.toFixed(1)}%)</p>
        <p>Факт {stageNames.stage3 || "Этап 3"}: {fact.stage3} ({progress.stage3.toFixed(1)}%)</p>
        <p>Факт {stageNames.stage4 || "Этап 4"}: {fact.stage4} ({progress.stage4.toFixed(1)}%)</p>
        <p>Факт {stageNames.stage5 || "Этап 5"}: {fact.stage5} ({progress.stage5.toFixed(1)}%)</p>
        <p>Факт выручки: {money(fact.revenue, settings.currency)} ({progress.revenue.toFixed(1)}%)</p>
        <p>Факт чистой прибыли: {money(fact.profit, settings.currency)} ({progress.profit.toFixed(1)}%)</p>
      </section>
      <section className="card">
        <h3>Динамика по сроку</h3>
        {!dynamics ? (
          <p>Укажите корректные даты старта и завершения плана, чтобы видеть ежедневный темп.</p>
        ) : (
          <>
            <p>Прошло дней: {dynamics.passedDays} из {dynamics.totalDays}, осталось: {dynamics.daysLeft}</p>
            <p className={dynamics.stage1Delta < 0 ? "warning" : ""}>
              По темпу {stageNames.stage1 || "этап 1"}: ожидалось {r(dynamics.expectedStage1)}, факт {fact.stage1}, отклонение {r(dynamics.stage1Delta)}. Нужно в день: {r1(dynamics.perDayStage1)}
            </p>
            <p className={dynamics.stage2Delta < 0 ? "warning" : ""}>
              По темпу {stageNames.stage2 || "этап 2"}: ожидалось {r(dynamics.expectedStage2)}, факт {fact.stage2}, отклонение {r(dynamics.stage2Delta)}. Нужно в день: {r1(dynamics.perDayStage2)}
            </p>
            <p className={dynamics.stage3Delta < 0 ? "warning" : ""}>
              По темпу {stageNames.stage3 || "этап 3"}: ожидалось {r(dynamics.expectedStage3)}, факт {fact.stage3}, отклонение {r(dynamics.stage3Delta)}. Нужно в день: {r1(dynamics.perDayStage3)}
            </p>
            <p className={dynamics.stage4Delta < 0 ? "warning" : ""}>
              По темпу {stageNames.stage4 || "этап 4"}: ожидалось {r(dynamics.expectedStage4)}, факт {fact.stage4}, отклонение {r(dynamics.stage4Delta)}. Нужно в день: {r1(dynamics.perDayStage4)}
            </p>
            <p className={dynamics.paidDelta < 0 ? "warning" : ""}>
              По темпу {stageNames.stage5 || "этап 5"}: ожидалось {r(dynamics.expectedPaid)}, факт {fact.stage5}, отклонение {r(dynamics.paidDelta)}. Нужно в день: {r1(dynamics.perDayStage5)}
            </p>
            <p className={dynamics.profitDelta < 0 ? "warning" : ""}>
              По темпу прибыли: ожидалось {money(dynamics.expectedProfit, settings.currency)}, факт {money(fact.profit, settings.currency)}, отклонение {money(dynamics.profitDelta, settings.currency)}. Нужно в день: {money(dynamics.perDayProfit, settings.currency)}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
