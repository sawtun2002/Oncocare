import { useRef, useState } from "react";
import { invoiceTotal } from "../../api/billing";
import { Badge } from "../../components/Badge";
import { InvoiceCard } from "../../components/InvoiceCard";
import { Modal } from "../../components/Modal";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency, formatDateTime } from "../../lib/format";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass, sectionLabel } from "../../lib/ui";

const STATUS_OPTIONS = ["UNPAID", "PARTIAL", "PAID"];

const EVENT_VERB = {
  ISSUED: "billHist.issued",
  MARKED_PAID: "billHist.markedPaid",
  MARKED_PARTIAL: "billHist.markedPartial",
  MARKED_UNPAID: "billHist.markedUnpaid",
};

const ROLE_WORD = {
  ADMIN: "role.ADMIN",
  DOCTOR: "role.DOCTOR",
  NURSE: "role.NURSE",
  RECEPTIONIST: "role.RECEPTIONIST",
  PATIENT: "role.PATIENT",
};

/**
 * The staff-facing receipt for one invoice, opened from a patient name on the
 * Billing table. Wraps the shared `InvoiceCard` (so the printed/PDF receipt is
 * identical to what the patient sees), then adds a status control and the
 * who-did-what history. Marking PAID asks for confirmation first -- it puts your
 * name on "received this money".
 *
 * Props: invoice, patientName, staffName(id) -> string, onClose,
 * onStatusChange(status, note?) -> Promise<void>.
 */
export function InvoiceDetailDialog({ invoice, patientName, staffName, onClose, onStatusChange }) {
  const { t } = useLanguage();
  const [confirmingPaid, setConfirmingPaid] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const total = invoiceTotal(invoice);
  const paidEvent = [...invoice.events].reverse().find((e) => e.type === "MARKED_PAID");
  const receivedBy =
    invoice.status === "PAID" && paidEvent ? staffName(paidEvent.byUserId) : null;

  async function applyStatus(status, statusNote) {
    setError(null);
    setSubmitting(true);
    try {
      await onStatusChange(status, statusNote);
      setConfirmingPaid(false);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  function handlePick(next) {
    if (next === invoice.status) return;
    if (next === "PAID") setConfirmingPaid(true);
    else applyStatus(next);
  }

  return (
    <Modal title={t("billDetail.title")} onClose={onClose} ref={modalRef}>
      <InvoiceCard invoice={invoice} patientName={patientName} />

      <div className="mt-6">
        <h3 className={sectionLabel}>{t("billDetail.status")}</h3>
        {confirmingPaid ? (
          <div className="mt-3 rounded-lg border border-amber-300/50 bg-amber-50/60 p-3 dark:border-amber-400/25 dark:bg-amber-400/10">
            <p className="text-sm text-ink-700">
              {t("billDetail.confirmPaid", {
                amount: formatCurrency(total),
                patient: patientName ?? t("appt.colPatient"),
              })}
            </p>
            <label className={`${labelClass} mt-3`}>
              {t("billDetail.noteOptional")}
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("billDetail.notePlaceholder")}
                className={inputClass}
              />
            </label>
            {error && <p className={`mt-2 ${errorText}`}>{error}</p>}
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmingPaid(false);
                  setNote("");
                  setError(null);
                }}
                disabled={submitting}
                className={btnGhost}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => applyStatus("PAID", note)}
                disabled={submitting}
                className={btnPrimary}
              >
                {submitting ? t("common.working") : t("billDetail.confirmReceived")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge status={invoice.status} />
            <select
              value={invoice.status}
              onChange={(e) => handlePick(e.target.value)}
              disabled={submitting}
              className={`${inputClass} mt-0 w-auto py-1 text-sm`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
            {receivedBy && (
              <span className="text-sm text-ink-400">
                {t("billDetail.receivedBy", { name: receivedBy })}
              </span>
            )}
          </div>
        )}
        {error && !confirmingPaid && <p className={`mt-2 ${errorText}`}>{error}</p>}
      </div>

      <div className="mt-6">
        <h3 className={sectionLabel}>{t("billDetail.history")}</h3>
        <ol className="mt-3 space-y-2 text-sm">
          {invoice.events.map((ev, i) => (
            <li key={`${ev.at}-${i}`} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium text-ink-900">{t(EVENT_VERB[ev.type] ?? "common.dash")}</span>
              <span className="text-ink-400">
                {t("billDetail.byWhom", {
                  name: staffName(ev.byUserId),
                  role: t(ROLE_WORD[ev.byRole] ?? "common.dash"),
                })}
              </span>
              <span className="ml-auto text-xs text-ink-400">{formatDateTime(ev.at)}</span>
              {ev.note && <p className="w-full text-xs text-ink-400">“{ev.note}”</p>}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
          {t("common.close")}
        </button>
      </div>
    </Modal>
  );
}
