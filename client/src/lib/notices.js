/**
 * The notice bell, derived -- nothing about a notice is stored. Each
 * `AppointmentEvent` already records who acted, so a notice is just an event on
 * an appointment the signed-in user is a party to, that the user did not cause
 * themselves. The only persisted state is `User.notificationsReadAt`, used by
 * `unreadCount` below.
 *
 * The audience rules here must stay in step with the table in API_CONTRACT.md's
 * "Notices" section -- the Java backend derives the same list server-side.
 */

// Which event types reach which viewer role. A patient hears the fate of their
// request; a doctor hears about new or changed demands on their calendar; a
// receptionist hears only what patients themselves initiate (D6), so they can
// triage requests and re-fill freed slots. ADMIN/NURSE get no appointment
// notices in this version.
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
 * Every notice for `user`, newest first. Each is
 * `{ key, appointmentId, appointment, event }` -- the caller phrases it.
 * @param {import("../types").Appointment[]} appointments
 * @param {import("../types").User | null} user
 */
export function noticesFor(appointments, user) {
  if (!user) return [];
  const out = [];
  for (const appointment of appointments) {
    if (!isParty(appointment, user)) continue;
    appointment.events.forEach((event, i) => {
      if (isForViewer(event, user)) {
        out.push({ key: `${appointment.id}-${i}`, appointmentId: appointment.id, appointment, event });
      }
    });
  }
  out.sort((a, b) => b.event.at.localeCompare(a.event.at));
  return out;
}

/** How many of `notices` land after the account last cleared the bell. */
export function unreadCount(notices, readAt) {
  return notices.filter((n) => !readAt || n.event.at > readAt).length;
}
