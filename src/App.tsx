import { useEffect, useState } from "react";
import { ClientModal } from "./components/ClientModal";
import { ClientTable } from "./components/ClientTable";
import { Dashboard } from "./components/Dashboard";
import { FunnelCalculator } from "./components/FunnelCalculator";
import { ImportModal } from "./components/ImportModal";
import { Layout } from "./components/Layout";
import { Settings } from "./components/Settings";
import { emptyClient, useAppData } from "./store/useAppData";
import { ActiveScreen, Client, ProjectSlotId, StageId } from "./types";
import { loadProjectLabels, readSavedProjectSlot, saveProjectLabels, writeSavedProjectSlot } from "./utils/projectMeta";
import { formatCallStatusCommentLine } from "./utils/callStatus";
import { moveClientToEndOfTheirStage } from "./utils/clientOrder";
import { mergeImportedClients } from "./utils/importExport";
import { AccessGate } from "./components/AccessGate";
import { initTelegram } from "./utils/telegram";

function App() {
  const [projectSlot, setProjectSlot] = useState<ProjectSlotId>(() => readSavedProjectSlot());
  const [projectLabels, setProjectLabels] = useState(() => loadProjectLabels());
  const { state, actions } = useAppData(projectSlot);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("dashboard");
  const [activeStageId, setActiveStageId] = useState<StageId>("stage1");
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    initTelegram();
  }, []);

  useEffect(() => {
    writeSavedProjectSlot(projectSlot);
  }, [projectSlot]);

  const handleProjectSlotChange = (id: ProjectSlotId) => {
    setProjectSlot(id);
    setActiveScreen("dashboard");
    setActiveStageId("stage1");
    setModalClient(null);
    setImportOpen(false);
  };

  const screen = (() => {
    if (activeScreen === "dashboard") return <Dashboard clients={state.clients} settings={state.settings} plan={state.plan} />;
    if (activeScreen === "clients")
      return (
        <ClientTable
          key={projectSlot}
          projectSlot={projectSlot}
          clients={state.clients}
          stages={state.settings.stages}
          stageScripts={state.settings.stageScripts}
          activeStageId={activeStageId}
          onStageTabChange={setActiveStageId}
          onAdd={() => setModalClient(emptyClient(activeStageId))}
          onOpen={setModalClient}
          onMove={actions.moveClient}
          onSelectScript={(id, scriptVariantIndex) => {
            const client = state.clients.find((c) => c.id === id);
            if (!client) return;
            actions.upsertClient({ ...client, scriptVariantIndex, scriptStageId: client.stageId });
          }}
          onApplyScriptToStage={(stageId, scriptVariantIndex) => {
            actions.setClients(
              state.clients.map((client) =>
                client.stageId === stageId ? { ...client, scriptVariantIndex, scriptStageId: stageId } : client
              )
            );
          }}
          onDelete={actions.deleteClient}
          onOpenImport={() => setImportOpen(true)}
          onQuickCallStatus={(clientId, code) => {
            const client = state.clients.find((c) => c.id === clientId);
            if (!client) return;
            const line = formatCallStatusCommentLine(code);
            const base = (client.comment || "").trimEnd();
            const updated: Client = {
              ...client,
              comment: base ? `${base}\n${line}` : line
            };
            actions.setClients(moveClientToEndOfTheirStage(state.clients, updated));
          }}
        />
      );
    if (activeScreen === "calculator")
      return <FunnelCalculator plan={state.plan} settings={state.settings} clients={state.clients} onChange={actions.updatePlan} />;
    return (
      <Settings
        settings={state.settings}
        projectSlot={projectSlot}
        projectLabels={projectLabels}
        onSave={actions.updateSettings}
        onSaveProjectLabels={(labels) => {
          saveProjectLabels(labels);
          setProjectLabels(labels);
        }}
        onResetDemo={actions.resetDemo}
        onClearAll={actions.clearAll}
      />
    );
  })();

  return (
    <AccessGate>
    <Layout
      activeScreen={activeScreen}
      onChange={setActiveScreen}
      projectSlot={projectSlot}
      projectLabels={projectLabels}
      onProjectSlotChange={handleProjectSlotChange}
    >
      {screen}
      {modalClient && (
        <ClientModal
          client={modalClient}
          stages={state.settings.stages}
          settings={state.settings}
          onClose={() => setModalClient(null)}
          onSave={(client) => {
            actions.upsertClient(client);
            setModalClient(null);
          }}
          onAddTouchpoint={actions.addTouchpoint}
        />
      )}
      {importOpen && (
        <ImportModal
          stages={state.settings.stages}
          onClose={() => setImportOpen(false)}
          onImport={(rows, stageId, baseType) => {
            actions.setClients(mergeImportedClients(state.clients, rows, stageId, baseType));
            setImportOpen(false);
          }}
        />
      )}
    </Layout>
    </AccessGate>
  );
}

export default App;
