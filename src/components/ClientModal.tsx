import { useState } from "react";
import { Client, Settings, Stage, Touchpoint } from "../types";
import { CALL_STATUS_CODES, formatCallStatusCommentLine } from "../utils/callStatus";

type Props = {
  client: Client;
  stages: Stage[];
  settings: Settings;
  onClose: () => void;
  onSave: (client: Client) => void;
  onAddTouchpoint: (clientId: string, tp: Touchpoint) => void;
};

export function ClientModal({ client, stages, settings, onClose, onSave, onAddTouchpoint }: Props) {
  const [model, setModel] = useState<Client>(client);
  const [tpType, setTpType] = useState(settings.touchpointTypes[0] || "звонок");
  const [tpText, setTpText] = useState("");
  const stageScripts = settings.stageScripts[model.stageId] || ["", "", ""];

  const addPayment = () => setModel((s) => ({ ...s, paidAmount: s.paidAmount + 1000, bought: true }));
  const nextStage = () => {
    const ids = ["stage1", "stage2", "stage3", "stage4", "stage5"] as const;
    const currentIndex = ids.indexOf(model.stageId);
    const next = ids[Math.min(currentIndex + 1, ids.length - 1)] || "stage5";
    setModel((s) => ({ ...s, stageId: next, bought: next === "stage5" ? true : s.bought }));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Карточка клиента</h3>
        <div className="form-grid">
          <label>Этап<select value={model.stageId} onChange={(e) => setModel({ ...model, stageId: e.target.value as Client["stageId"] })}>{stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Дата добавления<input type="date" value={model.date} onChange={(e) => setModel({ ...model, date: e.target.value })} /></label>
          <label>Имя фамилия<input value={model.fullName} onChange={(e) => setModel({ ...model, fullName: e.target.value })} /></label>
          <label>Телефон<input value={model.phone} onChange={(e) => setModel({ ...model, phone: e.target.value })} /></label>
          <label>Тип базы<input value={model.baseType} onChange={(e) => setModel({ ...model, baseType: e.target.value })} /></label>
          <label>Email<input value={model.email} onChange={(e) => setModel({ ...model, email: e.target.value })} /></label>
          <label>Telegram<input value={model.telegram} onChange={(e) => setModel({ ...model, telegram: e.target.value })} /></label>
          <label>Instagram<input value={model.instagram} onChange={(e) => setModel({ ...model, instagram: e.target.value })} /></label>
          <label>VK<input value={model.vk} onChange={(e) => setModel({ ...model, vk: e.target.value })} /></label>
          <label>Источник<input value={model.source} onChange={(e) => setModel({ ...model, source: e.target.value })} /></label>
          <label>Менеджер<input value={model.manager} onChange={(e) => setModel({ ...model, manager: e.target.value })} /></label>
          <label>Рейтинг<input type="number" min={1} max={10} value={model.rating ?? ""} onChange={(e) => setModel({ ...model, rating: e.target.value ? Number(e.target.value) : null })} /></label>
          <label>Ниша<input value={model.niche} onChange={(e) => setModel({ ...model, niche: e.target.value })} /></label>
          <label className="full-width-label">
            Комментарий
            <div className="call-status-bar">
              <span className="call-status-label">Быстрый статус звонка:</span>
              {CALL_STATUS_CODES.map((code) => (
                <button
                  key={code}
                  type="button"
                  className="chip-btn"
                  onClick={() => {
                    const line = formatCallStatusCommentLine(code);
                    setModel((m) => {
                      const base = (m.comment || "").trimEnd();
                      return { ...m, comment: base ? `${base}\n${line}` : line };
                    });
                  }}
                >
                  {code}
                </button>
              ))}
            </div>
            <textarea rows={5} value={model.comment} onChange={(e) => setModel({ ...model, comment: e.target.value })} placeholder="Комментарии и автоматические строки статусов звонка" />
          </label>
          <label>Дата след. контакта<input type="date" value={model.nextContactDate} onChange={(e) => setModel({ ...model, nextContactDate: e.target.value })} /></label>
          <label>Сумма счета<input type="number" value={model.invoiceAmount} onChange={(e) => setModel({ ...model, invoiceAmount: Number(e.target.value) })} /></label>
          <label>Сумма оплаты<input type="number" value={model.paidAmount} onChange={(e) => setModel({ ...model, paidAmount: Number(e.target.value) })} /></label>
          <label>Повторы<input type="number" value={model.repeats} onChange={(e) => setModel({ ...model, repeats: Number(e.target.value) })} /></label>
          <label>Купил<select value={model.bought ? "yes" : "no"} onChange={(e) => setModel({ ...model, bought: e.target.value === "yes" })}><option value="yes">Да</option><option value="no">Нет</option></select></label>
          <label>
            Выбранный скрипт этапа
            <select
              value={model.scriptVariantIndex ?? ""}
              onChange={(e) => setModel({ ...model, scriptVariantIndex: e.target.value === "" ? null : Number(e.target.value), scriptStageId: model.stageId })}
            >
              <option value="">Не выбран</option>
              {[0, 1, 2].map((idx) => (
                <option key={idx} value={idx}>
                  Скрипт {idx + 1}: {(stageScripts[idx] || "").slice(0, 28) || "пусто"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <section className="card script-history-card">
          <h4>Скрипты по ходу работы</h4>
          <p className="hint-muted">Все зафиксированные варианты: что отправляли или говорили по шаблону.</p>
          {[...(model.scriptHistory || [])]
            .sort((a, b) => +new Date(b.at) - +new Date(a.at))
            .map((h) => (
              <div key={h.id} className="script-history-item">
                <div className="script-history-meta">
                  {new Date(h.at).toLocaleString("ru-RU")} · {stages.find((s) => s.id === h.stageId)?.name ?? h.stageId} · Скрипт {h.variantIndex + 1}
                </div>
                <pre className="script-history-body">{h.templateText.trim() ? h.templateText : "—"}</pre>
              </div>
            ))}
          {!(model.scriptHistory || []).length && (
            <p className="hint-muted">Пока пусто — выберите скрипт этапа ниже или в таблице клиентов; текст сохранится в историю.</p>
          )}
        </section>
        {model.bought && model.paidAmount === 0 && <p className="warning">Купил, но сумма оплаты не указана</p>}
        <div className="row">
          <button onClick={nextStage}>Перевести на следующий этап</button>
          <button onClick={addPayment}>Добавить оплату</button>
        </div>
        <section className="card">
          <h4>История касаний</h4>
          <div className="row">
            <input type="date" value={new Date().toISOString().slice(0, 10)} readOnly />
            <select value={tpType} onChange={(e) => setTpType(e.target.value)}>
              {settings.touchpointTypes.map((v) => <option key={v}>{v}</option>)}
            </select>
            <input placeholder="Что сделано / результат касания" value={tpText} onChange={(e) => setTpText(e.target.value)} />
            <button onClick={() => {
              if (!tpText.trim()) return;
              const next = { id: `${Date.now()}`, date: new Date().toISOString(), type: tpType, text: tpText };
              onAddTouchpoint(model.id, next);
              setModel((s) => ({ ...s, touchpoints: [next, ...s.touchpoints] }));
              setTpText("");
            }}>Добавить касание</button>
          </div>
          <div className="touch-list">
            {[...model.touchpoints].sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((tp) => (
              <div key={tp.id} className="touch-item"><strong>{new Date(tp.date).toLocaleDateString("ru-RU")} • {tp.type}</strong><p>{tp.text}</p></div>
            ))}
          </div>
        </section>
        <div className="row end">
          <button className="ghost" onClick={onClose}>Закрыть</button>
          <button onClick={() => onSave(model)}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}
