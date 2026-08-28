import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, translate } from "../i18n";

const LANG_KEY = "cancer-hms-lang";

const LanguageContext = createContext(undefined);

/**
 * Reads the stored language, defaulting to "EN".
 *
 * The inline script in index.html duplicates the `<html lang>` half of this so
 * it runs before first paint (assistive tech and the `:lang(my)` font rule pick
 * it up immediately). If the storage key or the fallback changes here, change it
 * there too.
 */
function readStoredLanguage() {
  const raw = localStorage.getItem(LANG_KEY);
  return LANGUAGES.includes(raw) ? raw : "EN";
}

/**
 * App-wide language. Same shape and per-device rationale as `ThemeContext`:
 * stored in this browser, not on the account. Exposes `t(key, vars)` -- the only
 * thing components use -- plus `lang`/`setLang` for the picker on the profile
 * page.
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLanguage);

  // The one DOM write. `<html lang>` drives screen-reader pronunciation and the
  // Myanmar font fallback in index.css.
  useEffect(() => {
    document.documentElement.lang = lang === "MY" ? "my" : "en";
  }, [lang]);

  const setLang = useCallback((next) => {
    localStorage.setItem(LANG_KEY, next);
    setLangState(next);
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t: (key, vars) => translate(key, lang, vars) }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
