import { useState } from "react";
import { Stage } from "../types";
import { parseImportFile } from "../utils/importExport";

type Props = {
  stages: Stage[];
  onClose: () => void;
  onImport: (rows: Record<string, unknown>[], stageId: Stage["id"]) => void;
};

export function ImportModal({ stages, onClose, onImport }: Props) {
  const [stageId, setStageId] = useState<Stage["id"]>("stage1");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Импорт Excel/CSV</h3>
        <label>Этап для загрузки
          <select value={stageId} onChange={(e) => setStageId(e.target.value as Stage["id"])}>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const parsed = await parseImportFile(file);
            setRows(parsed);
            setHeaders(Object.keys(parsed[0] ?? {}));
          }}
        />
        {rows.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => <tr key={i}>{headers.map((h) => <td key={h}>{String(row[h] ?? "")}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
        )}
        <div className="row end">
          <button className="ghost" onClick={onClose}>Отмена</button>
          <button onClick={() => onImport(rows, stageId)} disabled={!rows.length}>Импортировать</button>
        </div>
      </div>
    </div>
  );
}
