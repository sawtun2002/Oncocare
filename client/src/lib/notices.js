/**
 * The notice bell, derived -- nothing about a notice is stored. Each
 * `AppointmentEvent` already records who acted, so a notice is just an event on
 * an appointment the signed-in user is a party to, that the user did not cause
 * themselves; for an ADMIN it is instead a leave request awaiting their
 * decision. The only persisted state is `User.notificationsReadAt`, used by
 * `unreadCount` below.
 *
 * Every notice is `{ key, at, kind, ... }` -- `kind` is "appointment" or
 * "leave", `at` is the timestamp both the sort and the unread cut use. The
 * caller (NoticeBell) turns each into a sentence.
 *
 * The audience rules here must stay in step with API_CONTRACT.md's "Notices"
 * section and Leave section -- the Java backend derives the same list.
 */

// Which appointment-event types reach which viewer role. A patient hears the
// fate of their request; a doctor hears about new or changed demands on their
// calendar; a receptionist hears only what patients themselves initiate (D6).
// ADMIN gets leave notices instead (below); NURSE gets nothing.
const AUDIENCE = {
  PATIENT: ["ACCEPTED", "DECLINED", "RESCHEDULED", "CANCELLED"],
  DOCTOR: ["REQUESTED", "RESCHEDULED", "CANCELLED"],
  RECEPTIONIST: ["REQUESTED", "RESCHEDULED", "CANCELLED"],
};

function isParty(appointment, user) {
  if (user.role === "PATIENT") return appointment.patientId === user.patientId;
  if (user.role === "DOCTOR") return appointment.doctorId === user.id;
  if (user.role === "RECEPTIONIST") return true;
  return false;
}

function isForViewer(event, user) {
  // A system event (no actor -- an expired request) always reaches the two
  // people it affects, regardless of the per-role type filter below.
  if (event.byUserId == null && event.byRole == null) {
    return user.role === "PATIENT" || user.role === "DOCTOR";
  }
  const types = AUDIENCE[user.role];
  if (!types || !types.includes(event.type)) return false;
  // Not the viewer's own action.
  if (event.byUserId != null && event.byUserId === user.id) return false;
  // A receptionist only hears patient-initiated changes.
  if (user.role === "RECEPTIONIST" && event.byRole !== "PATIENT") return false;
  return true;
}

/**
 * Every notice for `user`, newest first.
 * @param {import("../types").Appointment[]} appointments
 * @param {import("../types").User | null} user
 * @param {import("../types").LeaveRequest[]} [leaveRequests] Only read for an ADMIN viewer.
 */
export function noticesFor(appointments, user, leaveRequests = []) {
  if (!user) return [];
  const out = [];

  for (const appointment of appointments) {
    if (!isParty(appointment, user)) continue;
    appointment.events.forEach((event, i) => {
      if (isForViewer(event, user)) {
        out.push({
          key: `appt-${appointment.id}-${i}`,
          at: event.at,
          kind: "appointment",
          appointment,
          event,
        });
      }
    });
  }

  // D6: an ADMIN's bell is the queue of leave requests awaiting their decision.
  if (user.role === "ADMIN") {
    for (const req of leaveRequests) {
      if (req.status === "PENDING" && req.userId !== user.id) {
        out.push({ key: `leave-${req.id}`, at: req.requestedAt, kind: "leave", request: req });
      }
    }
  }

  out.sort((a, b) => b.at.localeCompare(a.at));
  return out;
}

/** How many of `notices` land after the account last cleared the bell. */
export function unreadCount(notices, readAt) {
  return notices.filter((n) => !readAt || n.at > readAt).length;
}
