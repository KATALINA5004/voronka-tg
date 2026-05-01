import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  text: string;
  buttonText?: string;
  onClick?: () => void;
};

export function EmptyState({ icon, title, text, buttonText, onClick }: Props) {
  return (
    <div className="empty-state">
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {buttonText && onClick && <button onClick={onClick}>{buttonText}</button>}
    </div>
  );
}
