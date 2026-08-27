import { useState } from "react";
import { Modal } from "./Modal";
import { btnDanger, btnGhost, btnPrimary, errorText } from "../lib/ui";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Style the confirm button as destructive (cancelling a booking, deleting). */
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * Yes/no confirmation for an action that cannot be undone from the UI.
 * Owns its own submitting/error state and closes itself on success, like the
 * form dialogs.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onClose,
  onConfirm,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-ink-700">{message}</p>
      {error && <p className={`mt-3 ${errorText}`}>{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={btnGhost} disabled={submitting}>
          Keep it
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
