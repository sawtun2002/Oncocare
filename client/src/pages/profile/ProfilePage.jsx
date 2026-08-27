import { useState } from "react";
import { GlassCard } from "../../components/GlassCard";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { btnPrimary, errorText, inputClass, labelClass, pageTitle, sectionLabel } from "../../lib/ui";

const ROLE_LABEL = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
  PATIENT: "Patient",
};

/**
 * The signed-in account's own settings. Open to every role: this page never
 * takes a user id, it only ever edits whoever is signed in, so there is nothing
 * here for a role check to protect.
 *
 * Two independent forms rather than one Save for the page -- changing a password
 * and correcting a misspelt name are different acts with different failure
 * modes, and one shared error line would have to speak for both.
 */
export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className={pageTitle}>My profile</h1>
      <p className="mt-2 text-sm text-ink-400">
        Your sign-in details and how the app looks on this device.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DetailsCard user={user} />
        <div className="space-y-6">
          <PasswordCard />
          <AppearanceCard />
        </div>
      </div>
    </div>
  );
}

function DetailsCard({ user }) {
  const { updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const unchanged = name === user.name && email === user.email;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateProfile({ name, email });
      toast.success("Your details have been saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>Account details</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className={labelClass}>
          Full name
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        {/* Read-only on purpose. A role is granted by an administrator on the
            staff accounts screen; an account that could raise its own would make
            every other role check in the app decorative. */}
        <div>
          <span className={labelClass}>Role</span>
          <p className="mt-1 text-sm text-ink-700">{ROLE_LABEL[user.role]}</p>
        </div>

        {error && <p className={errorText}>{error}</p>}

        <button type="submit" disabled={submitting || unchanged} className={btnPrimary}>
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </GlassCard>
  );
}

function PasswordCard() {
  const { changePassword } = useAuth();
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    // Checked here rather than server-side: the confirmation field exists to
    // catch a typo in this form, and never leaves it.
    if (newPassword !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      toast.success("Your password has been changed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>Password</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className={labelClass}>
          Current password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          New password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Confirm new password
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && <p className={errorText}>{error}</p>}

        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "Changing…" : "Change password"}
        </button>
      </form>
    </GlassCard>
  );
}

function AppearanceCard() {
  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>Appearance</h2>
      <p className="mt-3 text-sm text-ink-700">
        The same control as the one in the sidebar. It is stored in this browser, not on your account,
        so each device can differ.
      </p>
      <ThemeToggle />
    </GlassCard>
  );
}
