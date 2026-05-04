import { FormEvent, useState } from "react";
import { isAppUnlocked, normalizeInviteCodeInput, redeemInviteCode, setAppUnlocked } from "../utils/inviteCodeStorage";

type Props = {
  children: React.ReactNode;
};

export function AccessGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(() => isAppUnlocked());
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const normalized = normalizeInviteCodeInput(code);
    if (!normalized) {
      setError("Нужно ровно 12 латинских букв и цифр (дефисы можно, можно без них).");
      return;
    }
    const result = redeemInviteCode(normalized);
    if (result === "invalid") {
      setError("Такого кода нет в списке.");
      return;
    }
    if (result === "used") {
      setError("Этот код уже был использован и больше не действует.");
      return;
    }
    setAppUnlocked();
    setUnlocked(true);
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="access-gate">
      <div className="access-card">
        <h2>Вход по коду</h2>
        <p className="muted">
          Введите выданный вам одноразовый код. Без кода войти нельзя. Один код — один вход с этого устройства, повторно тот же код не сработает.
        </p>
        <form className="access-form" onSubmit={onSubmit}>
          <label>
            Код
            <input
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <p className="hint-muted">12 латинских букв и цифр, можно с дефисами по четыре знака.</p>
          {error && <p className="access-error">{error}</p>}
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}
