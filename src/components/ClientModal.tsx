import { useState } from "react";
import { Client, Stage, Touchpoint } from "../types";

type Props = {
  client: Client;
  stages: Stage[];
  onClose: () => void;
  onSave: (client: Client) => void;
  onAddTouchpoint: (clientId: string, tp: Touchpoint) => void;
};

export function ClientModal({ client, stages, onClose, onSave, onAddTouchpoint }: Props) {
  const [model, setModel] = useState<Client>(client);
  const [tpType, setTpType] = useState("звонок");
  const [tpText, setTpText] = useState("");

  const addPayment = () => setModel((s) => ({ ...s, paidAmount: s.paidAmount + 1000, bought: true }));
  const nextStage = () => {
    const ids = ["stage1", "stage2", "stage3", "stage4"] as const;
    const next = ids[Math.min(ids.indexOf(model.stageId), 3) + 1] || "stage4";
    setModel((s) => ({ ...s, stageId: next, bought: next === "stage4" ? true : s.bought }));
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
          <label>Email<input value={model.email} onChange={(e) => setModel({ ...model, email: e.target.value })} /></label>
          <label>Telegram<input value={model.telegram} onChange={(e) => setModel({ ...model, telegram: e.target.value })} /></label>
          <label>Instagram<input value={model.instagram} onChange={(e) => setModel({ ...model, instagram: e.target.value })} /></label>
          <label>VK<input value={model.vk} onChange={(e) => setModel({ ...model, vk: e.target.value })} /></label>
          <label>Источник<input value={model.source} onChange={(e) => setModel({ ...model, source: e.target.value })} /></label>
          <label>Менеджер<input value={model.manager} onChange={(e) => setModel({ ...model, manager: e.target.value })} /></label>
          <label>Рейтинг<input type="number" min={1} max={10} value={model.rating ?? ""} onChange={(e) => setModel({ ...model, rating: e.target.value ? Number(e.target.value) : null })} /></label>
          <label>Ниша<input value={model.niche} onChange={(e) => setModel({ ...model, niche: e.target.value })} /></label>
          <label>Комментарий<input value={model.comment} onChange={(e) => setModel({ ...model, comment: e.target.value })} /></label>
          <label>Дата след. контакта<input type="date" value={model.nextContactDate} onChange={(e) => setModel({ ...model, nextContactDate: e.target.value })} /></label>
          <label>Сумма счета<input type="number" value={model.invoiceAmount} onChange={(e) => setModel({ ...model, invoiceAmount: Number(e.target.value) })} /></label>
          <label>Сумма оплаты<input type="number" value={model.paidAmount} onChange={(e) => setModel({ ...model, paidAmount: Number(e.target.value) })} /></label>
          <label>Повторы<input type="number" value={model.repeats} onChange={(e) => setModel({ ...model, repeats: Number(e.target.value) })} /></label>
          <label>Купил<select value={model.bought ? "yes" : "no"} onChange={(e) => setModel({ ...model, bought: e.target.value === "yes" })}><option value="yes">Да</option><option value="no">Нет</option></select></label>
        </div>
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
              {["звонок", "сообщение", "встреча", "консультация", "замер", "оплата", "другое"].map((v) => <option key={v}>{v}</option>)}
            </select>
            <input placeholder="Комментарий" value={tpText} onChange={(e) => setTpText(e.target.value)} />
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
