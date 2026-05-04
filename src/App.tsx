import { useEffect, useState } from "react";
import { ClientModal } from "./components/ClientModal";
import { ClientTable } from "./components/ClientTable";
import { Dashboard } from "./components/Dashboard";
import { FunnelCalculator } from "./components/FunnelCalculator";
import { ImportModal } from "./components/ImportModal";
import { Layout } from "./components/Layout";
import { Settings } from "./components/Settings";
import { emptyClient, useAppData } from "./store/useAppData";
import { ActiveScreen, Client, StageId } from "./types";
import { mergeImportedClients } from "./utils/importExport";
import { AccessGate } from "./components/AccessGate";
import { initTelegram, resolveOwnerTgId } from "./utils/telegram";

function App() {
  const { state, actions } = useAppData();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>("dashboard");
  const [activeStageId, setActiveStageId] = useState<StageId>("stage1");
  const [modalClient, setModalClient] = useState<Client | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [ownerTgId, setOwnerTgId] = useState<number | null>(() => resolveOwnerTgId());

  useEffect(() => {
    initTelegram();
    setOwnerTgId(resolveOwnerTgId());
  }, []);

  const screen = (() => {
    if (activeScreen === "dashboard") return <Dashboard clients={state.clients} settings={state.settings} plan={state.plan} />;
    if (activeScreen === "clients")
      return (
        <ClientTable
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
      />
    );
  })();

  return (
    <AccessGate ownerTgId={ownerTgId}>
    <Layout activeScreen={activeScreen} onChange={setActiveScreen}>
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
