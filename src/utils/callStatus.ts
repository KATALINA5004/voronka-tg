/** Быстрые статусы звонка (как договорено в процессе). */
export const CALL_STATUS_CODES = ["НД", "НО", "ПР", "ОТК"] as const;
export type CallStatusCode = (typeof CALL_STATUS_CODES)[number];

export function formatCallStatusCommentLine(code: CallStatusCode): string {
  const d = new Date();
  const dt = d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  return `[${dt}] Звонок: ${code}`;
}
