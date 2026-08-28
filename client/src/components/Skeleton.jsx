/**
 * Loading placeholders.
 *
 * These replaced the plain "Loading…" line that every page used to render. The
 * point is not decoration: the mock API's `delay()` is deliberately slow enough
 * to see, and a placeholder in the shape of the thing being fetched keeps the
 * layout from jumping when the data lands.
 *
 * A skeleton is `aria-hidden` and paired with one screen-reader "Loading…" --
 * a dozen announced grey bars is worse than no announcement at all.
 */

import { useLanguage } from "../context/LanguageContext";

/** Matches `tableHead` in lib/ui.js, minus the text styling nothing renders here. */
const SKELETON_HEAD = "border-b border-ice-200 bg-ice-100/70";

/** One bar. Give it a height and width through `className`. */
export function Skeleton({ className = "" }) {
  return (
    <span aria-hidden="true" className={`block animate-pulse rounded-md bg-ice-200/90 ${className}`} />
  );
}

/**
 * Stand-in for a data table, header band included, so the panel keeps its
 * height and the column rhythm survives the swap. Sits inside the same
 * `tableWrap` the real table does.
 */
export function TableSkeleton({ columns = 4, rows = 5 }) {
  const { t } = useLanguage();
  return (
    <div role="status">
      <span className="sr-only">{t("common.loading")}</span>
      <div className={`${SKELETON_HEAD} flex gap-4 px-4 py-2.5`} aria-hidden="true">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-4 border-t border-ice-200/70 px-4 py-3.5">
          {Array.from({ length: columns }, (_, col) => (
            // The first column is a name in every table here, so it gets a
            // fixed width; the rest share the remaining space as they do live.
            <Skeleton key={col} className={col === 0 ? "h-3.5 w-36" : "h-3.5 flex-1"} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Stand-in for a `GlassCard` -- the doctor grid, a booking row. */
export function CardSkeleton({ lines = 2, className = "" }) {
  const { t } = useLanguage();
  return (
    <div role="status" className={`glass-panel p-5 ${className}`}>
      <span className="sr-only">{t("common.loading")}</span>
      <Skeleton className="h-4 w-2/5" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`mt-3 h-3 ${i % 2 === 0 ? "w-4/5" : "w-3/5"}`} />
      ))}
    </div>
  );
}

