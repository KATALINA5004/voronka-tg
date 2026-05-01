import { useEffect, useState } from "react";
import { ClientModal } from "./components/ClientModal";
import { ClientTable } from "./components/ClientTable";
import { Dashboard } from "./components/Dashboard";
import { FunnelCalculator } from "./components/FunnelCalculator";
import { ImportModal } from "./components/ImportModal";
import { Layout } from "./components/Layout";
import { Settings } from "./components/Settings";
import { emptyClient, useAppData } from "./store/useAppData";
import { ActiveScreen, Client } from "./types";
import { mergeImportedClients } from "./utils/importExport";
import { initTelegram } from "./utils/telegram";

function App() {
  const { state, actions } = useAppData();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("dashboard");
  const [activeStageId, setActiveStageId] = useState<"stage1" | "stage2" | "stage3">("stage1");
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    initTelegram();
  }, []);

  const screen = (() => {
    if (activeScreen === "dashboard") return <Dashboard clients={state.clients} settings={state.settings} plan={state.plan} />;
    if (activeScreen === "clients")
      return (
        <ClientTable
          clients={state.clients}
          stages={state.settings.stages}
          activeStageId={activeStageId}
          onStageTabChange={setActiveStageId}
          onAdd={() => setModalClient(emptyClient(activeStageId))}
          onOpen={setModalClient}
          onMove={actions.moveClient}
          onDelete={actions.deleteClient}
          onOpenImport={() => setImportOpen(true)}
        />
      );
    if (activeScreen === "calculator")
      return <FunnelCalculator plan={state.plan} settings={state.settings} clients={state.clients} onChange={actions.updatePlan} />;
    return (
      <Settings
        settings={state.settings}
        onSave={actions.updateSettings}
        onResetDemo={actions.resetDemo}
        onClearAll={actions.clearAll}
        onExportJson={actions.exportJson}
        onImportJson={actions.importJson}
      />
    );
  })();

  return (
    <Layout activeScreen={activeScreen} onChange={setActiveScreen}>
      {screen}
      {modalClient && (
        <ClientModal
          client={modalClient}
          stages={state.settings.stages}
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
          onImport={(rows, stageId) => {
            actions.setClients(mergeImportedClients(state.clients, rows, stageId));
            setImportOpen(false);
          }}
        />
      )}
    </Layout>
  );
}

export default App;
