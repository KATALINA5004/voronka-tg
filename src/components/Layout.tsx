import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { ActiveScreen } from "../types";

type Props = {
  activeScreen: ActiveScreen;
  onChange: (screen: ActiveScreen) => void;
  children: ReactNode;
};

export function Layout({ activeScreen, onChange, children }: Props) {
  return (
    <div className="app-shell">
      <Header />
      <main className="content">{children}</main>
      <div className="scroll-actions">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Вверх</button>
        <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>Вниз</button>
      </div>
      <BottomNav activeScreen={activeScreen} onChange={onChange} />
    </div>
  );
}
