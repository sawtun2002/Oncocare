import { useRef, useState } from "react";
import { Modal } from "./Modal";
import { useLanguage } from "../context/LanguageContext";
import { btnDanger, btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../lib/ui";

const OTHER = "Other";

/**
 * A confirmation that also captures *why*. Used where a reason is mandatory --
 * declining a request, or cancelling / rescheduling someone else's appointment.
 * `presets` are one-click common reasons; picking "Other" (or leaving presets
 * empty) makes the note field required. The composed string ("preset — note")
 * is handed to `onSubmit`.
 *
 * Owns its own submitting/error state and closes itself through the Modal ref,
 * like `ConfirmDialog`.
 *
 * Props: title, intro, presets (string[]), confirmLabel, danger, onClose,
 * onSubmit(reason).
 */
export function ReasonDialog({
  title,
  intro,
  presets = [],
  confirmLabel,
  danger = false,
  onClose,
  onSubmit,
}) {
  const { t } = useLanguage();
  const [preset, setPreset] = useState(presets.length ? "" : OTHER);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const noteRequired = preset === OTHER || presets.length === 0;
  const composed =
    preset && preset !== OTHER ? (note.trim() ? `${preset} — ${note.trim()}` : preset) : note.trim();

  async function handleConfirm() {
    if (presets.length && !preset) {
      setError(t("reason.chooseReason"));
      return;
    }
    if (noteRequired && !note.trim()) {
      setError(t("reason.addNote"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(composed);
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose} ref={modalRef}>
      {intro && <p className="text-sm text-ink-700">{intro}</p>}

      {presets.length > 0 && (
        <label className={`${labelClass} mt-4`}>
          {t("reason.label")}
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              {t("reason.selectPlaceholder")}
            </option>
            {presets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value={OTHER}>{t("reason.other")}</option>
          </select>
        </label>
      )}

      <label className={`${labelClass} mt-4`}>
        {noteRequired ? t("reason.note") : t("reason.noteOptional")}
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("resched.reasonPlaceholder")}
          className={inputClass}
        />
      </label>

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
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className={danger ? btnDanger : btnPrimary}
        >
          {submitting ? t("common.working") : confirmLabel ?? t("common.confirm")}
        </button>
      </div>
    </Modal>
  );
}
