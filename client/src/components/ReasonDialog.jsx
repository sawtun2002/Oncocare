import { useRef, useState } from "react";
import { Modal } from "./Modal";
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
  confirmLabel = "Confirm",
  danger = false,
  onClose,
  onSubmit,
}) {
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
      setError("Choose a reason.");
      return;
    }
    if (noteRequired && !note.trim()) {
      setError("Add a short note.");
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
          Reason
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select a reason…
            </option>
            {presets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value={OTHER}>{OTHER}</option>
          </select>
        </label>
      )}

      <label className={`${labelClass} mt-4`}>
        {noteRequired ? "Note" : "Note (optional)"}
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Shared with the other party"
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
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className={danger ? btnDanger : btnPrimary}
        >
          {submitting ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
