import { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
};

export function KpiCard({ title, value, subtitle, icon }: Props) {
  return (
    <article className="kpi-card">
      <div className="kpi-top">
        <span>{title}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      {subtitle && <small>{subtitle}</small>}
    </article>
  );
}
