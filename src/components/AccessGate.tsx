import { FormEvent, useState } from "react";
import { matchCredentials } from "../constants/accountCredentials";
import { setSessionLogin } from "../utils/sessionAuth";

type Props = {
  accountLogin: string | null;
  onLoggedIn: (canonicalLogin: string) => void;
  children: React.ReactNode;
};

export function AccessGate({ accountLogin, onLoggedIn, children }: Props) {
  const [loginInput, setLoginInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const canonical = matchCredentials(loginInput, codeInput);
    if (!canonical) {
      setError("Неверный логин или код.");
      return;
    }
    setSessionLogin(canonical);
    onLoggedIn(canonical);
  }

  if (accountLogin) return <>{children}</>;

  return (
    <div className="access-gate">
      <div className="access-card">
        <h2>Вход в админку</h2>
        <p className="muted">
          Введите выданные вам логин и код. Без них доступ закрыт. Если в проекте настроен Supabase (переменные окружения), данные синхронизируются между устройствами.
        </p>
        <form className="access-form" onSubmit={onSubmit}>
          <label>
            Логин
            <input
              type="text"
              autoComplete="username"
              spellCheck={false}
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="например vn_001"
            />
          </label>
          <label>
            Код
            <input
              type="password"
              autoComplete="current-password"
              spellCheck={false}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            />
          </label>
          <p className="hint-muted">Код: 12 латинских букв и цифр, можно с дефисами по четыре знака.</p>
          {error && <p className="access-error">{error}</p>}
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}
