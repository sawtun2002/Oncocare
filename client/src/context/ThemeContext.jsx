import { createContext, useCallback, useContext, useEffect, useState } from "react";

const THEME_KEY = "cancer-hms-theme";

const ThemeContext = createContext(undefined);

function darkQuery() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

/**
 * Reads the stored preference, defaulting to "system".
 *
 * The inline script in index.html duplicates this logic deliberately: it has to
 * run before first paint, long before this module is parsed, or a dark-mode
 * reload flashes white. If the storage key or the fallback changes here, change
 * it there too.
 */
function readStoredPreference() {
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredPreference);
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  // Derived during render rather than held in an effect -- there is no second
  // source of truth to fall out of sync with.
  const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // Tracked only so a "system" preference stays live if the OS theme changes
  // while the app is open.
  useEffect(() => {
    const query = darkQuery();
    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // The single write to the DOM. Every themed style keys off this attribute
  // (see the [data-theme="dark"] block and @custom-variant in index.css).
  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  const setTheme = useCallback((next) => {
    localStorage.setItem(THEME_KEY, next);
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
