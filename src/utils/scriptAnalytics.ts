import { Client, StageId } from "../types";

const ORDER: StageId[] = ["stage1", "stage2", "stage3", "stage4", "stage5"];

function stageRank(id: StageId): number {
  return ORDER.indexOf(id);
}

export type ScriptEffectRow = {
  variantIndex: number;
  usedCount: number;
  advancedCount: number;
  ratePercent: number;
};

/** Клиенты, у которых в истории есть использование скрипта variantIndex на этапе stageId. */
export function clientsWhoUsedScriptOnStage(clients: Client[], stageId: StageId, variantIndex: number): Client[] {
  return clients.filter((c) =>
    (c.scriptHistory || []).some((h) => h.stageId === stageId && h.variantIndex === variantIndex)
  );
}

/** Доля клиентов, которые после использования скрипта на этом этапе оказались глубже по воронке (текущий этап выше). */
export function computeScriptEffectivenessForStage(clients: Client[], stageId: StageId): ScriptEffectRow[] {
  const baseRank = stageRank(stageId);
  return [0, 1, 2].map((variantIndex) => {
    const used = clientsWhoUsedScriptOnStage(clients, stageId, variantIndex);
    const advanced = used.filter((c) => stageRank(c.stageId) > baseRank);
    const usedCount = used.length;
    return {
      variantIndex,
      usedCount,
      advancedCount: advanced.length,
      ratePercent: usedCount ? (advanced.length / usedCount) * 100 : 0
    };
  });
}
