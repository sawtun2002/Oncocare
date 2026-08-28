import { useRef, useState } from "react";
import { listAppointments } from "../../api/appointments";
import { listInvoices } from "../../api/billing";
import { listLeaveRequests } from "../../api/leave";
import { getPatient } from "../../api/patients";
import { Avatar } from "../../components/Avatar";
import { GlassCard } from "../../components/GlassCard";
import { PasswordStrength } from "../../components/PasswordStrength";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { LANGUAGES, LANGUAGE_LABEL } from "../../i18n";
import { formatDateTime, toDateInputValue } from "../../lib/format";
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
  const { t } = useLanguage();

  return (
    <div>
      <h1 className={pageTitle}>{t("profile.title")}</h1>
      <p className="mt-2 text-sm text-ink-400">{t("profile.subtitle")}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <AvatarCard user={user} />
          <DetailsCard user={user} />
          <NotificationsCard user={user} />
        </div>
        <div className="space-y-6">
          <PasswordCard />
          <LanguageCard />
          <PrivacyCard user={user} />
          <SecurityCard user={user} />
          <AppearanceCard />
        </div>
      </div>
    </div>
  );
}

function AvatarCard({ user }) {
  const { updateAvatar } = useAuth();
  const { t } = useLanguage();
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
      setError(t("profile.photoNotImage"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("profile.photoTooBig"));
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const dataUrl = await readAsDataUrl(file);
      await updateAvatar(dataUrl);
      toast.success(t("profile.photoUpdated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);
    try {
      await updateAvatar(undefined);
      toast.success(t("profile.photoRemoved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>{t("profile.photo")}</h2>
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
              {uploading
                ? t("profile.uploading")
                : user.avatarUrl
                  ? t("profile.changePhoto")
                  : t("profile.uploadPhoto")}
            </button>
            {user.avatarUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${dangerAction}`}
              >
                {t("profile.remove")}
              </button>
            )}
          </div>
          <p className="text-xs text-ink-400">{t("profile.photoHint")}</p>
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
  const { t } = useLanguage();
  const toast = useToast();
  // A patient's phone lives on their Patient record, not their login (see
  // API_CONTRACT.md) -- these fields exist for staff only.
  const isStaff = user.role !== "PATIENT";
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [department, setDepartment] = useState(user.department ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const unchanged =
    name === user.name &&
    email === user.email &&
    phone === (user.phone ?? "") &&
    department === (user.department ?? "") &&
    address === (user.address ?? "");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // `nrc` is not sent -- it is ADMIN-set and ProfileInput has no such field.
      await updateProfile(isStaff ? { name, email, phone, department, address } : { name, email });
      toast.success(t("profile.detailsSaved"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>{t("profile.accountDetails")}</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className={labelClass}>
          {t("profile.fullName")}
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>
          {t("profile.email")}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        {isStaff && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                {t("profile.phone")}
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                {t("profile.department")}
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder={t("profile.departmentPlaceholder")}
                  className={inputClass}
                />
              </label>
            </div>
            <label className={labelClass}>
              {t("profile.address")}
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputClass}
              />
            </label>
          </>
        )}

        {/* Read-only on purpose. A role is granted by an administrator on the
            staff accounts screen; an account that could raise its own would make
            every other role check in the app decorative. */}
        <div>
          <span className={labelClass}>{t("profile.role")}</span>
          <p className="mt-1 text-sm text-ink-700">{t(`role.${user.role}`)}</p>
        </div>

        {error && <p className={errorText}>{error}</p>}

        <button type="submit" disabled={submitting || unchanged} className={btnPrimary}>
          {submitting ? t("common.saving") : t("common.saveChanges")}
        </button>
      </form>
    </GlassCard>
  );
}

function NotificationsCard({ user }) {
  const { updateNotificationPreferences } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleToggle(e) {
    const next = e.target.checked;
    setError(null);
    setSaving(true);
    try {
      await updateNotificationPreferences({ notifyAppointmentReminders: next });
      toast.success(next ? t("profile.remindersOn") : t("profile.remindersOff"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>{t("profile.notifications")}</h2>
      <label className="mt-4 flex items-start gap-3 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={user.notifyAppointmentReminders ?? true}
          onChange={handleToggle}
          disabled={saving}
          className="mt-0.5 h-4 w-4 rounded border-hairline/80 text-frost-500 focus:outline-none focus:ring-2 focus:ring-frost-400/50"
        />
        <span>
          {t("profile.remindersLabel")}
          <span className="block text-xs text-ink-400">{t("profile.remindersHint")}</span>
        </span>
      </label>
      {error && <p className={`mt-3 ${errorText}`}>{error}</p>}
    </GlassCard>
  );
}

function PasswordCard() {
  const { changePassword } = useAuth();
  const { t } = useLanguage();
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
      setError(t("profile.pwWeak"));
      return;
    }
    // Checked here rather than server-side: the confirmation field exists to
    // catch a typo in this form, and never leaves it.
    if (newPassword !== confirm) {
      setError(t("profile.pwMismatch"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      toast.success(t("profile.passwordChanged"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>{t("profile.password")}</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className={labelClass}>
          {t("profile.currentPassword")}
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
          {t("profile.newPassword")}
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
          {t("profile.confirmPassword")}
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
          {submitting ? t("profile.changingPassword") : t("profile.changePassword")}
        </button>
      </form>
    </GlassCard>
  );
}

function LanguageCard() {
  const { lang, setLang, t } = useLanguage();

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>{t("profile.language")}</h2>
      <p className="mt-3 text-sm text-ink-700">{t("profile.languageNote")}</p>
      <div
        role="radiogroup"
        aria-label={t("profile.language")}
        className="mt-3 flex gap-0.5 rounded-lg border border-hairline/70 bg-surface/40 p-0.5"
      >
        {LANGUAGES.map((code) => {
          const active = lang === code;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setLang(code)}
              className={`flex flex-1 items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-frost-400/60 ${
                active
                  ? "bg-gradient-to-r from-frost-500/90 to-aqua-400/80 text-white shadow-sm"
                  : "text-ink-400 hover:bg-surface/70 hover:text-ink-700"
              }`}
            >
              {LANGUAGE_LABEL[code]}
            </button>
          );
        })}
      </div>
      {lang === "MY" && (
        <p className="mt-3 text-xs text-ink-400">{t("profile.languageNeedsReview")}</p>
      )}
    </GlassCard>
  );
}

function PrivacyCard({ user }) {
  const { t } = useLanguage();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handleDownload() {
    setBusy(true);
    try {
      const bundle = { exportedAt: new Date().toISOString(), account: user };
      if (user.role === "PATIENT" && user.patientId) {
        bundle.patient = await getPatient(user.patientId);
        bundle.appointments = (await listAppointments()).filter((a) => a.patientId === user.patientId);
        bundle.invoices = (await listInvoices()).filter((i) => i.patientId === user.patientId);
      } else {
        bundle.leaveRequests = (
          await listLeaveRequests({ userId: user.id, role: user.role })
        ).filter((r) => r.userId === user.id);
      }

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oncocare-${user.email}-${toDateInputValue()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(t("profile.dataDownloaded"));
    } catch {
      toast.error(t("profile.downloadFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>{t("profile.privacy")}</h2>
      <p className="mt-3 text-sm text-ink-700">{t("profile.privacySummary")}</p>
      <button type="button" onClick={handleDownload} disabled={busy} className={`mt-4 ${btnGhost}`}>
        {busy ? t("profile.preparingDownload") : t("profile.downloadData")}
      </button>
      <p className="mt-2 text-xs text-ink-400">{t("profile.downloadNote")}</p>
    </GlassCard>
  );
}

function SecurityCard({ user }) {
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>{t("profile.session")}</h2>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-400">{t("profile.lastSignedIn")}</dt>
          <dd className="text-ink-700">
            {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : t("common.dash")}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-ink-400">{t("profile.sessionNote")}</p>
      <button type="button" onClick={logout} className={`mt-4 ${btnGhost}`}>
        {t("layout.logOut")}
      </button>
    </GlassCard>
  );
}

function AppearanceCard() {
  const { t } = useLanguage();

  return (
    <GlassCard className="p-6">
      <h2 className={sectionLabel}>{t("profile.appearance")}</h2>
      <p className="mt-3 text-sm text-ink-700">{t("profile.appearanceNote")}</p>
      <ThemeToggle />
    </GlassCard>
  );
}
