/**
 * The standard panel. Replaces the hand-repeated
 * `rounded-lg border border-slate-200 bg-white p-4` div that used to appear on
 * every page.
 *
 * Props: children, className (extra classes, e.g. padding or grid placement),
 * solid (use the near-opaque surface instead of the frosted one -- required
 * wherever dense text lives: tables, forms -- see index.css).
 */
export function GlassCard({ children, className = "", solid = false }) {
  return <div className={`${solid ? "glass-panel-solid" : "glass-panel"} ${className}`}>{children}</div>;
}
