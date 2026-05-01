type Props = { value: number; label: string };

export function ProgressBar({ value, label }: Props) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-item">
      <div className="progress-label">
        <span>{label}</span>
        <span>{safe.toFixed(1)}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
