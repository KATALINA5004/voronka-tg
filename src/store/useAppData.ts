import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, Client, Plan, ProjectSlotId, Settings, StageId, Touchpoint } from "../types";
import { isCloudSyncConfigured, pullWorkspace, pushWorkspace } from "../utils/cloudWorkspace";
import { mergeScriptHistoryOnScriptChange } from "../utils/clientScriptHistory";
import { clearStateLocal, initialEmptyState, loadStateLocal, saveStateLocal } from "../utils/storage";

export function emptyClient(stageId: StageId): Client {
  const now = new Date().toISOString();
  return {
    id: `client-${Date.now()}`,
    stageId,
    createdAt: now,
    updatedAt: now,
    date: now.slice(0, 10),
    fullName: "",
    rating: null,
    phone: "",
    source: "",
    baseType: "",
    manager: "",
    comment: "",
    niche: "",
    nextContactDate: "",
    email: "",
    instagram: "",
    telegram: "",
    vk: "",
    invoiceAmount: 0,
    paidAmount: 0,
    repeats: 0,
    bought: false,
    scriptVariantIndex: null,
    scriptStageId: null,
    scriptHistory: [],
    touchpoints: []
  };
}

export function useAppData(accountLogin: string, projectSlot: ProjectSlotId) {
  const [state, setState] = useState<AppState>(initialEmptyState);
  const [ready, setReady] = useState(false);
  const cloudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    setReady(false);
    (async () => {
      let next: AppState;
      if (isCloudSyncConfigured()) {
        const remote = await pullWorkspace(accountLogin, projectSlot);
        if (!alive) return;
        if (remote) next = remote;
        else next = loadStateLocal(accountLogin, projectSlot);
      } else {
        next = loadStateLocal(accountLogin, projectSlot);
      }
      if (alive) {
        setState(next);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [accountLogin, projectSlot]);

  const flushCloud = (next: AppState) => {
    if (!isCloudSyncConfigured()) return;
    if (cloudTimer.current) clearTimeout(cloudTimer.current);
    cloudTimer.current = setTimeout(() => {
      cloudTimer.current = null;
      void pushWorkspace(accountLogin, projectSlot, next);
    }, 700);
  };

  useEffect(() => {
    return () => {
      if (cloudTimer.current) clearTimeout(cloudTimer.current);
    };
  }, []);

  const setPersisted = (next: AppState) => {
    setState(next);
    saveStateLocal(accountLogin, projectSlot, next);
    flushCloud(next);
  };

  const actions = useMemo(
    () => ({
      setClients(clients: Client[]) {
        const merged = clients.map((c) => {
          const prev = state.clients.find((x) => x.id === c.id);
          return mergeScriptHistoryOnScriptChange(prev, c, state.settings.stageScripts);
        });
        setPersisted({ ...state, clients: merged });
      },
      upsertClient(client: Client) {
        const next = [...state.clients];
        const idx = next.findIndex((c) => c.id === client.id);
        const prev = idx === -1 ? undefined : next[idx];
        const withHistory = mergeScriptHistoryOnScriptChange(prev, client, state.settings.stageScripts);
        const normalized = {
          ...withHistory,
          updatedAt: new Date().toISOString(),
          bought: withHistory.stageId === "stage5" ? true : withHistory.bought || withHistory.paidAmount > 0
        };
        if (idx === -1) next.unshift(normalized);
        else next[idx] = normalized;
        setPersisted({ ...state, clients: next });
      },
      deleteClient(id: string) {
        setPersisted({ ...state, clients: state.clients.filter((c) => c.id !== id) });
      },
      moveClient(id: string, stageId: StageId) {
        const next = state.clients.map((c) =>
          c.id === id ? { ...c, stageId, bought: stageId === "stage5" ? true : c.bought, updatedAt: new Date().toISOString() } : c
        );
        setPersisted({ ...state, clients: next });
      },
      addTouchpoint(clientId: string, tp: Touchpoint) {
        const next = state.clients.map((c) =>
          c.id === clientId ? { ...c, touchpoints: [tp, ...c.touchpoints], updatedAt: new Date().toISOString() } : c
        );
        setPersisted({ ...state, clients: next });
      },
      updateSettings(settings: Settings) {
        setPersisted({ ...state, settings });
      },
      updatePlan(plan: Plan) {
        setPersisted({ ...state, plan });
      },
      resetDemo() {
        setPersisted(initialEmptyState);
      },
      clearAll() {
        clearStateLocal(accountLogin, projectSlot);
        setState(initialEmptyState);
        saveStateLocal(accountLogin, projectSlot, initialEmptyState);
        if (isCloudSyncConfigured()) void pushWorkspace(accountLogin, projectSlot, initialEmptyState);
      },
    }),
    [state, accountLogin, projectSlot]
  );

  return { state, actions, ready };
}
