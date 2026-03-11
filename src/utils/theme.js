const STORAGE_KEY = "kpt_theme_dark_mode";
const THEME_EVENT = "kpt-theme-change";

const readStoredTheme = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "true") return true;
    if (value === "false") return false;
  } catch {}

  return null;
};

export const getThemePreference = () => {
  const storedTheme = readStoredTheme();
  if (storedTheme !== null) return storedTheme;

  if (typeof document !== "undefined") {
    return document.body.classList.contains("dark-mode");
  }

  return false;
};

export const applyTheme = (darkMode, options = {}) => {
  if (typeof document === "undefined") return;

  const { persist = true, notify = true } = options;
  document.body.classList.toggle("dark-mode", darkMode);
  document.documentElement.style.colorScheme = darkMode ? "dark" : "light";

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, String(darkMode));
    } catch {}
  }

  if (notify && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { darkMode } }));
  }
};

export const subscribeToThemeChanges = (handler) => {
  if (typeof window === "undefined") return () => {};

  const listener = (event) => {
    handler(Boolean(event?.detail?.darkMode));
  };

  window.addEventListener(THEME_EVENT, listener);
  return () => window.removeEventListener(THEME_EVENT, listener);
};
