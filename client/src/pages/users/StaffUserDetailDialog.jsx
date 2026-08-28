import { useRef } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Modal } from "../../components/Modal";
import { useLanguage } from "../../context/LanguageContext";
import { formatDateTime } from "../../lib/format";
import { btnGhost } from "../../lib/ui";

/**
 * Read-only staff record, opened from the name on the Staff accounts table.
 * Shows what `listUsers()` already returns -- no fetch. Editing an account
 * belongs to that account's own `/profile`; deactivation stays on the table
 * row, so this dialog has no actions beyond a link to a doctor's public
 * profile.
 *
 * Props: user (a staff User), onClose.
 */
export function StaffUserDetailDialog({ user, onClose }) {
  const { t } = useLanguage();
  const modalRef = useRef(null);
  const dash = t("common.dash");

  return (
    <Modal title={t("staffDetail.title")} onClose={onClose} ref={modalRef}>
      <div className="flex items-center gap-4">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
        <div>
          <div className="text-lg font-semibold text-ink-900">{user.name}</div>
          <div className="text-sm text-ink-400">{t(`role.${user.role}`)}</div>
        </div>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <Row label={t("staffDetail.email")} value={user.email} />
        <Row label={t("staffDetail.status")} value={<Badge status={user.status ?? "ACTIVE"} />} />
        <Row label={t("staffDetail.nrc")} value={user.nrc || dash} />
        <Row label={t("staffDetail.phone")} value={user.phone || dash} />
        <Row label={t("staffDetail.address")} value={user.address || dash} />
        <Row label={t("staffDetail.department")} value={user.department || dash} />
        <Row
          label={t("staffDetail.lastSignedIn")}
          value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : t("common.never")}
        />
        <Row
          label={t("staffDetail.reminders")}
          value={user.notifyAppointmentReminders ? t("common.on") : t("common.off")}
        />
      </dl>

      <div className="mt-6 flex items-center justify-between gap-2">
        {user.role === "DOCTOR" ? (
          <Link
            to={`/doctors/${user.id}`}
            onClick={() => modalRef.current?.close()}
            className="text-sm font-medium text-frost-600 hover:underline"
          >
            {t("staffDetail.viewPublic")}
          </Link>
        ) : (
          <span />
        )}
        <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
          {t("common.close")}
        </button>
      </div>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-ink-400">{label}</dt>
      <dd className="text-right text-ink-900">{value}</dd>
    </div>
  );
}
