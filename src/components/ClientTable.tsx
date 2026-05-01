import { useEffect, useMemo, useState } from "react";
import { Client, Stage } from "../types";
import { exportClientsCsv } from "../utils/importExport";
import { EmptyState } from "./EmptyState";
import { Inbox } from "lucide-react";

type Props = {
  clients: Client[];
  stages: Stage[];
  activeStageId: Stage["id"];
  onStageTabChange: (id: Stage["id"]) => void;
  onAdd: () => void;
  onOpen: (client: Client) => void;
  onMove: (id: string, stageId: Stage["id"]) => void;
  onDelete: (id: string) => void;
  onOpenImport: () => void;
};

export function ClientTable({ clients, stages, activeStageId, onStageTabChange, onAdd, onOpen, onMove, onDelete, onOpenImport }: Props) {
  const [search, setSearch] = useState("");
  const [manager, setManager] = useState("");
  const [source, setSource] = useState("");
  const columnsStorageKey = "funnel-tg-client-columns-v1";
  const [showColumns, setShowColumns] = useState<Record<string, boolean>>({
    repeats: true,
    date: true,
    fullName: true,
    rating: true,
    phone: true,
    source: true,
    manager: true,
    comment: true,
    niche: true,
    nextContactDate: true,
    email: true,
    instagram: true,
    telegram: true,
    vk: true,
    invoiceAmount: true,
    paidAmount: true,
    bought: true
  });
  const managers = [...new Set(clients.map((c) => c.manager).filter(Boolean))];
  const sources = [...new Set(clients.map((c) => c.source).filter(Boolean))];
  const columns = [
    { key: "repeats", title: "Повторы", render: (c: Client) => c.repeats },
    { key: "date", title: "Дата", render: (c: Client) => (c.date ? new Date(c.date).toLocaleDateString("ru-RU") : "") },
    { key: "fullName", title: "Имя Фамилия", render: (c: Client) => c.fullName },
    { key: "rating", title: "Рейтинг", render: (c: Client) => c.rating ?? "" },
    { key: "phone", title: "Телефон", render: (c: Client) => c.phone },
    { key: "source", title: "Откуда узнал", render: (c: Client) => c.source },
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
    { key: "instagram", title: "Инстаграм", render: (c: Client) => c.instagram },
    { key: "telegram", title: "Телеграм", render: (c: Client) => c.telegram },
    { key: "vk", title: "ВКонтакте", render: (c: Client) => c.vk },
    { key: "invoiceAmount", title: "Счет", render: (c: Client) => c.invoiceAmount },
    { key: "paidAmount", title: "Оплачено", render: (c: Client) => c.paidAmount, className: (c: Client) => (c.paidAmount > 0 ? "success" : "") },
    { key: "bought", title: "Купил", render: (c: Client) => (c.bought ? "да" : "нет") }
  ] as const;
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

  const filtered = useMemo(
    () =>
      clients
        .filter((c) => c.stageId === activeStageId)
        .filter((c) => [c.fullName, c.phone, c.email, c.telegram].join(" ").toLowerCase().includes(search.toLowerCase()))
        .filter((c) => (manager ? c.manager === manager : true))
        .filter((c) => (source ? c.source === source : true)),
    [clients, activeStageId, search, manager, source]
  );

  return (
    <div className="stack">
      <div className="tabs">{stages.map((s) => <button key={s.id} className={activeStageId === s.id ? "active" : ""} onClick={() => onStageTabChange(s.id)}>{s.name}</button>)}</div>
      <section className="card">
        <div className="toolbar">
          <input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={manager} onChange={(e) => setManager(e.target.value)}><option value="">Все менеджеры</option>{managers.map((v) => <option key={v}>{v}</option>)}</select>
          <select value={source} onChange={(e) => setSource(e.target.value)}><option value="">Все источники</option>{sources.map((v) => <option key={v}>{v}</option>)}</select>
          <button onClick={onAdd}>Добавить клиента</button>
          <button onClick={onOpenImport}>Импорт Excel/CSV</button>
          <button onClick={() => exportClientsCsv(filtered)}>Экспорт CSV</button>
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
                          <select value={c.stageId} onChange={(e) => onMove(c.id, e.target.value as Stage["id"])}>
                            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
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
