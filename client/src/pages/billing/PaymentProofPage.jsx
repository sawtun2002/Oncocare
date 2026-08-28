import { useRef, useState } from "react";
import { formatCurrency } from "../../lib/format";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;
const PAYMENT_QR_URL = import.meta.env.VITE_PAYMENT_QR_URL;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the receipt file."));
    reader.readAsDataURL(file);
  });
}

export function PaymentProofPage({ invoice, onCancel, onSubmit }) {
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
      setError("Please upload an image or PDF receipt.");
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setError("The receipt size must be under 3 MB.");
      return;
    }

    try {
      setError(null);
      setReceiptDataUrl(await readAsDataUrl(file));
      setReceiptName(file.name);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Could not read the receipt file.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > total) {
      setError(`Enter an amount between 0 and ${formatCurrency(total)}.`);
      return;
    }
    if (!note.trim()) {
      setError("Add the transaction note or reference number.");
      return;
    }
    if (!receiptDataUrl) {
      setError("Upload the payment receipt or screenshot.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ amount: numericAmount, note: note.trim(), receiptDataUrl });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit payment proof.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button type="button" onClick={onCancel} className={`${btnGhost} mb-6`}>
        Back to My Bills
      </button>
      <h1 className="text-3xl font-bold text-ink-900">Pay invoice #{invoice.id}</h1>
      <p className="mt-2 text-sm text-ink-400">Scan the clinic QR code, then submit your payment proof.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <section className="glass-panel p-6 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Clinic payment QR</h2>
          {PAYMENT_QR_URL ? (
            <img src={PAYMENT_QR_URL} alt="Clinic payment QR code" className="mx-auto mt-4 aspect-square w-56 rounded-xl bg-white object-contain p-3 shadow-sm" />
          ) : (
            <div className="mx-auto mt-4 flex aspect-square w-56 items-center justify-center rounded-xl border-2 border-dashed border-hairline bg-surface p-6 text-center text-xs text-ink-400">
              Configure VITE_PAYMENT_QR_URL to display the clinic payment QR code.
            </div>
          )}
          <p className="mt-4 text-sm text-ink-700">Amount due: <strong className="text-ink-900">{formatCurrency(total)}</strong></p>
        </section>

        <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-6">
          <label className={labelClass}>
            Amount paid
            <input type="number" min="0.01" max={total} step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Transaction note or reference
            <input required value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. MMQR transaction ID" className={inputClass} />
          </label>
          <label className={labelClass}>
            E-receipt or payment screenshot
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,application/pdf" required onChange={handleReceipt} className={inputClass} />
            <span className="mt-1 block text-xs text-ink-400">Image or PDF, up to 3 MB.</span>
          </label>
          {receiptName && <p className="text-xs text-emerald-600">Attached: {receiptName}</p>}
          {error && <p className={errorText}>{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className={btnGhost}>Cancel</button>
            <button type="submit" disabled={submitting} className={btnPrimary}>{submitting ? "Submitting…" : "Submit payment proof"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
