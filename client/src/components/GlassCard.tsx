import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Extra classes, e.g. padding or grid placement. */
  className?: string;
  /**
   * Use the near-opaque surface instead of the frosted one. Required wherever
   * dense text lives (tables, forms) -- see index.css.
   */
  solid?: boolean;
}

/**
 * The standard panel. Replaces the hand-repeated
 * `rounded-lg border border-slate-200 bg-white p-4` div that used to appear on
 * every page.
 */
export function GlassCard({ children, className = "", solid = false }: Props) {
  return <div className={`${solid ? "glass-panel-solid" : "glass-panel"} ${className}`}>{children}</div>;
}
