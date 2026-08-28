import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import logoFull from "../assets/logo-full.png";
import logoMark from "../assets/logo-mark.png";
import { PasswordStrength } from "../components/PasswordStrength";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES, LANGUAGE_LABEL } from "../i18n";
import { homePathFor } from "../lib/roles";
import { btnPrimary, errorText, inputClass, labelClass } from "../lib/ui";
import { MIN_PASSWORD_LENGTH, evaluatePassword, isValidPhone } from "../lib/validation";

const DEMO_ACCOUNTS = [
  { roleKey: "role.ADMIN", email: "admin@cancerhms.local", password: "admin123" },
  { roleKey: "role.DOCTOR", email: "doctor@cancerhms.local", password: "doctor123" },
  { roleKey: "role.NURSE", email: "nurse@cancerhms.local", password: "nurse123" },
  { roleKey: "role.RECEPTIONIST", email: "reception@cancerhms.local", password: "reception123" },
  { roleKey: "role.PATIENT", email: "patient@cancerhms.local", password: "patient123" },
];

export function LoginPage({ initialMode = "login" }) {
  const { user, loading, login, signup } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const [mode, setMode] = useState(initialMode);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields -- a patient only. There is no role picker anywhere in this
  // form: signup() always produces a PATIENT account.
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("Female");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Live signup validation: the strength meter reads `pw`, the submit handler
  // gates on `pw.ok`, and the phone field shows `phoneError` once the user has
  // typed something that doesn't look like a real number.
  const pw = evaluatePassword(signupPassword);
  const phoneError = phone !== "" && !isValidPhone(phone);

  // Also handles the post-login/signup redirect: both set the user, this
  // rerenders, and each role lands on its own home. No hardcoded "/" -- that
  // is the staff dashboard, which a patient may not see.
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-400">Loading…</div>;
  }

  if (user) {
    // If the guard sent them here from a protected page (e.g. "Book appointment"
    // on the public site), go back there once they're a PATIENT; otherwise land
    // on the role's own home.
    const from = location.state?.from;
    const dest = from && user.role === "PATIENT" ? from : homePathFor(user.role);
    return <Navigate to={dest} replace />;
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.loginFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!pw.ok) {
      setError(t("login.pwWeak"));
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError(t("login.pwMismatch"));
      return;
    }
    if (!isValidPhone(phone)) {
      setError(t("login.phoneInvalid"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signup({ name, email: signupEmail, password: signupPassword, dob, sex, phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.couldNotCreate"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-8 px-4 py-10">
      <div className="glass-panel hidden w-full max-w-md flex-col items-center gap-6 px-10 py-14 text-center lg:flex">
        <img src={logoFull} alt="OncoCare" className="w-48 object-contain" />
        <p className="max-w-xs text-sm text-ink-400">{t("login.tagline")}</p>
      </div>

      <div className="glass-panel w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5">
          <img src={logoMark} alt="OncoCare logo" className="h-9 w-9 rounded-lg object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-ink-900">OncoCare</h1>
            <p className="text-xs text-ink-400">
              {mode === "login" ? t("login.signInToContinue") : t("login.createYourAccount")}
            </p>
          </div>
          {/* Language is reachable before sign-in too -- a patient who reads
              Myanmar should be able to switch before they type anything. */}
          <div className="flex gap-0.5 rounded-lg border border-hairline/70 bg-surface/40 p-0.5">
            {LANGUAGES.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                  lang === code
                    ? "bg-gradient-to-r from-frost-500/90 to-aqua-400/80 text-white shadow-sm"
                    : "text-ink-400 hover:text-ink-700"
                }`}
              >
                {code === "MY" ? LANGUAGE_LABEL.MY : "EN"}
              </button>
            ))}
          </div>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div>
              <label className={labelClass} htmlFor="email">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="password">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            {error && <p className={errorText}>{error}</p>}
            <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
              {submitting ? t("login.signingIn") : t("login.signIn")}
            </button>
            <p className="text-center text-sm text-ink-400">
              {t("login.newPatient")}{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-medium text-frost-600 hover:underline"
              >
                {t("login.createAccount")}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="mt-7 space-y-4">
            <div>
              <label className={labelClass} htmlFor="signup-name">
                {t("login.fullName")}
              </label>
              <input
                id="signup-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="signup-email">
                {t("login.email")}
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="signup-password">
                  {t("login.password")}
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="signup-confirm">
                  {t("login.confirmPassword")}
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {signupPassword.length > 0 && <PasswordStrength result={pw} />}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="signup-dob">
                  {t("login.dob")}
                </label>
                <input
                  id="signup-dob"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="signup-sex">
                  {t("login.sex")}
                </label>
                <select
                  id="signup-sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className={inputClass}
                >
                  <option value="Female">{t("login.sexFemale")}</option>
                  <option value="Male">{t("login.sexMale")}</option>
                  <option value="Other">{t("login.sexOther")}</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="signup-phone">
                {t("login.phone")}
              </label>
              <input
                id="signup-phone"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={phoneError}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
              {phoneError && <p className={`mt-1 ${errorText}`}>{t("login.phoneHint")}</p>}
            </div>
            {error && <p className={errorText}>{error}</p>}
            <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
              {submitting ? t("login.creatingAccount") : t("login.createAccount")}
            </button>
            <p className="text-center text-sm text-ink-400">
              {t("login.haveAccount")}{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-medium text-frost-600 hover:underline"
              >
                {t("login.signIn")}
              </button>
            </p>
          </form>
        )}

        {mode === "login" && (
          <div className="mt-7 border-t border-hairline/70 pt-4">
            <p className="text-xs font-medium text-ink-400">{t("login.demoAccounts")}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.email}
                  type="button"
                  onClick={() => {
                    setEmail(acct.email);
                    setPassword(acct.password);
                  }}
                  className="rounded-lg border border-hairline/80 bg-surface/60 px-2 py-1.5 text-xs text-ink-700 transition hover:bg-surface"
                >
                  {t(acct.roleKey)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
