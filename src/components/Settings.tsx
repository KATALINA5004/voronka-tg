import { useEffect, useState } from "react";
import { Settings as SettingsType } from "../types";

type Props = {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onResetDemo: () => void;
  onClearAll: () => void;
};

export function Settings({ settings, onSave, onResetDemo, onClearAll }: Props) {
  const [model, setModel] = useState(settings);

  useEffect(() => {
    setModel(settings);
  }, [settings]);

  const setStageName = (index: number, name: string) => {
    setModel((prev) => ({
      ...prev,
      stages: prev.stages.map((stage, i) => (i === index ? { ...stage, name } : stage))
    }));
  };
  const setStageScript = (stageId: keyof SettingsType["stageScripts"], variantIndex: number, value: string) => {
    setModel((prev) => ({
      ...prev,
      stageScripts: {
        ...prev.stageScripts,
        [stageId]: prev.stageScripts[stageId].map((script, i) => (i === variantIndex ? value : script))
      }
    }));
  };
  const setTouchpointTypes = (raw: string) => {
    const parsed = raw
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    setModel((prev) => ({ ...prev, touchpointTypes: parsed.length ? parsed : ["звонок"] }));
  };

  return (
    <div className="stack">
      <section className="card form-grid">
        <label>Название этапа 1<input value={model.stages[0]?.name || ""} onChange={(e) => setStageName(0, e.target.value)} /></label>
        <label>Название этапа 2<input value={model.stages[1]?.name || ""} onChange={(e) => setStageName(1, e.target.value)} /></label>
        <label>Название этапа 3<input value={model.stages[2]?.name || ""} onChange={(e) => setStageName(2, e.target.value)} /></label>
        <label>Название этапа 4<input value={model.stages[3]?.name || ""} onChange={(e) => setStageName(3, e.target.value)} /></label>
        <label>Название этапа 5<input value={model.stages[4]?.name || ""} onChange={(e) => setStageName(4, e.target.value)} /></label>
        <label>Рентабельность по умолчанию<input type="number" value={model.defaultProfitability} onChange={(e) => setModel({ ...model, defaultProfitability: Number(e.target.value) })} /></label>
        <label>Средний чек по умолчанию<input type="number" value={model.defaultAverageCheck} onChange={(e) => setModel({ ...model, defaultAverageCheck: Number(e.target.value) })} /></label>
        <label>Валюта<select value={model.currency} onChange={(e) => setModel({ ...model, currency: e.target.value })}><option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option></select></label>
      </section>
      <section className="card">
        <h3>Скрипты по этапам (по 3 варианта, используйте {'{имя}'})</h3>
        <div className="stack">
          {model.stages.map((stage) => (
            <div key={stage.id} className="card">
              <strong>{stage.name}</strong>
              <div className="form-grid">
                <label>Скрипт 1<textarea value={model.stageScripts[stage.id]?.[0] || ""} onChange={(e) => setStageScript(stage.id, 0, e.target.value)} /></label>
                <label>Скрипт 2<textarea value={model.stageScripts[stage.id]?.[1] || ""} onChange={(e) => setStageScript(stage.id, 1, e.target.value)} /></label>
                <label>Скрипт 3<textarea value={model.stageScripts[stage.id]?.[2] || ""} onChange={(e) => setStageScript(stage.id, 2, e.target.value)} /></label>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h3>Типы касаний</h3>
        <label>
          По одному типу на строку
          <textarea
            value={model.touchpointTypes.join("\n")}
            onChange={(e) => setTouchpointTypes(e.target.value)}
            placeholder={"звонок\nсообщение\nвстреча"}
          />
        </label>
      </section>
      <section className="card">
        <div className="toolbar">
          <button onClick={() => onSave(model)}>Сохранить</button>
          <button onClick={onResetDemo}>Сбросить в пустую базу</button>
          <button className="danger-btn" onClick={onClearAll}>Удалить все данные</button>
        </div>
        <p className="muted small">Экспорт и импорт полной базы отключены: один доступ на аккаунт Telegram, без передачи проекта файлами.</p>
      </section>
    </div>
  );
}
