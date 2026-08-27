import { useState } from "react";
import { Modal } from "../../components/Modal";
import { btnGhost, btnPrimary, errorText } from "../../lib/ui";
import { formatDateTime } from "../../lib/format";
import { SlotPicker } from "./SlotPicker";

export function RescheduleFormDialog({ appointment, doctors, onClose, onSubmit }) {
  const [doctorId, setDoctorId] = useState(appointment.doctorId);
  const [selectedStart, setSelectedStart] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!doctorId || !selectedStart) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ doctorId: Number(doctorId), scheduledAt: selectedStart });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Reschedule booking" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-ink-400">
          Currently {formatDateTime(appointment.scheduledAt)}. Pick a new time below.
        </p>

        <SlotPicker
          doctors={doctors}
          doctorId={doctorId}
          onDoctorChange={setDoctorId}
          selectedStart={selectedStart}
          onSelectStart={setSelectedStart}
        />

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={submitting || !selectedStart} className={btnPrimary}>
            {submitting ? "Saving…" : "Move booking"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
