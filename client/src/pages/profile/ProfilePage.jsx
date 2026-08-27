import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { homePathFor } from "../../lib/roles";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass, pageTitle } from "../../lib/ui";

const ROLE_LABEL = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
  PATIENT: "Patient",
};

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  if (!user) return null;
  const homePath = homePathFor(user.role);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaved(false);
    setError(null);

    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update profile");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={homePath} className="text-sm text-frost-600 hover:underline">
        ← Back to dashboard
      </Link>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h1 className={pageTitle}>My profile</h1>
          <p className="mt-2 text-sm text-ink-400">Keep your account details up to date.</p>
        </div>
        <div className="rounded-full bg-serenity-100 px-3 py-1 text-xs font-semibold text-serenity-900">
          {ROLE_LABEL[user.role]}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel mt-6 space-y-5 p-6">
        <label className={labelClass}>
          Full name
          <input
            required
            minLength={2}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Email address
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
        </label>

        <div className="rounded-lg border border-ice-200 bg-ice-50/60 px-3 py-2 text-sm text-ink-400">
          Role: <span className="font-medium text-ink-700">{ROLE_LABEL[user.role]}</span>
        </div>

        {saved && <p className="text-sm text-emerald-600">Profile updated successfully.</p>}
        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2">
          <Link to={homePath} className={btnGhost}>Cancel</Link>
          <button type="submit" className={btnPrimary}>Save changes</button>
        </div>
      </form>
    </div>
  );
}
