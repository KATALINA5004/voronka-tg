import { useMemo, useState } from "react";
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
  const managers = [...new Set(clients.map((c) => c.manager).filter(Boolean))];
  const sources = [...new Set(clients.map((c) => c.source).filter(Boolean))];

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

        {!filtered.length ? (
          <EmptyState icon={<Inbox />} title="Клиентов нет" text="Добавьте клиента вручную или через импорт." buttonText="Добавить клиента" onClick={onAdd} />
        ) : (
          <div className="table-wrap">
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>Повторы</th><th>Дата</th><th>Имя Фамилия</th><th>Рейтинг</th><th>Телефон</th><th>Откуда узнал</th><th>Менеджер</th><th>Комментарий</th><th>Ниша</th><th>Дата следующего контакта</th><th>Почта</th><th>Инстаграм</th><th>Телеграм</th><th>ВКонтакте</th><th>Счет</th><th>Оплачено</th><th>Купил</th><th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const overdue = c.nextContactDate && new Date(c.nextContactDate) < new Date();
                  return (
                    <tr key={c.id}>
                      <td>{c.repeats}</td><td>{c.date ? new Date(c.date).toLocaleDateString("ru-RU") : ""}</td><td>{c.fullName}</td><td>{c.rating ?? ""}</td><td>{c.phone}</td><td>{c.source}</td><td>{c.manager}</td><td>{c.comment}</td><td>{c.niche}</td><td className={overdue ? "danger" : ""}>{c.nextContactDate ? new Date(c.nextContactDate).toLocaleDateString("ru-RU") : ""}</td><td>{c.email}</td><td>{c.instagram}</td><td>{c.telegram}</td><td>{c.vk}</td><td>{c.invoiceAmount}</td><td className={c.paidAmount > 0 ? "success" : ""}>{c.paidAmount}</td><td>{c.bought ? "да" : "нет"}</td>
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
