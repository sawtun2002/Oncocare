/**
 * Client-side validation for the public signup form (LoginPage). These rules
 * are a UX guard only -- the same policy has to be enforced server-side on
 * `POST /api/auth/signup` (and `POST /api/auth/me/password`), since anything
 * checked here can be bypassed. See API_CONTRACT.md.
 */

export const MIN_PASSWORD_LENGTH = 8;

// "Unique character" rule: a password that is two or three characters on
// repeat ("ababab", "aaaaaa") clears a naive length check but is trivial to
// guess, so require a minimum number of *distinct* characters as well.
const MIN_DISTINCT_CHARS = 5;

// A few of the most-tried passwords, lowercased. The character-class rules
// below already reject most weak choices; this only closes the gaps they
// don't ("Password1!" clears every class check and is still terrible).
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password1!",
  "password123",
  "12345678",
  "123456789",
  "qwertyui",
  "qwerty123",
  "letmein!",
  "welcome1",
  "iloveyou",
  "admin123",
]);

/**
 * Each individual password requirement and whether `pw` meets it, in the order
 * the form lists them.
 * @param {string} pw
 * @returns {{ id: string, label: string, ok: boolean }[]}
 */
function passwordRules(pw) {
  return [
    {
      id: "length",
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      ok: pw.length >= MIN_PASSWORD_LENGTH,
    },
    { id: "lower", label: "A lowercase letter", ok: /[a-z]/.test(pw) },
    { id: "upper", label: "An uppercase letter", ok: /[A-Z]/.test(pw) },
    { id: "number", label: "A number", ok: /\d/.test(pw) },
    { id: "symbol", label: "A symbol (!, ?, @, #, …)", ok: /[^A-Za-z0-9]/.test(pw) },
    {
      id: "distinct",
      label: `${MIN_DISTINCT_CHARS}+ different characters`,
      ok: new Set(pw).size >= MIN_DISTINCT_CHARS,
    },
    { id: "no-run", label: "No character 3+ times in a row", ok: !/(.)\1\1/.test(pw) },
    {
      id: "not-common",
      label: "Not a commonly used password",
      ok: pw.length > 0 && !COMMON_PASSWORDS.has(pw.toLowerCase()),
    },
  ];
}

/**
 * Rolls the rules into what the form needs: the checklist (`rules`), a 0-4
 * `score` for the strength meter, a `label` for it, and an `ok` gate that is
 * true only when every rule passes.
 * @param {string} pw
 * @returns {{
 *   rules: { id: string, label: string, ok: boolean }[],
 *   score: number,
 *   label: string,
 *   ok: boolean,
 * }}
 */
export function evaluatePassword(pw) {
  const rules = passwordRules(pw);
  const met = rules.filter((r) => r.ok).length;
  const ok = met === rules.length;

  let score;
  if (!pw) score = 0;
  else if (ok) score = 4;
  else if (met >= 6) score = 3;
  else if (met >= 4) score = 2;
  else score = 1;

  return {
    rules,
    score,
    label: ["Too short", "Weak", "Fair", "Good", "Strong"][score],
    ok,
  };
}

/**
 * A permissive "this looks like a real phone number" check: drop the usual
 * formatting characters and one leading `+`, then require 7-15 digits -- the
 * E.164 range. Intentionally not country-specific; it exists to catch typos
 * and junk ("abc", "12345"), not to police valid international formats.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const trimmed = String(phone).trim();
  if (trimmed === "" || /[A-Za-z]/.test(trimmed)) return false;
  const digits = trimmed.replace(/^\+/, "").replace(/[\s().-]/g, "");
  if (!/^\d{7,15}$/.test(digits)) return false;
  // A single digit repeated ("0000000") is never a real number.
  if (/^(\d)\1+$/.test(digits)) return false;
  return true;
}
