import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { useLanguage } from "../../context/LanguageContext";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";
import { formatDateTime } from "../../lib/format";
import { SlotPicker } from "./SlotPicker";

/**
 * Props: appointment, doctors, reasonRequired (true when the caller is moving
 * someone else's booking -- staff rescheduling a patient), onClose,
 * onSubmit({ doctorId, scheduledAt, reason? }).
 */
export function RescheduleFormDialog({ appointment, doctors, reasonRequired = false, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [doctorId, setDoctorId] = useState(appointment.doctorId);
  const [selectedStart, setSelectedStart] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!doctorId || !selectedStart) return;
    if (reasonRequired && !reason.trim()) {
      setError(t("resched.reasonNeeded"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        doctorId: Number(doctorId),
        scheduledAt: selectedStart,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={t("resched.title")} onClose={onClose} ref={modalRef}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-ink-400">
          {t("resched.currently", { when: formatDateTime(appointment.scheduledAt) })}
        </p>

        <SlotPicker
          doctors={doctors}
          doctorId={doctorId}
          onDoctorChange={setDoctorId}
          selectedStart={selectedStart}
          onSelectStart={setSelectedStart}
        />

        <label className={labelClass}>
          {reasonRequired ? t("resched.reasonRequired") : t("resched.reasonOptional")}
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("resched.reasonPlaceholder")}
            className={inputClass}
          />
        </label>

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={submitting || !selectedStart} className={btnPrimary}>
            {submitting ? t("common.saving") : t("resched.submit")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
