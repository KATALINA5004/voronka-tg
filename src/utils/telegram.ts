type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
  };
  initDataUnsafe?: {
    user?: {
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function initTelegram() {
  const webApp = window.Telegram?.WebApp;
  if (!webApp) return;
  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor("#229ED9");
  webApp.setBackgroundColor("#f6f7fb");
}

export function haptic() {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("light");
}

export function getTelegramUser() {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return null;
  return {
    name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Пользователь"
  };
}
