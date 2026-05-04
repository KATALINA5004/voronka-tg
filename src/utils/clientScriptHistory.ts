import { Client, ScriptHistoryEntry, StageScripts } from "../types";

function baseHistory(prev: Client | undefined, incoming: Client): ScriptHistoryEntry[] {
  if (prev?.scriptHistory?.length) return [...prev.scriptHistory];
  if (incoming.scriptHistory?.length) return [...incoming.scriptHistory];
  return [];
}

export function mergeScriptHistoryOnScriptChange(
  prev: Client | undefined,
  incoming: Client,
  stageScripts: StageScripts
): Client {
  const same =
    (prev?.scriptVariantIndex ?? null) === (incoming.scriptVariantIndex ?? null) &&
    (prev?.scriptStageId ?? null) === (incoming.scriptStageId ?? null);
  const hist = baseHistory(prev, incoming);
  if (same) {
    return { ...incoming, scriptHistory: hist };
  }
  const vi = incoming.scriptVariantIndex;
  const sid = incoming.scriptStageId;
  if (vi === null || vi === undefined || sid === null || sid === undefined) {
    return { ...incoming, scriptHistory: hist };
  }
  const templateText = stageScripts[sid]?.[vi] ?? "";
  const entry = {
    id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
    stageId: sid,
    variantIndex: vi,
    templateText
  };
  return { ...incoming, scriptHistory: [...hist, entry] };
}
