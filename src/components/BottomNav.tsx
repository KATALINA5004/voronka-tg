import { BarChart3, Calculator, Settings, Users } from "lucide-react";
import { ReactNode } from "react";
import { ActiveScreen } from "../types";

type Props = {
  activeScreen: ActiveScreen;
  onChange: (screen: ActiveScreen) => void;
};

const items: { id: ActiveScreen; label: string; icon: ReactNode }[] = [
  { id: "dashboard", label: "Дашборд", icon: <BarChart3 size={16} /> },
  { id: "clients", label: "Клиенты", icon: <Users size={16} /> },
  { id: "calculator", label: "План", icon: <Calculator size={16} /> },
  { id: "settings", label: "Настройки", icon: <Settings size={16} /> }
];

export function BottomNav({ activeScreen, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button key={item.id} className={activeScreen === item.id ? "active" : ""} onClick={() => onChange(item.id)}>
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}
