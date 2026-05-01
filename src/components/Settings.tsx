import { useState } from "react";
import { Settings as SettingsType } from "../types";

type Props = {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onResetDemo: () => void;
  onClearAll: () => void;
  onExportJson: () => void;
  onImportJson: (raw: string) => boolean;
};

export function Settings({ settings, onSave, onResetDemo, onClearAll, onExportJson, onImportJson }: Props) {
  const [model, setModel] = useState(settings);
  const setStageName = (index: number, name: string) => {
    setModel((prev) => ({
      ...prev,
      stages: prev.stages.map((stage, i) => (i === index ? { ...stage, name } : stage))
    }));
  };

  return (
    <div className="stack">
      <section className="card form-grid">
        <label>Название этапа 1<input value={model.stages[0]?.name || ""} onChange={(e) => setStageName(0, e.target.value)} /></label>
        <label>Название этапа 2<input value={model.stages[1]?.name || ""} onChange={(e) => setStageName(1, e.target.value)} /></label>
        <label>Название этапа 3<input value={model.stages[2]?.name || ""} onChange={(e) => setStageName(2, e.target.value)} /></label>
        <label>Название этапа 4<input value={model.stages[3]?.name || ""} onChange={(e) => setStageName(3, e.target.value)} /></label>
        <label>Рентабельность по умолчанию<input type="number" value={model.defaultProfitability} onChange={(e) => setModel({ ...model, defaultProfitability: Number(e.target.value) })} /></label>
        <label>Средний чек по умолчанию<input type="number" value={model.defaultAverageCheck} onChange={(e) => setModel({ ...model, defaultAverageCheck: Number(e.target.value) })} /></label>
        <label>Валюта<select value={model.currency} onChange={(e) => setModel({ ...model, currency: e.target.value })}><option value="RUB">RUB</option><option value="USD">USD</option><option value="EUR">EUR</option></select></label>
      </section>
      <section className="card">
        <div className="toolbar">
          <button onClick={() => onSave(model)}>Сохранить</button>
          <button onClick={onResetDemo}>Сбросить демо-данные</button>
          <button className="danger-btn" onClick={onClearAll}>Удалить все данные</button>
          <button onClick={onExportJson}>Экспортировать все данные JSON</button>
          <label className="import-json">
            Импортировать данные JSON
            <input
              type="file"
              accept=".json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const ok = onImportJson(await file.text());
                if (!ok) alert("Некорректный JSON");
              }}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
