import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { useLanguage } from "../../context/LanguageContext";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";
import { STAFF_ROLES } from "../../lib/roles";
import { isValidNrc } from "../../lib/validation";

const MIN_PASSWORD_LENGTH = 6;

// STAFF_ROLES already excludes PATIENT -- there is no way to reach that option
// from this dialog, which is the point: staff accounts are the only thing an
// admin can create here.
export function StaffUserFormDialog({ onClose, onSubmit }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(STAFF_ROLES[0]);
  const [nrc, setNrc] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const nrcError = nrc !== "" && !isValidNrc(nrc);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t("staffForm.pwTooShort", { n: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (!isValidNrc(nrc)) {
      setError(t("staffForm.nrcInvalid"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, email, password, role, nrc: nrc.trim(), address: address.trim() });
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={t("staffForm.title")} onClose={onClose} ref={modalRef}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          {t("staffForm.fullName")}
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>

        <label className={labelClass}>
          {t("staffForm.email")}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          {t("staffForm.tempPassword")}
          <input
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          {t("staffForm.role")}
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`role.${r}`)}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          {t("staffForm.nrc")}
          <input
            required
            value={nrc}
            onChange={(e) => setNrc(e.target.value)}
            placeholder={t("staffForm.nrcPlaceholder")}
            aria-invalid={nrcError}
            className={inputClass}
          />
          {nrcError && (
            <span className={`mt-1 block ${errorText}`}>{t("staffForm.nrcFormat")}</span>
          )}
        </label>

        <label className={labelClass}>
          {t("staffForm.address")} <span className="font-normal text-ink-400">{t("common.optional")}</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("staffForm.addressHint")}
            className={inputClass}
          />
        </label>

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? t("staffForm.submitting") : t("staffForm.submit")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
