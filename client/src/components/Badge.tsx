import { pillBase, TONE } from "../lib/ui";

// Translucent status pills. Colour still carries the meaning -- the glass theme
// only changes the surface, not the semantics. The tone classes themselves live
// in lib/ui.ts so the doctor-directory pill can reuse them.
const COLOR_MAP: Record<string, string> = {
  SCHEDULED: TONE.info,
  COMPLETED: TONE.positive,
  CANCELLED: TONE.muted,
  NO_SHOW: TONE.negative,
  UNPAID: TONE.negative,
  PARTIAL: TONE.warning,
  PAID: TONE.positive,
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={`${pillBase} ${COLOR_MAP[status] ?? TONE.muted}`}>{status.replace("_", " ")}</span>
  );
}
