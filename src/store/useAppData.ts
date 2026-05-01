import { useMemo, useState } from "react";
import { demoData } from "../data/demoData";
import { AppState, Client, Plan, Settings, StageId, Touchpoint } from "../types";
import { clearState, loadState, saveState } from "../utils/storage";

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
    touchpoints: []
  };
}

export function useAppData() {
  const [state, setState] = useState<AppState>(() => loadState());

  const setPersisted = (next: AppState) => {
    setState(next);
    saveState(next);
  };

  const actions = useMemo(
    () => ({
      setClients(clients: Client[]) {
        setPersisted({ ...state, clients });
      },
      upsertClient(client: Client) {
        const next = [...state.clients];
        const idx = next.findIndex((c) => c.id === client.id);
        const normalized = {
          ...client,
          updatedAt: new Date().toISOString(),
          bought: client.stageId === "stage3" ? true : client.bought || client.paidAmount > 0
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
          c.id === id ? { ...c, stageId, bought: stageId === "stage3" ? true : c.bought, updatedAt: new Date().toISOString() } : c
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
        setPersisted(demoData);
      },
      clearAll() {
        clearState();
        setPersisted({ ...demoData, clients: [] });
      },
      importJson(raw: string) {
        try {
          const parsed = JSON.parse(raw) as AppState;
          setPersisted(parsed);
          return true;
        } catch {
          return false;
        }
      },
      exportJson() {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "voronka-tg-data.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    }),
    [state]
  );

  return { state, actions };
}
