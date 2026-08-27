import { en } from "./en";
import { my } from "./my";

/**
 * The lightweight i18n layer -- no dependency, same spirit as `lib/ui.js` and
 * `lib/motion.js`: one place, plain data. Components never import a catalog
 * directly; they call `t(key, vars)` from `useLanguage()` (see
 * `context/LanguageContext.jsx`), which is a thin wrapper over `translate()`
 * below.
 *
 * Keys are dot-namespaced by area (`nav.*`, `profile.*`, `common.*`, ...). A
 * missing key falls back to English, then to the key itself, so a half-finished
 * translation degrades to English rather than to blanks.
 */

export const LANGUAGES = ["EN", "MY"];

/** Shown in the language picker -- each in its own script, so it's legible whichever language is active. */
export const LANGUAGE_LABEL = { EN: "English", MY: "မြန်မာ" };

const CATALOGS = { EN: en, MY: my };

/**
 * @param {string} key dot-namespaced message id
 * @param {"EN" | "MY"} lang
 * @param {Record<string, string | number>} [vars] values for `{name}`-style placeholders
 */
export function translate(key, lang, vars) {
  const template = CATALOGS[lang]?.[key] ?? CATALOGS.EN[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in vars ? String(vars[name]) : match
  );
}
