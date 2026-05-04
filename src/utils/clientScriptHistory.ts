import { Client, ScriptHistoryEntry, StageScripts } from "../types";

/** При любых правках без смены этапа — не теряем уже накопленную историю скриптов. */
export function preserveClientScriptHistory(prev: Client | undefined, incoming: Client): Client {
  const hist = prev?.scriptHistory?.length
    ? [...prev.scriptHistory]
    : [...(incoming.scriptHistory || [])];
  return { ...incoming, scriptHistory: hist };
}

/**
 * Добавляет запись в историю только при переходе на другой этап,
 * если к моменту ухода был выбран скрипт (вариант + этап скрипта).
 */
export function appendScriptHistoryWhenLeavingStage(
  prev: Client,
  clientAfter: Client,
  stageScripts: StageScripts
): Client {
  const hist = [...(prev.scriptHistory || [])];
  if (prev.stageId === clientAfter.stageId) {
    return { ...clientAfter, scriptHistory: hist };
  }
  const vi = prev.scriptVariantIndex;
  const sid = prev.scriptStageId;
  if (vi === null || vi === undefined || sid === null || sid === undefined) {
    return { ...clientAfter, scriptHistory: hist };
  }
  const templateText = stageScripts[sid]?.[vi] ?? "";
  const entry: ScriptHistoryEntry = {
    id: `sh-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
    stageId: sid,
    variantIndex: vi,
    templateText
  };
  return { ...clientAfter, scriptHistory: [...hist, entry] };
}
