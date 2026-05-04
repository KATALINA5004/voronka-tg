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
      setError("Введите 12 символов (буквы и цифры), например M7KQ-2H9P-4VNC.");
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
          Введите одноразовый код доступа. Один код — один вход с этого устройства; повторно тот же код использовать нельзя.
        </p>
        <form className="access-form" onSubmit={onSubmit}>
          <label>
            Код
            <input
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="M7KQ-2H9P-4VNC"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          {error && <p className="access-error">{error}</p>}
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}
