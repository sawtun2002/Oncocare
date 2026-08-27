/**
 * Shared class-name constants for the glass theme.
 *
 * These were previously copy-pasted per file (`inputClass` lived in both
 * PatientFormDialog and AppointmentFormDialog). Import from here instead so the
 * theme stays consistent and is changed in one place.
 */

export const inputClass =
  "mt-1 w-full rounded-lg border border-white/80 bg-white/85 px-3 py-2 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-frost-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-frost-400/50 disabled:cursor-not-allowed disabled:bg-ice-100 disabled:text-ink-400";

export const labelClass = "block text-sm font-medium text-ink-700";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-frost-500 to-aqua-400 px-4 py-2 text-sm font-medium text-white shadow-md shadow-frost-500/25 transition hover:from-frost-600 hover:to-frost-400 focus:outline-none focus:ring-2 focus:ring-frost-400/60 disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/80 bg-white/70 px-4 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-frost-400/50 disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50";

/** Data tables use the solid surface -- dense text must not sit on a live blur. */
export const tableWrap = "glass-panel-solid overflow-hidden";

export const tableHead =
  "border-b border-ice-200 bg-ice-100/70 text-xs font-semibold uppercase tracking-wide text-ink-400";

export const tableRow = "border-t border-ice-200/70 transition-colors hover:bg-frost-300/10";

/** Small uppercase section label, e.g. "FEATURED CASE STUDIES" in the reference. */
export const sectionLabel =
  "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400";

export const pageTitle = "chrome-text text-3xl font-bold tracking-tight";
