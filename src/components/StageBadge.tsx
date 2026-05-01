type Props = { name: string; color: string };

export function StageBadge({ name, color }: Props) {
  return (
    <span className="stage-badge" style={{ background: color }}>
      {name}
    </span>
  );
}
