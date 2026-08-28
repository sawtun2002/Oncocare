import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { useLanguage } from "../../context/LanguageContext";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";

const EMPTY_ITEM = { description: "", quantity: 1, unitPrice: 0 };

export function InvoiceFormDialog({ patients, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  function updateItem(index, patch) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId) return;
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ patientId: Number(patientId), items: items.filter((i) => i.description.trim()) });
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={t("bill.newInvoice")} onClose={onClose} ref={modalRef}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          {t("invForm.patient")}
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

        <div>
          <div className="flex items-center justify-between">
            <span className={labelClass}>{t("invForm.lineItems")}</span>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
              className="text-xs font-medium text-frost-600 hover:underline"
            >
              {t("invForm.addItem")}
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  required
                  placeholder={t("invForm.description")}
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  className={`${inputClass} mt-0 min-w-0 flex-1`}
                />
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                  className={`${inputClass} mt-0 w-16`}
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) })}
                  className={`${inputClass} mt-0 w-24`}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                    className="text-ink-400 transition hover:text-rose-500 dark:hover:text-rose-400"
                    aria-label={t("invForm.removeItem")}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-right text-sm font-medium text-ink-900">
            {t("invForm.total", { amount: total.toFixed(2) })}
          </div>
        </div>

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? t("invForm.submitting") : t("invForm.submit")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
