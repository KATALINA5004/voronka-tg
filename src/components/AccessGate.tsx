import { FormEvent, useMemo, useState } from "react";
import {
  createAuthRecord,
  loadAuthRecord,
  verifyPassword,
  isSessionUnlocked,
  setSessionUnlocked
} from "../utils/authStorage";

type Props = {
  ownerTgId: number | null;
  children: React.ReactNode;
};

export function AccessGate({ ownerTgId, children }: Props) {
  const [unlocked, setUnlocked] = useState(() => isSessionUnlocked());
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const auth = useMemo(() => loadAuthRecord(), [unlocked]);

  const wrongAccount = auth && ownerTgId !== null && auth.ownerTgId !== ownerTgId;
  const needTelegram = ownerTgId === null;

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (ownerTgId === null) return;
    if (password.length < 4) {
      setError("Пароль не короче 4 символов.");
      return;
    }
    if (password !== password2) {
      setError("Пароли не совпадают.");
      return;
    }
    setBusy(true);
    try {
      await createAuthRecord(ownerTgId, password);
      setSessionUnlocked();
      setUnlocked(true);
    } finally {
      setBusy(false);
    }
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    const rec = loadAuthRecord();
    if (!rec) return;
    setBusy(true);
    try {
      const ok = await verifyPassword(rec, password);
      if (!ok) {
        setError("Неверный пароль.");
        return;
      }
      setSessionUnlocked();
      setUnlocked(true);
    } finally {
      setBusy(false);
    }
  }

  if (unlocked) return <>{children}</>;

  if (needTelegram) {
    return (
      <div className="access-gate">
        <div className="access-card">
          <h2>Вход только из Telegram</h2>
          <p className="muted">
            База привязана к аккаунту Telegram. Откройте это приложение как Mini App внутри Telegram, чтобы войти.
          </p>
        </div>
      </div>
    );
  }

  if (wrongAccount) {
    return (
      <div className="access-gate">
        <div className="access-card">
          <h2>Другой аккаунт</h2>
          <p className="muted">Эта база уже привязана к другому пользователю Telegram. Передача и общий доступ отключены.</p>
        </div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="access-gate">
        <div className="access-card">
          <h2>Первый вход</h2>
          <p className="muted">Задайте пароль для этого аккаунта Telegram. Данные хранятся только на этом устройстве в браузере.</p>
          <form className="access-form" onSubmit={onRegister}>
            <label>
              Пароль
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label>
              Повтор пароля
              <input type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
            </label>
            {error && <p className="access-error">{error}</p>}
            <button type="submit" disabled={busy}>
              {busy ? "…" : "Сохранить и войти"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="access-gate">
      <div className="access-card">
        <h2>Вход</h2>
        <p className="muted">Введите пароль для доступа к базе.</p>
        <form className="access-form" onSubmit={onLogin}>
          <label>
            Пароль
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p className="access-error">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? "…" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
