import { useLanguage } from "../context/LanguageContext";
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
  PENDING: TONE.warning,
  APPROVED: TONE.positive,
  WITHDRAWN: TONE.muted,
};

export function Badge({ status }) {
  const { t } = useLanguage();
  // `status.<KEY>` falls back to a de-underscored English label if the key is
  // ever missing, matching the previous behaviour.
  const label = t(`status.${status}`, undefined);
  return (
    <span className={`${pillBase} ${COLOR_MAP[status] ?? TONE.muted}`}>
      {label === `status.${status}` ? status.replace("_", " ") : label}
    </span>
  );
}
