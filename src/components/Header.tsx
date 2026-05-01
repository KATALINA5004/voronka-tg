import { getTelegramUser } from "../utils/telegram";

export function Header() {
  const user = getTelegramUser();
  return (
    <header className="header">
      <div>
        <h1>Воронка TG</h1>
        <p>{user?.name || "Демо-режим"}</p>
      </div>
    </header>
  );
}
