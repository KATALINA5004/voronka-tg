import { useEffect, useMemo, useState } from "react";
import { Client, Stage, StageId, StageScripts } from "../types";
import { EmptyState } from "./EmptyState";
import { Inbox } from "lucide-react";

type Props = {
  clients: Client[];
  stages: Stage[];
  stageScripts: StageScripts;
  activeStageId: Stage["id"];
  onStageTabChange: (id: Stage["id"]) => void;
  onAdd: () => void;
  onOpen: (client: Client) => void;
  onMove: (id: string, stageId: Stage["id"]) => void;
  onSelectScript: (id: string, scriptVariantIndex: number | null) => void;
  onApplyScriptToStage: (stageId: Stage["id"], scriptVariantIndex: number) => void;
  onDelete: (id: string) => void;
  onOpenImport: () => void;
};

type ClientColumn = {
  key: string;
  title: string;
  render: (client: Client) => string | number | JSX.Element;
  className?: (client: Client) => string;
};

const translitMap: Record<string, string> = {
  a: "а",
  b: "б",
  c: "к",
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "х",
  i: "и",
  j: "й",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "к",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "в",
  x: "кс",
  y: "й",
  z: "з"
};

const digraphMap: Record<string, string> = {
  sh: "ш",
  ch: "ч",
  ya: "я",
  yu: "ю",
  yo: "ё",
  zh: "ж",
  kh: "х",
  ts: "ц"
};

function getFirstName(fullName: string): string {
  const first = fullName.trim().split(/\s+/).find(Boolean);
  if (!first) return "Клиент";
  const source = first.toLowerCase();
  let ru = "";
  let i = 0;
  while (i < source.length) {
    const two = source.slice(i, i + 2);
    if (digraphMap[two]) {
      ru += digraphMap[two];
      i += 2;
      continue;
    }
    ru += translitMap[source[i]] || source[i];
    i += 1;
  }
  return ru.charAt(0).toUpperCase() + ru.slice(1);
}

export function ClientTable({
  clients,
  stages,
  stageScripts,
  activeStageId,
  onStageTabChange,
  onAdd,
  onOpen,
  onMove,
  onSelectScript,
  onApplyScriptToStage,
  onDelete,
  onOpenImport
}: Props) {
  const [search, setSearch] = useState("");
  const [manager, setManager] = useState("");
  const [source, setSource] = useState("");
  const [activeScriptIndex, setActiveScriptIndex] = useState(0);
  const [scriptFilter, setScriptFilter] = useState<"all" | "none" | "active" | "0" | "1" | "2">("all");
  const columnsStorageKey = "funnel-tg-client-columns-v1";
  const activeScriptStorageKey = "funnel-tg-active-script-v1";
  const [showColumns, setShowColumns] = useState<Record<string, boolean>>({
    repeats: true,
    date: true,
    fullName: true,
    rating: true,
    phone: true,
    source: true,
    baseType: true,
    manager: true,
    comment: true,
    niche: true,
    nextContactDate: true,
    email: true,
    instagram: true,
    telegram: true,
    vk: true,
    script: true,
    invoiceAmount: true,
    paidAmount: true,
    bought: true
  });

  const getStageTemplate = (stageId: StageId, idx: number) => stageScripts[stageId]?.[idx] || "";
  const buildScript = (client: Client) => {
    const scriptStage = client.scriptStageId || client.stageId;
    const idx = client.scriptVariantIndex ?? activeScriptIndex;
    const template = getStageTemplate(scriptStage, idx) || "Здравствуйте, {имя}!";
    return template.replace(/\{имя\}/gi, getFirstName(client.fullName));
  };

  const managers = [...new Set(clients.map((c) => c.manager).filter(Boolean))];
  const sources = [...new Set(clients.map((c) => c.source).filter(Boolean))];
  const scriptPreview = (text: string) => {
    const firstSentence = text.split(/[.!?]/)[0] || text;
    return firstSentence.length > 42 ? `${firstSentence.slice(0, 42)}...` : firstSentence;
  };
  const copyableCell = (text: string, preview = text) => (
    <button
      className="ghost"
      title="Нажмите, чтобы скопировать"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text || "");
      }}
    >
      {preview || "-"}
    </button>
  );
  const scriptStats = [0, 1, 2].map((idx) => {
    const scoped = clients.filter((c) => c.stageId === activeStageId && (c.scriptVariantIndex ?? activeScriptIndex) === idx);
    const paid = scoped.filter((c) => c.stageId === "stage5" || c.paidAmount > 0).length;
    return { idx, total: scoped.length, paid, conversion: scoped.length ? (paid / scoped.length) * 100 : 0 };
  });
  const columns: ClientColumn[] = [
    { key: "repeats", title: "Повторы", render: (c: Client) => c.repeats },
    { key: "date", title: "Дата", render: (c: Client) => (c.date ? new Date(c.date).toLocaleDateString("ru-RU") : "") },
    { key: "fullName", title: "Имя Фамилия", render: (c: Client) => c.fullName },
    { key: "rating", title: "Рейтинг", render: (c: Client) => c.rating ?? "" },
    { key: "phone", title: "Телефон", render: (c: Client) => copyableCell(c.phone) },
    { key: "source", title: "Откуда узнал", render: (c: Client) => c.source },
    { key: "baseType", title: "Тип базы", render: (c: Client) => c.baseType || "-" },
    { key: "manager", title: "Менеджер", render: (c: Client) => c.manager },
    { key: "comment", title: "Комментарий", render: (c: Client) => c.comment },
    { key: "niche", title: "Ниша", render: (c: Client) => c.niche },
    {
      key: "nextContactDate",
      title: "Дата следующего контакта",
      render: (c: Client) => (c.nextContactDate ? new Date(c.nextContactDate).toLocaleDateString("ru-RU") : ""),
      className: (c: Client) => (c.nextContactDate && new Date(c.nextContactDate) < new Date() ? "danger" : "")
    },
    { key: "email", title: "Почта", render: (c: Client) => c.email },
    { key: "instagram", title: "Инстаграм", render: (c: Client) => copyableCell(c.instagram) },
    { key: "telegram", title: "Телеграм", render: (c: Client) => copyableCell(c.telegram) },
    { key: "vk", title: "ВКонтакте", render: (c: Client) => copyableCell(c.vk) },
    { key: "script", title: "Скрипт", render: (c: Client) => copyableCell(buildScript(c), scriptPreview(buildScript(c))) },
    { key: "invoiceAmount", title: "Счет", render: (c: Client) => c.invoiceAmount },
    { key: "paidAmount", title: "Оплачено", render: (c: Client) => c.paidAmount, className: (c: Client) => (c.paidAmount > 0 ? "success" : "") },
    { key: "bought", title: "Купил", render: (c: Client) => (c.bought ? "да" : "нет") }
  ];
  const visibleColumns = columns.filter((col) => showColumns[col.key]);

  useEffect(() => {
    const raw = localStorage.getItem(columnsStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      setShowColumns((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore invalid stored value
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(columnsStorageKey, JSON.stringify(showColumns));
  }, [showColumns]);

  useEffect(() => {
    const raw = localStorage.getItem(activeScriptStorageKey);
    if (!raw) return;
    const n = Number(raw);
    if (!Number.isNaN(n) && n >= 0 && n <= 4) setActiveScriptIndex(n);
  }, []);

  useEffect(() => {
    localStorage.setItem(activeScriptStorageKey, String(activeScriptIndex));
  }, [activeScriptIndex]);

  const filtered = useMemo(
    () =>
      clients
        .filter((c) => c.stageId === activeStageId)
        .filter((c) => [c.fullName, c.phone, c.email, c.telegram].join(" ").toLowerCase().includes(search.toLowerCase()))
        .filter((c) => (manager ? c.manager === manager : true))
        .filter((c) => (source ? c.source === source : true))
        .filter((c) => {
          if (scriptFilter === "all") return true;
          if (scriptFilter === "none") return c.scriptVariantIndex === null;
          if (scriptFilter === "active") return (c.scriptVariantIndex ?? activeScriptIndex) === activeScriptIndex;
          return (c.scriptVariantIndex ?? activeScriptIndex) === Number(scriptFilter);
        }),
    [clients, activeStageId, search, manager, source, scriptFilter, activeScriptIndex]
  );
  const getNextStageId = (stageId: Stage["id"]): Stage["id"] => {
    const idx = stages.findIndex((s) => s.id === stageId);
    if (idx < 0 || idx >= stages.length - 1) return stageId;
    return stages[idx + 1].id;
  };

  return (
    <div className="stack">
      <div className="tabs">{stages.map((s) => <button key={s.id} className={activeStageId === s.id ? "active" : ""} onClick={() => onStageTabChange(s.id)}>{s.name}</button>)}</div>
      <section className="card">
        <div className="toolbar">
          <input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={manager} onChange={(e) => setManager(e.target.value)}><option value="">Все менеджеры</option>{managers.map((v) => <option key={v}>{v}</option>)}</select>
          <select value={source} onChange={(e) => setSource(e.target.value)}><option value="">Все источники</option>{sources.map((v) => <option key={v}>{v}</option>)}</select>
          <select value={activeScriptIndex} onChange={(e) => setActiveScriptIndex(Number(e.target.value))}>
            {[0, 1, 2].map((idx) => <option key={idx} value={idx}>Рабочий скрипт {idx + 1}</option>)}
          </select>
          <select value={scriptFilter} onChange={(e) => setScriptFilter(e.target.value as "all" | "none" | "active" | "0" | "1" | "2")}>
            <option value="all">Все скрипты</option>
            <option value="none">Скрипт не выбран</option>
            <option value="active">Только рабочий скрипт</option>
            <option value="0">Только скрипт 1</option>
            <option value="1">Только скрипт 2</option>
            <option value="2">Только скрипт 3</option>
          </select>
          <button onClick={() => onApplyScriptToStage(activeStageId, activeScriptIndex)}>Применить скрипт к этапу</button>
          <button onClick={onAdd}>Добавить клиента</button>
          <button onClick={onOpenImport}>Импорт Excel/CSV</button>
        </div>
        <div className="row">
          {scriptStats.map((s) => (
            <small key={s.idx}>Скрипт {s.idx + 1}: {s.paid}/{s.total} оплат ({s.conversion.toFixed(1)}%)</small>
          ))}
        </div>
        <details className="columns-toggler">
          <summary>Показать/скрыть столбцы</summary>
          <div className="columns-grid">
            {columns.map((col) => (
              <label key={col.key}>
                <input
                  type="checkbox"
                  checked={showColumns[col.key]}
                  onChange={(e) => setShowColumns((prev) => ({ ...prev, [col.key]: e.target.checked }))}
                />
                {col.title}
              </label>
            ))}
          </div>
        </details>

        {!filtered.length ? (
          <EmptyState icon={<Inbox />} title="Клиентов нет" text="Добавьте клиента вручную или через импорт." buttonText="Добавить клиента" onClick={onAdd} />
        ) : (
          <div className="table-wrap">
            <table className="sheet-table">
              <thead>
                <tr>
                  {visibleColumns.map((col) => <th key={col.key}>{col.title}</th>)}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  return (
                    <tr key={c.id}>
                      {visibleColumns.map((col) => (
                        <td key={col.key} className={col.className ? col.className(c) : ""}>
                          {col.render(c)}
                        </td>
                      ))}
                      <td>
                        <div className="row">
                          <button onClick={() => onOpen(c)}>Открыть</button>
                          <select
                            value={c.scriptVariantIndex ?? ""}
                            onChange={(e) => onSelectScript(c.id, e.target.value === "" ? null : Number(e.target.value))}
                          >
                            <option value="">Скрипт: не выбран</option>
                            {[0, 1, 2].map((idx) => (
                              <option key={idx} value={idx}>
                                Скрипт {idx + 1}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => onMove(c.id, getNextStageId(c.stageId))} disabled={c.stageId === "stage5"}>
                            Следующий этап
                          </button>
                          <button className="danger-btn" onClick={() => onDelete(c.id)}>Удалить</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
