import type { ReactNode } from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/25 px-4 backdrop-blur-sm">
      <div className="glass-panel max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white/90 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-ink-400 transition hover:bg-white/70 hover:text-ink-700 focus:outline-none focus:ring-2 focus:ring-frost-400/50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
