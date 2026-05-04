import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { ActiveScreen, PROJECT_SLOT_IDS, ProjectSlotId } from "../types";
import { projectTitle, type ProjectLabels } from "../utils/projectMeta";

type Props = {
  activeScreen: ActiveScreen;
  onChange: (screen: ActiveScreen) => void;
  projectSlot: ProjectSlotId;
  projectLabels: ProjectLabels;
  onProjectSlotChange: (id: ProjectSlotId) => void;
  children: ReactNode;
};

export function Layout({ activeScreen, onChange, projectSlot, projectLabels, onProjectSlotChange, children }: Props) {
  return (
    <div className="app-shell">
      <Header />
      <div className="project-switcher" role="tablist" aria-label="Рабочие проекты">
        {PROJECT_SLOT_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={projectSlot === id}
            className={projectSlot === id ? "project-tab active" : "project-tab"}
            onClick={() => onProjectSlotChange(id)}
          >
            {projectTitle(id, projectLabels)}
          </button>
        ))}
      </div>
      <main className="content">{children}</main>
      <div className="scroll-actions">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Вверх</button>
        <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>Вниз</button>
      </div>
      <BottomNav activeScreen={activeScreen} onChange={onChange} />
    </div>
  );
}
