import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { SLOT_MINUTES } from "../../api/appointments";
import { useLanguage } from "../../context/LanguageContext";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";
import { formatDateTime } from "../../lib/format";
import { SlotPicker } from "../booking/SlotPicker";

export function AppointmentFormDialog({ patients, doctors, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [selectedStart, setSelectedStart] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  async function handleSubmit(e) {
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
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
      setSelectedStart(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={t("apptForm.title")} onClose={onClose} ref={modalRef}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          {t("apptForm.patient")}
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
          {t("apptForm.reason")}
          <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} />
        </label>

        {selectedStart && (
          <p className="rounded-lg bg-frost-300/20 px-3 py-2 text-sm text-ink-700">
            {t("apptForm.bookingPrefix")}{" "}
            <span className="font-medium text-ink-900">{formatDateTime(selectedStart)}</span>
          </p>
        )}

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={submitting || !selectedStart} className={btnPrimary}>
            {submitting ? t("apptForm.submitting") : t("apptForm.submit")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
