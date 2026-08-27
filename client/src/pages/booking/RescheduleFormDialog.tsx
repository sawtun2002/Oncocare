import { useState, type FormEvent } from "react";
import { Modal } from "../../components/Modal";
import { btnGhost, btnPrimary } from "../../lib/ui";
import { formatDateTime } from "../../lib/format";
import { SlotPicker } from "./SlotPicker";
import type { Appointment, User } from "../../types";

interface Props {
  appointment: Appointment;
  doctors: User[];
  onClose: () => void;
  onSubmit: (input: { doctorId: number; scheduledAt: string }) => Promise<void>;
}

export function RescheduleFormDialog({ appointment, doctors, onClose, onSubmit }: Props) {
  const [doctorId, setDoctorId] = useState<number | "">(appointment.doctorId);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
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

        {error && <p className="text-sm text-rose-600">{error}</p>}

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
