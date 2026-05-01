import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Client, StageId } from "../types";

export const mapDictionary: Record<string, keyof Client> = {
  "дата": "date",
  "дата операции": "date",
  "имя": "fullName",
  "фио": "fullName",
  "имя фамилия": "fullName",
  "телефон": "phone",
  "рейтинг": "rating",
  "откуда узнал": "source",
  "источник": "source",
  "менеджер": "manager",
  "кто работает": "manager",
  "комментарий": "comment",
  "ниша": "niche",
  "чем занимается": "niche",
  "дата след контакта": "nextContactDate",
  "дата следующего контакта": "nextContactDate",
  "почта": "email",
  "email": "email",
  "емайл": "email",
  "инста": "instagram",
  "instagram": "instagram",
  "телега": "telegram",
  "telegram": "telegram",
  "вконтакте": "vk",
  "vk": "vk",
  "счет": "invoiceAmount",
  "счёт": "invoiceAmount",
  "оплатил": "paidAmount",
  "оплата": "paidAmount",
  "оплачено": "paidAmount",
  "купил": "bought",
  "повторы": "repeats"
};

const toNum = (v: unknown) => (v === "" || v == null ? 0 : Number(v) || 0);
const toBool = (v: unknown) => ["да", "true", "1", "yes"].includes(String(v).toLowerCase());

export async function parseImportFile(file: File): Promise<Record<string, unknown>[]> {
  const ext = file.name.toLowerCase();
  if (ext.endsWith(".csv")) {
    const text = await file.text();
    return Papa.parse<Record<string, unknown>>(text, { header: true, skipEmptyLines: true }).data;
  }
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer);
  const first = wb.SheetNames[0];
  return XLSX.utils.sheet_to_json(wb.Sheets[first], { defval: "" }) as Record<string, unknown>[];
}

export function detectMap(row: Record<string, unknown>) {
  const mapping: Partial<Record<string, keyof Client>> = {};
  Object.keys(row).forEach((k) => {
    const key = k.trim().toLowerCase();
    if (mapDictionary[key]) mapping[k] = mapDictionary[key];
  });
  return mapping;
}

export function mergeImportedClients(existing: Client[], rows: Record<string, unknown>[], stageId: StageId) {
  const result = [...existing];
  rows.forEach((row, i) => {
    const mapping = detectMap(row);
    const mapped: Partial<Client> = {};
    Object.entries(mapping).forEach(([source, target]) => {
      mapped[target] = row[source] as never;
    });
    const dedupe = result.find(
      (c) =>
        (mapped.phone && c.phone && c.phone === mapped.phone) ||
        (mapped.telegram && c.telegram && c.telegram === mapped.telegram) ||
        (mapped.email && c.email && c.email === mapped.email)
    );
    if (dedupe) {
      Object.entries(mapped).forEach(([key, value]) => {
        if (value !== "" && value != null) (dedupe as unknown as Record<string, unknown>)[key] = value;
      });
      dedupe.updatedAt = new Date().toISOString();
      return;
    }
    const now = new Date().toISOString();
    result.push({
      id: `import-${Date.now()}-${i}`,
      stageId,
      createdAt: now,
      updatedAt: now,
      date: String(mapped.date || now.slice(0, 10)),
      fullName: String(mapped.fullName || ""),
      rating: mapped.rating ? Number(mapped.rating) : null,
      phone: String(mapped.phone || ""),
      source: String(mapped.source || ""),
      manager: String(mapped.manager || ""),
      comment: String(mapped.comment || ""),
      niche: String(mapped.niche || ""),
      nextContactDate: String(mapped.nextContactDate || ""),
      email: String(mapped.email || ""),
      instagram: String(mapped.instagram || ""),
      telegram: String(mapped.telegram || ""),
      vk: String(mapped.vk || ""),
      invoiceAmount: toNum(mapped.invoiceAmount),
      paidAmount: toNum(mapped.paidAmount),
      repeats: toNum(mapped.repeats),
      bought: mapped.bought ? toBool(mapped.bought) : false,
      touchpoints: []
    });
  });
  return result.map((c) => ({
    ...c,
    invoiceAmount: toNum(c.invoiceAmount),
    paidAmount: toNum(c.paidAmount),
    repeats: toNum(c.repeats),
    rating: c.rating === null ? null : Number(c.rating) || null,
    bought: c.stageId === "stage3" ? true : c.bought || c.paidAmount > 0
  }));
}

export function exportClientsCsv(clients: Client[]) {
  const csv = Papa.unparse(
    clients.map((c) => ({
      "Повторы": c.repeats,
      "Дата": c.date,
      "Имя Фамилия": c.fullName,
      "Рейтинг": c.rating ?? "",
      "Телефон": c.phone,
      "Откуда узнал": c.source,
      "Менеджер": c.manager,
      "Комментарий": c.comment,
      "Ниша": c.niche,
      "Дата следующего контакта": c.nextContactDate,
      "Почта": c.email,
      "Инстаграм": c.instagram,
      "Телеграм": c.telegram,
      "ВКонтакте": c.vk,
      "Счет": c.invoiceAmount,
      "Оплачено": c.paidAmount,
      "Купил": c.bought ? "да" : "нет"
    }))
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "clients-export.csv";
  a.click();
  URL.revokeObjectURL(url);
}
