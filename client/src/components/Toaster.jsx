import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../context/LanguageContext";
import { toastMotion } from "../lib/motion";
import { TONE } from "../lib/ui";

/**
 * How long each tone stays up. Failures linger: a success is a confirmation of
 * something the reader just did and already expects, while an error is news,
 * and news needs time to be read.
 */
const DURATION_MS = { positive: 4000, info: 4000, negative: 7000 };

/**
 * The toast stack. Presentational only -- `ToastProvider` owns the list and
 * passes it down, in the same way pages own their queries and dialogs are
 * handed the data.
 *
 * Portalled to `document.body` and stacked above the Modal's z-50, so a toast
 * raised by a dialog's own mutation is still visible over it.
 */
export function Toaster({ toasts, onDismiss }) {
  return createPortal(
    <div
      // A permanently mounted live region: assistive tech announces children
      // added to an existing region, but may miss a region that appears with
      // its content already in place.
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center gap-2 p-4 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

function ToastItem({ toast, onDismiss }) {
  const { t } = useLanguage();
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), DURATION_MS[toast.tone]);
    return () => clearTimeout(timer);
  }, [toast.id, toast.tone, onDismiss]);

  return (
    <motion.div
      layout
      variants={toastMotion}
      initial="hidden"
      animate="visible"
      exit="exit"
      // `alert` interrupts, which is right for a failure and wrong for a
      // confirmation; the region's polite announcement covers the rest.
      role={toast.tone === "negative" ? "alert" : "status"}
      className="glass-panel-solid pointer-events-auto flex w-full max-w-sm items-start gap-3 px-4 py-3 shadow-lg"
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ring-4 ${TONE[toast.tone]}`} />
      <p className="flex-1 text-sm text-ink-700">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={t("common.dismiss")}
        className="-mr-1 rounded-full p-1 text-ink-400 transition hover:bg-surface/70 hover:text-ink-700 focus:outline-none focus:ring-2 focus:ring-frost-400/50"
      >
        ✕
      </button>
    </motion.div>
  );
}
