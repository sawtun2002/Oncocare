import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../context/LanguageContext";
import { backdropMotion, panelMotion } from "../lib/motion";

/**
 * Everything that can hold focus inside the panel. `:not([disabled])` matters
 * here: a form dialog disables its submit button while saving, and a trap that
 * still counted it would drop focus into a dead element mid-submit.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Overlay dialog. Props are `{ title, onClose, children }` as before, plus an
 * optional `ref`; the mechanics behind them are not as before:
 *
 * - It renders into `document.body` through a portal, so the fixed overlay can
 *   never be clipped or out-stacked by a transformed ancestor (the glass panels
 *   and the motion wrappers both create containing blocks).
 * - It is a real `role="dialog" aria-modal="true"` labelled by its own heading,
 *   it traps Tab, it closes on Escape and on a backdrop click, and it returns
 *   focus to whatever opened it on the way out.
 * - Closing is two-stage. `onClose` is the *unmount* callback owned by the page,
 *   and the Modal calls it only once the exit animation has finished. A dialog
 *   that wants to close itself -- Cancel, or a successful submit -- must
 *   therefore ask through the ref (`modalRef.current.close()`) rather than call
 *   its own `onClose` prop, which would unmount mid-animation. Every dialog in
 *   `pages/` does exactly that.
 */
export function Modal({ title, onClose, children, ref }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(true);
  const panelRef = useRef(null);
  const backdropDownRef = useRef(false);
  const titleId = useId();

  const requestClose = useCallback(() => setOpen(false), []);

  useImperativeHandle(ref, () => ({ close: requestClose }), [requestClose]);

  // Escape closes from anywhere, including from a focused input. Bound on the
  // document rather than the panel so it still fires if focus has escaped.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  // Freeze the page behind the dialog, and hand focus back where it came from
  // when we leave -- otherwise closing a row's Edit dialog dumps focus at the
  // top of the document and keyboard users lose their place in the table.
  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  // Move focus in on open. The close button is skipped when there is anything
  // else to land on: a form dialog should open on its first field, not on the
  // control that throws the form away.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = [...panel.querySelectorAll(FOCUSABLE)];
    const target =
      focusable.find((node) => !node.hasAttribute("data-modal-close")) ?? focusable[0] ?? panel;
    target.focus();
  }, []);

  // Tab trap. Only the two edges need intercepting; everything between them is
  // the browser's own tab order, which is the behaviour people expect.
  function handlePanelKeyDown(event) {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;

    // A disabled or hidden control has no layout box, and tabbing to it would
    // look like focus vanishing.
    const focusable = [...panel.querySelectorAll(FOCUSABLE)].filter(
      (node) => node.offsetWidth > 0 || node.offsetHeight > 0
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Backdrop dismissal, in two halves: a click only counts if the press *began*
  // on the backdrop too. Without that, selecting text in a field and releasing
  // the mouse outside the panel would throw the form away.
  function handleBackdropMouseDown(event) {
    backdropDownRef.current = event.target === event.currentTarget;
  }

  function handleBackdropClick(event) {
    if (backdropDownRef.current && event.target === event.currentTarget) requestClose();
    backdropDownRef.current = false;
  }

  return createPortal(
    <AnimatePresence onExitComplete={onClose}>
      {open && (
        <motion.div
          variants={backdropMotion}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onMouseDown={handleBackdropMouseDown}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/25 px-4 backdrop-blur-sm"
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
            variants={panelMotion}
            className="glass-panel max-h-[90vh] w-full max-w-lg overflow-y-auto bg-surface/90 p-6 shadow-xl focus:outline-none"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id={titleId} className="text-lg font-semibold text-ink-900">
                {title}
              </h2>
              <button
                type="button"
                data-modal-close
                onClick={requestClose}
                className="rounded-full p-1 text-ink-400 transition hover:bg-surface/70 hover:text-ink-700 focus:outline-none focus:ring-2 focus:ring-frost-400/50 cursor-pointer"
                aria-label={t("common.close")}
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
