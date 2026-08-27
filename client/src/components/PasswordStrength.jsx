import { hintText, okText } from "../lib/ui";

// Meter fill per evaluatePassword() score (0-4): width + colour. Score 0 has
// no width class, so the bar is simply empty until the first character.
const STRENGTH_FILL = [
  "bg-ice-300",
  "w-1/4 bg-rose-500",
  "w-2/4 bg-amber-500",
  "w-3/4 bg-frost-500",
  "w-full bg-emerald-500",
];

/**
 * Live strength bar + requirement checklist for a password field. `result` is
 * an `evaluatePassword()` return (see `lib/validation.js`). Shared by the
 * signup form (`LoginPage`) and the change-password card (`ProfilePage`);
 * render it only once the field is non-empty.
 */
export function PasswordStrength({ result }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ice-200">
          <div
            className={`h-full rounded-full transition-all duration-300 ${STRENGTH_FILL[result.score]}`}
          />
        </div>
        <span
          aria-live="polite"
          className="w-16 shrink-0 text-right text-xs font-medium text-ink-400"
        >
          {result.label}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-2">
        {result.rules.map((rule) => (
          <li key={rule.id} className={rule.ok ? okText : hintText}>
            <span aria-hidden="true">{rule.ok ? "✓ " : "• "}</span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
