// Translucent status pills. Colour still carries the meaning -- the glass theme
// only changes the surface, not the semantics.
const COLOR_MAP: Record<string, string> = {
  SCHEDULED: "bg-frost-300/35 text-frost-700 ring-frost-400/40",
  COMPLETED: "bg-emerald-100/70 text-emerald-800 ring-emerald-300/50",
  CANCELLED: "bg-ice-200/80 text-ink-400 ring-ice-300/60",
  NO_SHOW: "bg-rose-100/70 text-rose-800 ring-rose-300/50",
  UNPAID: "bg-rose-100/70 text-rose-800 ring-rose-300/50",
  PARTIAL: "bg-amber-100/70 text-amber-800 ring-amber-300/50",
  PAID: "bg-emerald-100/70 text-emerald-800 ring-emerald-300/50",
};

export function Badge({ status }: { status: string }) {
  const classes = COLOR_MAP[status] ?? "bg-ice-200/80 text-ink-700 ring-ice-300/60";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
