import { useEffect, useState } from "react";
import { PROJECT_SLOT_IDS, ProjectSlotId, Settings as SettingsType } from "../types";
import { projectTitle, type ProjectLabels } from "../utils/projectMeta";

type Props = {
  settings: SettingsType;
  projectSlot: ProjectSlotId;
  projectLabels: ProjectLabels;
  onSave: (settings: SettingsType) => void;
  onSaveProjectLabels: (labels: ProjectLabels) => void;
  onResetDemo: () => void;
  onClearAll: () => void;
};

export function Settings({
  settings,
  projectSlot,
  projectLabels,
  onSave,
  onSaveProjectLabels,
  onResetDemo,
  onClearAll
}: Props) {
  const [model, setModel] = useState(settings);
  const [labelDraft, setLabelDraft] = useState<ProjectLabels>(projectLabels);

  useEffect(() => {
    setModel(settings);
  }, [settings]);

  useEffect(() => {
    setLabelDraft(projectLabels);
  }, [projectLabels]);

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

  const setTouchTypeAt = (index: number, value: string) => {
    setModel((prev) => ({
      ...prev,
      touchpointTypes: prev.touchpointTypes.map((t, i) => (i === index ? value : t))
    }));
  };

  const addTouchType = () => {
    setModel((prev) => ({ ...prev, touchpointTypes: [...prev.touchpointTypes, ""] }));
  };

  const removeTouchType = (index: number) => {
    setModel((prev) => {
      if (prev.touchpointTypes.length <= 1) return prev;
      return { ...prev, touchpointTypes: prev.touchpointTypes.filter((_, i) => i !== index) };
    });
  };

  const saveAll = () => {
    const cleaned = model.touchpointTypes.map((t) => t.trim()).filter(Boolean);
    onSave({
      ...model,
      touchpointTypes: cleaned.length ? cleaned : ["звонок"]
    });
    onSaveProjectLabels(labelDraft);
  };

  return (
    <div className="stack">
      <section className="card">
        <p className="hint-muted" style={{ marginTop: 0 }}>
          Сейчас настройки и база относятся к: <strong>{projectTitle(projectSlot, projectLabels)}</strong>. Переключение — кнопки вверху экрана.
        </p>
      </section>
      <section className="card form-grid">
        <h3 className="full-width-heading">Названия проектов (кнопки переключения)</h3>
        {PROJECT_SLOT_IDS.map((id) => (
          <label key={id}>
            {projectTitle(id, labelDraft)} — подпись на кнопке
            <input
              value={labelDraft[id]}
              onChange={(e) => setLabelDraft((d) => ({ ...d, [id]: e.target.value }))}
              placeholder={`Проект ${PROJECT_SLOT_IDS.indexOf(id) + 1}`}
            />
          </label>
        ))}
      </section>
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
        <p className="hint-muted">У каждого типа своё поле — можно написать несколько слов. Минимум один тип.</p>
        <div className="touch-types-editor">
          {model.touchpointTypes.map((tp, idx) => (
            <div key={idx} className="touch-type-row">
              <label>
                Тип {idx + 1}
                <input value={tp} onChange={(e) => setTouchTypeAt(idx, e.target.value)} placeholder="Например: Исходящий звонок" />
              </label>
              <button type="button" className="ghost touch-type-remove" onClick={() => removeTouchType(idx)} disabled={model.touchpointTypes.length <= 1}>
                Удалить
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="ghost touch-type-add" onClick={addTouchType}>
          + Добавить тип касания
        </button>
      </section>
      <section className="card">
        <div className="toolbar">
          <button onClick={saveAll}>Сохранить</button>
          <button onClick={onResetDemo}>Сбросить в пустую базу</button>
          <button className="danger-btn" onClick={onClearAll}>Удалить все данные</button>
        </div>
        <p className="muted small">Экспорт и импорт полной базы отключены. Вход — по одноразовому коду с экрана входа.</p>
      </section>
    </div>
  );
}
