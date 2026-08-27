import type { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

interface Props {
  label: string;
  value: string | number;
  /** Optional leading glyph, shown above the value. */
  icon?: ReactNode;
}

/**
 * Single figure with a caption. Previously duplicated verbatim in
 * DashboardPage and BillingPage.
 */
export function StatCard({ label, value, icon }: Props) {
  return (
    <GlassCard className="p-5">
      {icon && <div className="mb-3 text-frost-500">{icon}</div>}
      <div className="text-2xl font-semibold text-ink-900">{value}</div>
      <div className="mt-1 text-sm text-ink-400">{label}</div>
    </GlassCard>
  );
}
