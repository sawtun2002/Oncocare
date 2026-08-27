import { useState, type FormEvent } from "react";
import { Modal } from "../../components/Modal";
import { SLOT_MINUTES, type AppointmentInput } from "../../api/appointments";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";
import { formatDateTime } from "../../lib/format";
import { SlotPicker } from "../booking/SlotPicker";
import type { Patient, User } from "../../types";

interface Props {
  patients: Patient[];
  doctors: User[];
  onClose: () => void;
  onSubmit: (input: AppointmentInput) => Promise<void>;
}

export function AppointmentFormDialog({ patients, doctors, onClose, onSubmit }: Props) {
  const [patientId, setPatientId] = useState<number | "">(patients[0]?.id ?? "");
  const [doctorId, setDoctorId] = useState<number | "">(doctors[0]?.id ?? "");
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!patientId || !doctorId || !selectedStart) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        scheduledAt: selectedStart,
        durationMinutes: SLOT_MINUTES,
        reason,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSelectedStart(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Book appointment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          Patient
          <select
            required
            value={patientId}
            onChange={(e) => setPatientId(Number(e.target.value))}
            className={inputClass}
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <SlotPicker
          doctors={doctors}
          doctorId={doctorId}
          onDoctorChange={setDoctorId}
          selectedStart={selectedStart}
          onSelectStart={setSelectedStart}
        />

        <label className={labelClass}>
          Reason
          <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} />
        </label>

        {selectedStart && (
          <p className="rounded-lg bg-frost-300/20 px-3 py-2 text-sm text-ink-700">
            Booking <span className="font-medium text-ink-900">{formatDateTime(selectedStart)}</span>
          </p>
        )}

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={submitting || !selectedStart} className={btnPrimary}>
            {submitting ? "Booking…" : "Book"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
