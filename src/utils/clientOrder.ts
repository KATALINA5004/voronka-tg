import { Client } from "../types";

/** Клиент с обновлёнными полями оказывается последним среди клиентов того же этапа; порядок остальных этапов и клиентов на этапе сохраняется. */
export function moveClientToEndOfTheirStage(clients: Client[], updated: Client): Client[] {
  const stage = updated.stageId;
  const id = updated.id;
  const byId = new Map(clients.map((c) => [c.id, c] as const));
  byId.set(updated.id, updated);

  const stageIdsInOrder = clients.filter((c) => c.stageId === stage).map((c) => c.id);
  const reordered = [...stageIdsInOrder.filter((cid) => cid !== id), id];

  let ri = 0;
  return clients.map((c) => {
    if (c.stageId !== stage) return c;
    const pick = reordered[ri++];
    return byId.get(pick)!;
  });
}
