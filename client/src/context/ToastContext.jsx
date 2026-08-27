import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Toaster } from "../components/Toaster";

const ToastContext = createContext(undefined);

/** Monotonic, module-level: ids must not repeat even across provider remounts. */
let nextToastId = 0;

/**
 * App-wide transient confirmations.
 *
 * The rule of thumb this exists to serve: a mutation that closes its dialog on
 * success has nowhere left to say it worked, so it says so here. Failures that
 * happen *inside* a form still belong inline next to the form -- see the
 * `errorText` handling in the dialogs -- and are toasted only when the action
 * had no form to fail in, such as a status change made straight from a table
 * row.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // Identity-stable, so pages can safely list `toast` in a hook's deps.
  const toast = useMemo(() => {
    function push(tone, message) {
      const id = (nextToastId += 1);
      setToasts((current) => [...current, { id, tone, message }]);
      return id;
    }
    return {
      success: (message) => push("positive", message),
      error: (message) => push("negative", message),
      info: (message) => push("info", message),
    };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
