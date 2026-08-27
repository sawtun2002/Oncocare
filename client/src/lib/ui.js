/**
 * Shared class-name constants for the glass theme.
 *
 * These were previously copy-pasted per file (`inputClass` lived in both
 * PatientFormDialog and AppointmentFormDialog). Import from here instead so the
 * theme stays consistent and is changed in one place.
 *
 * Surfaces use the `surface`/`hairline` tokens rather than literal white: on the
 * dark ground "white at 70%" is a pale haze, while "surface at 70%" is correct
 * in both themes (see index.css). `text-white` is the deliberate exception --
 * it sits on the frost/aqua accent gradient, which is fixed in both themes.
 */

export const inputClass =
  "mt-1 w-full rounded-lg border border-hairline/80 bg-surface/85 px-3 py-2 text-sm text-ink-900 shadow-sm placeholder:text-ink-400 focus:border-frost-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-frost-400/50 disabled:cursor-not-allowed disabled:bg-ice-100 disabled:text-ink-400";

export const labelClass = "block text-sm font-medium text-ink-700";

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-frost-500 to-aqua-400 px-4 py-2 text-sm font-medium text-white shadow-md shadow-frost-500/25 transition hover:from-frost-600 hover:to-frost-400 focus:outline-none focus:ring-2 focus:ring-frost-400/60 disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline/80 bg-surface/70 px-4 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-frost-400/50 disabled:cursor-not-allowed disabled:opacity-50";

export const btnDanger =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300 dark:hover:bg-rose-400/20 dark:focus:ring-rose-400/40";

/**
 * Inline form and query error text. Was hand-written as `text-sm text-rose-600`
 * in eight separate files; rose-600 does not read against the dark ground, so
 * the dark variant belongs in one place rather than eight.
 */
export const errorText = "text-sm text-rose-600 dark:text-rose-400";

/**
 * Destructive inline action -- a table row's Cancel/Delete link, as opposed to
 * `btnDanger`'s bordered button. Colour only: these appear at both text-xs (in
 * tables) and text-sm, so sizing stays at the call site.
 */
export const dangerAction =
  "text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300/60 dark:text-rose-400 dark:hover:bg-rose-400/15";

/**
 * Data tables use the solid surface -- dense text must not sit on a live blur.
 * The panel, not the page, is what scrolls sideways on a narrow screen: the
 * horizontal overflow lives here and the minimum width lives on `tableBase`.
 */
export const tableWrap = "glass-panel-solid overflow-x-auto";

/**
 * The `<table>` inside a `tableWrap`. The minimum width is the point of it --
 * without one, a five-column clinical table on a phone squeezes every column to
 * a couple of characters instead of scrolling.
 */
export const tableBase = "w-full min-w-[36rem] text-left text-sm";

export const tableHead =
  "border-b border-ice-200 bg-ice-100/70 text-xs font-semibold uppercase tracking-wide text-ink-400";

export const tableRow = "border-t border-ice-200/70 transition-colors hover:bg-frost-300/10";

/* ---------------------------------------------------------------------------
   Status pills. One source for both the appointment/invoice `Badge` and the
   doctor-directory "accepting new patients" pill, which used to hand-roll the
   same emerald classes independently.

   These are the one place `dark:` variants are unavoidable rather than a token
   swap: `bg-emerald-100` is a pale wash that disappears against navy, so dark
   inverts the treatment -- a low-alpha fill of a *brighter* stop, with light
   text. `muted` is the exception; it is built from ice-/ink- tokens, which
   already follow the theme on their own.
--------------------------------------------------------------------------- */
export const pillBase =
  "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export const TONE = {
  info: "bg-frost-300/35 text-frost-700 ring-frost-400/40 dark:bg-frost-400/20 dark:text-frost-300 dark:ring-frost-400/35",
  positive:
    "bg-emerald-100/70 text-emerald-800 ring-emerald-300/50 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30",
  negative:
    "bg-rose-100/70 text-rose-800 ring-rose-300/50 dark:bg-rose-400/15 dark:text-rose-300 dark:ring-rose-400/30",
  warning:
    "bg-amber-100/70 text-amber-800 ring-amber-300/50 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/30",
  muted: "bg-ice-200/80 text-ink-400 ring-ice-300/60",
};

/** Small uppercase section label, e.g. "FEATURED CASE STUDIES" in the reference. */
export const sectionLabel =
  "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400";

export const pageTitle = "chrome-text text-3xl font-bold tracking-tight";
