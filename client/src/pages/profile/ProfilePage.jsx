import { useRef, useState } from "react";
import { Avatar } from "../../components/Avatar";
import { GlassCard } from "../../components/GlassCard";
import { PasswordStrength } from "../../components/PasswordStrength";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatDateTime } from "../../lib/format";
import {
  btnGhost,
  btnPrimary,
  dangerAction,
  errorText,
  inputClass,
  labelClass,
  pageTitle,
  sectionLabel,
} from "../../lib/ui";
import { evaluatePassword } from "../../lib/validation";

const ROLE_LABEL = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
  PATIENT: "Patient",
};

/** A picked file, read into a data: URI. Rejects on any FileReader error. */
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error ?? new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

/**
 * The signed-in account's own settings. Open to every role: this page never
 * takes a user id, it only ever edits whoever is signed in, so there is nothing
 * here for a role check to protect. Reached from the sidebar by clicking the
 * identity card, not a nav link -- see the note in Layout.jsx.
 *
 * Independent cards rather than one Save for the page -- a photo, a toggle, a
 * password and a name/email edit are different acts with different failure
 * modes, and one shared error line would have to speak for all of them.
 */
export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className={pageTitle}>Profile</h1>
      <p className="mt-2 text-sm text-ink-400">
        Your photo, sign-in details, and how the app looks and reaches you.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AvatarCard user={user} />
          <DetailsCard user={user} />
          <NotificationsCard user={user} />
        </div>
        <div className="space-y-6">
          <PasswordCard />
          <SecurityCard user={user} />
          <AppearanceCard />
        </div>
      </div>
    </div>
  );
}

function AvatarCard({ user }) {
  const { updateAvatar } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Kept small on purpose: the mock stores this as a data: URI directly on the
  // user record, persisted to localStorage alongside everything else the app
  // keeps there -- and that origin-wide quota is a few MB, shared, not per-key.
  const MAX_BYTES = 1.5 * 1024 * 1024;

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be re-picked if this attempt fails
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is too large -- please choose one under 1.5 MB.");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      await updateAvatar(dataUrl);
      toast.success("Your photo has been updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);
    try {
      await updateAvatar(undefined);
      toast.success("Your photo has been removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>Photo</h2>
      <div className="mt-4 flex items-center gap-4">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={btnGhost}
            >
              {uploading ? "Uploading…" : user.avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {user.avatarUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${dangerAction}`}
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-ink-400">JPG, PNG or GIF, up to 1.5 MB.</p>
        </div>
      </div>
      {/* Hidden and driven by the buttons above, rather than a native file
          input in the flow -- its own default look can't be restyled to match
          the rest of the form. */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
      {error && <p className={`mt-3 ${errorText}`}>{error}</p>}
    </GlassCard>
  );
}

function DetailsCard({ user }) {
  const { updateProfile } = useAuth();
  const toast = useToast();
  // A patient's phone lives on their Patient record, not their login (see
  // API_CONTRACT.md) -- these fields exist for staff only.
  const isStaff = user.role !== "PATIENT";
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [department, setDepartment] = useState(user.department ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const unchanged =
    name === user.name &&
    email === user.email &&
    phone === (user.phone ?? "") &&
    department === (user.department ?? "");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await updateProfile(isStaff ? { name, email, phone, department } : { name, email });
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

        {isStaff && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Phone
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </label>
            <label className={labelClass}>
              Department
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Oncology Ward 3"
                className={inputClass}
              />
            </label>
          </div>
        )}

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

function NotificationsCard({ user }) {
  const { updateNotificationPreferences } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleToggle(e) {
    const next = e.target.checked;
    setError(null);
    setSaving(true);
    try {
      await updateNotificationPreferences({ notifyAppointmentReminders: next });
      toast.success(next ? "Appointment reminders turned on." : "Appointment reminders turned off.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>Notifications</h2>
      <label className="mt-4 flex items-start gap-3 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={user.notifyAppointmentReminders ?? true}
          onChange={handleToggle}
          disabled={saving}
          className="mt-0.5 h-4 w-4 rounded border-hairline/80 text-frost-500 focus:outline-none focus:ring-2 focus:ring-frost-400/50"
        />
        <span>
          Email me a reminder before upcoming appointments.
          <span className="block text-xs text-ink-400">
            Mock setting for now -- there's no real email backend yet to act on it.
          </span>
        </span>
      </label>
      {error && <p className={`mt-3 ${errorText}`}>{error}</p>}
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

  const pw = evaluatePassword(newPassword);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pw.ok) {
      setError("Choose a stronger password — every requirement below must be met.");
      return;
    }
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

        {newPassword.length > 0 && <PasswordStrength result={pw} />}

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

function SecurityCard({ user }) {
  const { logout } = useAuth();

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>Session</h2>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-400">Last signed in</dt>
          <dd className="text-ink-700">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-ink-400">
        There's only ever one session in this app today -- logging out here ends the one you're using.
      </p>
      <button type="button" onClick={logout} className={`mt-4 ${btnGhost}`}>
        Log out
      </button>
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
