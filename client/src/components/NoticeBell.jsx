import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listAppointments } from "../api/appointments";
import { listLeaveRequests } from "../api/leave";
import { listPatients } from "../api/patients";
import { listDoctors, listUsers } from "../api/users";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatDateOnly, formatDateTime } from "../lib/format";
import { noticesFor, unreadCount } from "../lib/notices";

// Where a notice takes you when clicked: the screen that shows it. Leave
// notices are ADMIN-only and belong on /leave; an appointment notice belongs
// on the patient's own bookings list, or the staff bookings page.
function hrefFor(notice, role) {
  if (notice.kind === "leave") return "/leave";
  return role === "PATIENT" ? "/my-bookings" : "/appointments";
}

// One notice, as a sentence. The event log stays neutral ("DECLINED by the
// doctor"); the phrasing that suits *this* viewer lives in the catalog, keyed
// per case so word order is a translator's decision, not a concat.
function describe(notice, user, names, t) {
  if (notice.kind === "leave") {
    const { request } = notice;
    const span =
      request.startDate === request.endDate
        ? formatDateOnly(request.startDate)
        : `${formatDateOnly(request.startDate)}–${formatDateOnly(request.endDate)}`;
    return t(`notice.leaveReq${request.type}`, { name: names.user(request.userId), span });
  }

  const { appointment, event } = notice;
  const when = formatDateTime(appointment.scheduledAt);
  const dr = names.doctor(appointment.doctorId);
  const pt = names.patient(appointment.patientId);
  const isFirst = appointment.events[0] === event;

  switch (event.type) {
    case "REQUESTED":
      return t("notice.apptRequested", { pt, dr, when });
    case "ACCEPTED":
      return isFirst
        ? t("notice.apptBookedForYou", { dr, when })
        : t("notice.apptConfirmed", { dr, when });
    case "DECLINED":
      if (event.byRole == null) {
        // Expired with no response -- phrased for whichever side is reading.
        return user.role === "DOCTOR"
          ? t("notice.apptExpiredDoctor", { pt, when })
          : t("notice.apptExpiredPatient", { dr, when });
      }
      return t("notice.apptDeclined", { dr, when });
    case "RESCHEDULED": {
      const to = event.toScheduledAt ? formatDateTime(event.toScheduledAt) : when;
      return user.role === "PATIENT"
        ? t("notice.apptMovedPatient", { dr, to })
        : t("notice.apptMovedStaff", { pt, dr, to });
    }
    case "CANCELLED":
      return user.role === "PATIENT"
        ? t("notice.apptCancelledPatient", { dr, when })
        : t("notice.apptCancelledStaff", { pt, dr, when });
    default:
      return t("notice.apptUpdate", { dr, when });
  }
}

/**
 * The header notice bell. Its list is derived from queries the app already runs
 * (see lib/notices.js) -- appointment events for most roles, plus the pending
 * leave queue for an ADMIN. The only stored state is `user.notificationsReadAt`,
 * stamped via `markNotificationsRead` the first time the panel is opened with
 * something unread.
 *
 * `align` is the side the 320px dropdown grows *from*: "right" (default) anchors
 * its right edge to the bell and opens leftward -- correct for the mobile
 * header, where the bell sits at the right of a full-width bar. "left" opens
 * rightward -- used in the desktop sidebar, where the bell is near the right
 * edge of a 240px rail and opening leftward would run off the screen.
 */
export function NoticeBell({ align = "right" }) {
  const { user, markNotificationsRead } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  // The `notificationsReadAt` value captured at the moment the panel is opened,
  // held for that one viewing. Opening also stamps a new `notificationsReadAt`
  // (below), so without this snapshot every item would flip to "read" the
  // instant the panel appeared. Instead: this open highlights what arrived
  // since last time, the next open clears it.
  const [seenAt, setSeenAt] = useState(null);
  const rootRef = useRef(null);
  const isStaff = !!user && user.role !== "PATIENT";
  const isAdmin = user?.role === "ADMIN";

  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });
  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: listPatients,
    // Staff only -- a PATIENT never needs the register, and "no user" is not
    // "not a patient".
    enabled: isStaff,
  });
  const leaveQuery = useQuery({
    queryKey: ["leave-requests"],
    queryFn: () => listLeaveRequests({ userId: user.id, role: user.role }),
    enabled: isAdmin,
  });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers(), enabled: isAdmin });

  const notices = useMemo(
    () => noticesFor(appointmentsQuery.data ?? [], user, leaveQuery.data ?? []),
    [appointmentsQuery.data, leaveQuery.data, user]
  );
  const unread = unreadCount(notices, user?.notificationsReadAt);

  useEffect(() => {
    if (!open) return undefined;
    function onDocMouseDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const doctorName = (id) => doctorsQuery.data?.find((d) => d.id === id)?.name ?? `Doctor #${id}`;
  const patientName = (id) => patientsQuery.data?.find((p) => p.id === id)?.name ?? `Patient #${id}`;
  const staffName = (id) => usersQuery.data?.find((u) => u.id === id)?.name ?? `#${id}`;

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    // Freeze what counts as "new" for this viewing before we mark everything read.
    setSeenAt(user?.notificationsReadAt ?? null);
    if (unread > 0) {
      // A failed stamp isn't worth interrupting anyone -- the badge just stays
      // until the next successful open.
      try {
        await markNotificationsRead();
      } catch {
        /* ignore */
      }
    }
  }

  const shown = notices.slice(0, 20);
  const names = { doctor: doctorName, patient: patientName, user: staffName };
  const isLoading = appointmentsQuery.isLoading || doctorsQuery.isLoading || (isStaff && patientsQuery.isLoading);
  const hasError = appointmentsQuery.isError || doctorsQuery.isError || (isStaff && patientsQuery.isError);
  const isUnread = (n) => !seenAt || n.at > seenAt;
  const newCount = shown.filter(isUnread).length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? t("notice.ariaUnread", { count: unread }) : t("notice.title")}
        aria-expanded={open}
        className="relative rounded-lg p-2 text-ink-700 transition hover:bg-surface/70 focus:outline-none focus:ring-2 focus:ring-frost-400/50"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`glass-panel-solid absolute z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden bg-surface text-sm shadow-xl ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="flex items-baseline justify-between border-b border-ice-200 px-4 py-2.5">
            <span className="font-semibold text-ink-900">{t("notice.title")}</span>
            {newCount > 0 && (
              <span className="text-xs font-medium text-frost-600">{t("notice.new", { count: newCount })}</span>
            )}
          </div>
          {isLoading ? (
            <ul className="space-y-3 px-4 py-4" aria-label={t("notice.loading")}>
              {[1, 2, 3].map((item) => (
                <li key={item} className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-ice-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-ice-200" />
                </li>
              ))}
            </ul>
          ) : hasError ? (
            <p className="px-4 py-6 text-center text-sm text-ink-400">{t("notice.unavailable")}</p>
          ) : shown.length === 0 ? (
            <p className="px-4 py-6 text-center text-ink-400">{t("notice.allCaught")}</p>
          ) : (
            <ul className="max-h-96 divide-y divide-ice-200 overflow-y-auto">
              {shown.map((n) => {
                const fresh = isUnread(n);
                return (
                  <li key={n.key}>
                    <Link
                      to={hrefFor(n, user?.role)}
                      onClick={() => setOpen(false)}
                      className={`flex gap-2.5 px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-frost-400/50 ${
                        fresh
                          ? "bg-frost-300/10 hover:bg-frost-300/20"
                          : "hover:bg-ice-100"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          fresh ? "bg-frost-500" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0">
                        {fresh && <span className="sr-only">{t("notice.unread")}</span>}
                        <p className={fresh ? "font-medium text-ink-900" : "text-ink-700"}>
                          {describe(n, user, names, t)}
                        </p>
                        {n.kind === "appointment" && n.event.reason && (
                          <p className="mt-0.5 text-xs text-ink-400">“{n.event.reason}”</p>
                        )}
                        <p className="mt-1 text-xs text-ink-400">{formatDateTime(n.at)}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor">
      <path
        d="M6 8a6 6 0 0 1 12 0c0 5 1.5 7 1.5 7H4.5S6 13 6 8Z M9.5 19a2.5 2.5 0 0 0 5 0"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
