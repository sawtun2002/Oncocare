import { GlassCard } from "./GlassCard";
import { Skeleton } from "./Skeleton";

/**
 * Single figure with a caption. Previously duplicated verbatim in
 * DashboardPage and BillingPage.
 *
 * Props: label, value, icon (optional leading glyph, shown above the value),
 * loading (show a placeholder bar in place of the figure). Prefer `loading`
 * over passing an em dash while a query is in flight -- an em dash is how these
 * cards say "none", and a pending total is not a total of nothing.
 */
export function StatCard({ label, value, icon, loading = false }) {
  return (
    <GlassCard className="p-5">
      {icon && <div className="mb-3 text-frost-500">{icon}</div>}
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className="text-2xl font-semibold text-ink-900">{value}</div>
      )}
      <div className="mt-1 text-sm text-ink-400">{label}</div>
    </GlassCard>
  );
}
