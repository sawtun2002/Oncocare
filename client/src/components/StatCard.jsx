import { GlassCard } from "./GlassCard";

/**
 * Single figure with a caption. Previously duplicated verbatim in
 * DashboardPage and BillingPage.
 *
 * Props: label, value, icon (optional leading glyph, shown above the value).
 */
export function StatCard({ label, value, icon }) {
  return (
    <GlassCard className="p-5">
      {icon && <div className="mb-3 text-frost-500">{icon}</div>}
      <div className="text-2xl font-semibold text-ink-900">{value}</div>
      <div className="mt-1 text-sm text-ink-400">{label}</div>
    </GlassCard>
  );
}
