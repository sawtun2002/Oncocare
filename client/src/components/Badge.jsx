import { pillBase, TONE } from "../lib/ui";

// Translucent status pills. Colour still carries the meaning -- the glass theme
// only changes the surface, not the semantics. The tone classes themselves live
// in lib/ui.js so the doctor-directory pill can reuse them.
const COLOR_MAP = {
  REQUESTED: TONE.warning,
  SCHEDULED: TONE.info,
  COMPLETED: TONE.positive,
  CANCELLED: TONE.muted,
  DECLINED: TONE.negative,
  NO_SHOW: TONE.negative,
  UNPAID: TONE.negative,
  PARTIAL: TONE.warning,
  PAID: TONE.positive,
  ACTIVE: TONE.positive,
  INACTIVE: TONE.muted,
};

export function Badge({ status }) {
  return (
    <span className={`${pillBase} ${COLOR_MAP[status] ?? TONE.muted}`}>{status.replace("_", " ")}</span>
  );
}
