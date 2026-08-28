import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { Skeleton } from "../../components/Skeleton";
import { useLanguage } from "../../context/LanguageContext";
import { formatDateTime } from "../../lib/format";
import { btnGhost, btnPrimary, errorText } from "../../lib/ui";

/**
 * Review-and-confirm for approving leave. The page fetches the clashing
 * appointments (dialogs don't fetch) and passes them in; this shows the admin
 * exactly what they're committing to before they approve. Approval is never
 * blocked (D4) -- the listed bookings go onto reception's "Affected by approved
 * leave" list afterward.
 *
 * Props: staffName, dateRange, conflicts (Appointment[]), loading,
 * patientName(id), onClose, onConfirm().
 */
export function LeaveApprovalDialog({
  staffName,
  dateRange,
  conflicts,
  loading,
  patientName,
  onClose,
  onConfirm,
}) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  async function handleConfirm() {
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm();
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={t("leaveApp.title")} onClose={onClose} ref={modalRef}>
      <p className="text-sm text-ink-700">
        {t("leaveApp.intro", { name: staffName, dates: dateRange })}
      </p>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        ) : conflicts.length === 0 ? (
          <p className="text-sm text-ink-400">{t("leaveApp.noClash")}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-ink-900">
              {t("leaveApp.willNeedResched", { count: conflicts.length })}
            </p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
              {conflicts.map((a) => (
                <li key={a.id} className="flex justify-between gap-3 text-ink-700">
                  <span>{patientName(a.patientId)}</span>
                  <span className="text-ink-400">{formatDateTime(a.scheduledAt)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-400">{t("leaveApp.wontCancel")}</p>
          </>
        )}
      </div>

      {error && <p className={`mt-3 ${errorText}`}>{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => modalRef.current?.close()}
          className={btnGhost}
          disabled={submitting}
        >
          {t("common.back")}
        </button>
        <button type="button" onClick={handleConfirm} disabled={submitting || loading} className={btnPrimary}>
          {submitting ? t("leaveApp.submitting") : t("leaveApp.confirm")}
        </button>
      </div>
    </Modal>
  );
}
