import { useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../lib/format";
import PaymentQR from "../../assets/images/payment-qr.jpg";

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;
const PAYMENT_QR_URL = import.meta.env.VITE_PAYMENT_QR_URL || PaymentQR;

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
  const toast = useToast();

  const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const [amount, setAmount] = useState(String(total));
  const [note, setNote] = useState("");
  const [receiptDataUrl, setReceiptDataUrl] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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

  function handleRemoveReceipt() {
    setReceiptDataUrl("");
    setReceiptName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: [file], value: "" } };
      handleReceipt(fakeEvent);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > total) {
      setError(`Enter a valid amount between 0 and ${formatCurrency(total)}.`);
      return;
    }
    if (!note.trim()) {
      setError("Please add a transaction note or reference number.");
      return;
    }
    if (!receiptDataUrl) {
      setError("Please upload a payment receipt or screenshot.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ amount: numericAmount, note: note.trim(), receiptDataUrl });
      toast.success("Payment proof submitted for review.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not submit payment proof.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-serenity-50 via-white to-serenity-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 text-sm font-semibold text-serenity-600 hover:text-serenity-800 mb-6 transition-colors duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Bills
          </button>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-serenity-900 tracking-tight">
            Pay Invoice #{invoice.id}
          </h1>
          <p className="mt-2 text-serenity-600">
            Complete your payment using the QR code below or your preferred payment method
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)] items-start">
          {/* QR Code Column */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-serenity-50 via-white to-serenity-100/50 border border-serenity-200/60 p-8 shadow-xl shadow-serenity-100/50">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-serenity-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col items-center h-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-serenity-500 to-serenity-700 shadow-lg shadow-serenity-500/30 mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-serenity-900">Scan QR to Pay</h3>
                <p className="text-sm text-serenity-600 mt-1">Use any banking app or wallet</p>
              </div>

              <div className="relative mb-6">
                {PAYMENT_QR_URL ? (
                  <div className="rounded-2xl bg-white p-4 shadow-xl shadow-serenity-200/50 border border-serenity-100">
                    <img
                      src={PAYMENT_QR_URL}
                      alt="Clinic payment QR code"
                      className="aspect-square w-56 rounded-xl object-contain"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex aspect-square w-56 items-center justify-center rounded-2xl border-2 border-dashed border-serenity-200 bg-white p-4 text-center text-sm text-serenity-500">
                    Configure VITE_PAYMENT_QR_URL to display QR code
                  </div>
                )}
              </div>

              <div className="w-full rounded-2xl bg-white/90 backdrop-blur-sm border border-serenity-200/60 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-serenity-500 font-medium">Total Amount Due</p>
                  <svg className="w-5 h-5 text-serenity-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-serenity-900 tracking-tight">
                  {formatCurrency(total)}
                </p>
                <div className="mt-3 h-2 bg-serenity-100 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-serenity-400 to-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-3xl border border-serenity-200 p-6 lg:p-8 shadow-lg shadow-serenity-100/50 space-y-6">
              <h2 className="text-xl font-bold text-serenity-900 mb-4">Payment Details</h2>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-serenity-900 mb-2">
                  Amount Paid
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-serenity-500 font-semibold">
                    $
                  </div>
                  <input
                    type="number"
                    min="0.01"
                    max={total}
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-24 py-3.5 rounded-2xl border border-serenity-200 bg-white text-base font-semibold text-serenity-900 focus:border-serenity-400 focus:ring-4 focus:ring-serenity-100 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(String(total))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all duration-300 cursor-pointer"
                  >
                    Pay Full
                  </button>
                </div>
              </div>

              {/* Transaction Note */}
              <div>
                <label className="block text-sm font-semibold text-serenity-900 mb-2">
                  Transaction Reference / Note
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-serenity-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <input
                    required
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Bank Ref, KBZPay ID, or Txn ID"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-serenity-200 bg-white text-sm text-serenity-900 placeholder-serenity-400 focus:border-serenity-400 focus:ring-4 focus:ring-serenity-100 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-semibold text-serenity-900 mb-2">
                  Receipt or Screenshot
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={handleReceipt}
                  className="hidden"
                  id="receipt-upload"
                />

                {!receiptName ? (
                  <label
                    htmlFor="receipt-upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${
                      isDragging
                        ? 'border-serenity-500 bg-serenity-50 scale-[1.02]'
                        : 'border-serenity-200 hover:border-serenity-400 hover:bg-serenity-50/50'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-serenity-100 to-serenity-200 flex items-center justify-center mb-2">
                      <svg className="h-8 w-8 text-serenity-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <span className="text-base font-semibold text-serenity-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-sm text-serenity-400">
                      PNG, JPG, or PDF • Maximum file size: 3 MB
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                        <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-emerald-900 truncate">{receiptName}</p>
                        <p className="text-sm text-emerald-600">File uploaded successfully</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveReceipt}
                      className="ml-3 shrink-0 text-sm font-bold text-rose-600 hover:text-rose-800 bg-white/80 hover:bg-white px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100/50 p-5">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <button 
                type="button" 
                onClick={onCancel} 
                className="px-8 py-3.5 rounded-2xl text-base font-semibold text-serenity-600 hover:text-serenity-800 hover:bg-serenity-50 transition-all duration-300 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-serenity-600 to-serenity-700 hover:from-serenity-700 hover:to-serenity-800 shadow-lg shadow-serenity-600/30 hover:shadow-xl hover:shadow-serenity-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Payment Proof
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}