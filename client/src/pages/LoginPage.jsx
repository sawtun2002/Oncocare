import { useState } from "react";
import { Navigate } from "react-router-dom";
import logoFull from "../assets/logo-full.png";
import logoMark from "../assets/logo-mark.png";
import { useAuth } from "../context/AuthContext";
import { homePathFor } from "../lib/roles";
import { btnPrimary, errorText, inputClass, labelClass } from "../lib/ui";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@cancerhms.local", password: "admin123" },
  { label: "Doctor", email: "doctor@cancerhms.local", password: "doctor123" },
  { label: "Nurse", email: "nurse@cancerhms.local", password: "nurse123" },
  { label: "Receptionist", email: "reception@cancerhms.local", password: "reception123" },
  { label: "Patient", email: "patient@cancerhms.local", password: "patient123" },
];

const MIN_PASSWORD_LENGTH = 6;

export function LoginPage({ initialMode = "login" }) {
  const { user, loading, login, signup } = useAuth();
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

  // Also handles the post-login/signup redirect: both set the user, this
  // rerenders, and each role lands on its own home. No hardcoded "/" -- that
  // is the staff dashboard, which a patient may not see.
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-ink-400">Loading…</div>;
  }

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />;
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
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (signupPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signup({ name, email: signupEmail, password: signupPassword, dob, sex, phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center gap-8 px-4 py-10">
      <div className="glass-panel hidden w-full max-w-md flex-col items-center gap-6 px-10 py-14 text-center lg:flex">
        <img src={logoFull} alt="OncoCare" className="w-48 object-contain" />
        <p className="max-w-xs text-sm text-ink-400">
          Coordinated cancer care — patient records, appointments, and billing in one place.
        </p>
      </div>

      <div className="glass-panel w-full max-w-sm p-8">
        <div className="flex items-center gap-2.5">
          <img src={logoMark} alt="Cancer HMS logo" className="h-9 w-9 rounded-lg object-contain" />
          <div>
            <h1 className="text-lg font-semibold text-ink-900">Cancer HMS</h1>
            <p className="text-xs text-ink-400">
              {mode === "login" ? "Sign in to continue" : "Create your patient account"}
            </p>
          </div>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div>
              <label className={labelClass} htmlFor="email">
                Email
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
                Password
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
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            <p className="text-center text-sm text-ink-400">
              New patient?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-medium text-frost-600 hover:underline"
              >
                Create account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="mt-7 space-y-4">
            <div>
              <label className={labelClass} htmlFor="signup-name">
                Full name
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
                Email
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="signup-password">
                  Password
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
                  Confirm password
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="signup-dob">
                  Date of birth
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
                  Sex
                </label>
                <select
                  id="signup-sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className={inputClass}
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="signup-phone">
                Phone
              </label>
              <input
                id="signup-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
            {error && <p className={errorText}>{error}</p>}
            <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
              {submitting ? "Creating account…" : "Create account"}
            </button>
            <p className="text-center text-sm text-ink-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-medium text-frost-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {mode === "login" && (
          <div className="mt-7 border-t border-hairline/70 pt-4">
            <p className="text-xs font-medium text-ink-400">Demo accounts (dummy data)</p>
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
                  {acct.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
