import { useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../lib/format";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";
import Payment_QR from "../../assets/images/payment-qr.jpg";

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the receipt file."));
    reader.readAsDataURL(file);
  });
}

export function PaymentProofPage({ invoice, onCancel, onSubmit }) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const [amount, setAmount] = useState(String(total));
  const [note, setNote] = useState("");
  const [receiptDataUrl, setReceiptDataUrl] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleReceipt(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError(t("pay.badFileType"));
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setError(t("pay.tooBig"));
      return;
    }

    try {
      setError(null);
      setReceiptDataUrl(await readAsDataUrl(file));
      setReceiptName(file.name);
    } catch {
      setError(t("pay.readError"));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > total) {
      setError(t("pay.badAmount", { max: formatCurrency(total) }));
      return;
    }
    if (!note.trim()) {
      setError(t("pay.noteRequired"));
      return;
    }
    if (!receiptDataUrl) {
      setError(t("pay.receiptRequired"));
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ amount: numericAmount, note: note.trim(), receiptDataUrl });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("pay.submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button type="button" onClick={onCancel} className={`${btnGhost} mb-6`}>
        {t("pay.back")}
      </button>
      <h1 className="text-3xl font-bold text-ink-900">{t("pay.title", { id: invoice.id })}</h1>
      <p className="mt-2 text-sm text-ink-400">{t("pay.subtitle")}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section className="glass-panel p-6 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">{t("pay.qrHeading")}</h2>
          <img
            src={Payment_QR}
            alt={t("pay.qrAlt")}
            className="mx-auto mt-4 aspect-square w-full object-contain shadow-sm"
          />
          <p className="mt-4 text-sm text-ink-700">
            {t("pay.amountDue")} <strong className="text-ink-900">{formatCurrency(total)}</strong>
          </p>
        </section>

        <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-6">
          <label className={labelClass}>
            {t("pay.amountPaid")}
            <input type="number" min="0.01" max={total} step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            {t("pay.txNote")}
            <input required value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("pay.txNotePlaceholder")} className={inputClass} />
          </label>
          <label className={labelClass}>
            {t("pay.receipt")}
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,application/pdf" required onChange={handleReceipt} className={inputClass} />
            <span className="mt-1 block text-xs text-ink-400">{t("pay.receiptHint")}</span>
          </label>
          {receiptName && <p className="text-xs text-emerald-600">{t("pay.attached", { name: receiptName })}</p>}
          {error && <p className={errorText}>{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className={btnGhost}>{t("common.cancel")}</button>
            <button type="submit" disabled={submitting} className={btnPrimary}>{submitting ? t("pay.submitting") : t("pay.submit")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}