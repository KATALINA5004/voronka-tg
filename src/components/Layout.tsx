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
      <BottomNav activeScreen={activeScreen} onChange={onChange} />
    </div>
  );
}
