import { useRef } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Modal } from "../../components/Modal";
import { formatDateTime } from "../../lib/format";
import { btnGhost } from "../../lib/ui";

const ROLE_LABEL = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
};

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
  const modalRef = useRef(null);

  return (
    <Modal title="Staff member" onClose={onClose} ref={modalRef}>
      <div className="flex items-center gap-4">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
        <div>
          <div className="text-lg font-semibold text-ink-900">{user.name}</div>
          <div className="text-sm text-ink-400">{ROLE_LABEL[user.role] ?? user.role}</div>
        </div>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <Row label="Email" value={user.email} />
        <Row label="Status" value={<Badge status={user.status ?? "ACTIVE"} />} />
        <Row label="NRC" value={user.nrc || "—"} />
        <Row label="Phone" value={user.phone || "—"} />
        <Row label="Address" value={user.address || "—"} />
        <Row label="Department" value={user.department || "—"} />
        <Row
          label="Last signed in"
          value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
        />
        <Row
          label="Appointment reminders"
          value={user.notifyAppointmentReminders ? "On" : "Off"}
        />
      </dl>

      <div className="mt-6 flex items-center justify-between gap-2">
        {user.role === "DOCTOR" ? (
          <Link
            to={`/doctors/${user.id}`}
            onClick={() => modalRef.current?.close()}
            className="text-sm font-medium text-frost-600 hover:underline"
          >
            View public profile →
          </Link>
        ) : (
          <span />
        )}
        <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
          Close
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
