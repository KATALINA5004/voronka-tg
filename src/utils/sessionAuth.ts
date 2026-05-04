const SESSION_LOGIN_KEY = "funnel-tg-session-login-v1";

export function getSessionLogin(): string | null {
  const s = sessionStorage.getItem(SESSION_LOGIN_KEY);
  return s && s.trim() ? s.trim() : null;
}

export function setSessionLogin(login: string): void {
  sessionStorage.setItem(SESSION_LOGIN_KEY, login);
}

export function clearSessionLogin(): void {
  sessionStorage.removeItem(SESSION_LOGIN_KEY);
}
