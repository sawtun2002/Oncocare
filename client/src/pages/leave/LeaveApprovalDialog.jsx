import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { Skeleton } from "../../components/Skeleton";
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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Approve leave" onClose={onClose} ref={modalRef}>
      <p className="text-sm text-ink-700">
        {staffName}&rsquo;s leave for <span className="font-medium text-ink-900">{dateRange}</span>.
      </p>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        ) : conflicts.length === 0 ? (
          <p className="text-sm text-ink-400">No appointments clash with these dates.</p>
        ) : (
          <>
            <p className="text-sm font-medium text-ink-900">
              {conflicts.length} appointment{conflicts.length === 1 ? "" : "s"} fall on these days and
              will need rescheduling:
            </p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
              {conflicts.map((a) => (
                <li key={a.id} className="flex justify-between gap-3 text-ink-700">
                  <span>{patientName(a.patientId)}</span>
                  <span className="text-ink-400">{formatDateTime(a.scheduledAt)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-400">
              Approving won&rsquo;t cancel them &mdash; they&rsquo;ll appear under &ldquo;Affected by
              approved leave&rdquo; on the Bookings page for reception to move.
            </p>
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
          Back
        </button>
        <button type="button" onClick={handleConfirm} disabled={submitting || loading} className={btnPrimary}>
          {submitting ? "Approving…" : "Approve leave"}
        </button>
      </div>
    </Modal>
  );
}
