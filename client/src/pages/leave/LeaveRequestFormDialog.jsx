import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { toDateInputValue } from "../../lib/format";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Annual leave" },
  { value: "SICK", label: "Sick leave" },
  { value: "TRAINING", label: "Training" },
  { value: "OTHER", label: "Other" },
];

/**
 * File a leave request for the signed-in account. Takes no user id -- the
 * account comes from the session, same as `/profile`. Props: onClose,
 * onSubmit({ type, startDate, endDate, reason }).
 */
export function LeaveRequestFormDialog({ onClose, onSubmit }) {
  const today = toDateInputValue();
  const [type, setType] = useState("ANNUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (endDate < startDate) {
      setError("The end date can't be before the start date.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ type, startDate, endDate, reason: reason.trim() });
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Request leave" onClose={onClose} ref={modalRef}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          Type
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            {LEAVE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            First day
            <input
              type="date"
              required
              min={today}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && endDate < e.target.value) setEndDate(e.target.value);
              }}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            Last day
            <input
              type="date"
              required
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <label className={labelClass}>
          Reason
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Shared with the administrator who reviews this"
            className={inputClass}
          />
        </label>

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? "Sending…" : "Submit request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
