import { useLanguage } from "../context/LanguageContext";
import { formatDateTime } from "../lib/format";
import { pillBase, TONE } from "../lib/ui";

// verb key shown per event type. The first ACCEPTED on an appointment is its
// creation by staff, which reads better as "Booked" than "Accepted".
function verbKey(type, isFirst) {
  if (type === "ACCEPTED") return isFirst ? "tl.booked" : "tl.accepted";
  return {
    REQUESTED: "tl.requested",
    DECLINED: "tl.declined",
    RESCHEDULED: "tl.rescheduled",
    CANCELLED: "tl.cancelled",
    COMPLETED: "tl.completed",
    NO_SHOW: "tl.noShow",
  }[type];
}

/**
 * An appointment's `events` history as a vertical thread. Shared by the staff
 * patient record and the patient's own booking view, so both always describe a
 * given change the same way. Read-only -- it renders history, it does not act.
 */
export function AppointmentTimeline({ events }) {
  const { t } = useLanguage();
  if (!events?.length) return null;

  function verbFor(type, isFirst) {
    const key = verbKey(type, isFirst);
    return key ? t(key) : type;
  }
  function byPhrase(role) {
    if (!role) return t("tl.automatically");
    const who = t(`tl.role${role}`);
    return t("tl.by", { who: who === `tl.role${role}` ? role.toLowerCase() : who });
  }

  return (
    <ol className="space-y-3">
      {events.map((ev, i) => (
        <li key={`${ev.at}-${i}`} className="relative pl-5 text-sm">
          <span
            aria-hidden="true"
            className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-frost-400"
          />
          {i < events.length - 1 && (
            <span aria-hidden="true" className="absolute left-[3px] top-3.5 h-full w-px bg-hairline/70" />
          )}

          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-medium text-ink-900">{verbFor(ev.type, i === 0)}</span>
            <span className="text-ink-400">{byPhrase(ev.byRole)}</span>
            {ev.lateNotice && (
              <span className={`${pillBase} ${TONE.warning}`}>{t("tl.lateNotice")}</span>
            )}
            <span className="ml-auto text-xs text-ink-400">{formatDateTime(ev.at)}</span>
          </div>

          {ev.type === "RESCHEDULED" && ev.fromScheduledAt && (
            <p className="mt-0.5 text-ink-700">
              {formatDateTime(ev.fromScheduledAt)} → {formatDateTime(ev.toScheduledAt)}
            </p>
          )}
          {ev.reason && <p className="mt-0.5 text-ink-700">“{ev.reason}”</p>}
        </li>
      ))}
    </ol>
  );
}
