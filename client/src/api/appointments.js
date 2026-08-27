import { db, delay, nextId, persist } from "../mocks/db";

/** @typedef {Omit<import("../types").Appointment, "id" | "status" | "events" | "expiresAt">} AppointmentInput */

/**
 * Who is making the change. Stands in for the auth token the real API reads --
 * the same role the backend would take from `Authorization`, plus the caller's
 * own `patientId` so "acting on your own appointment" can be decided here rather
 * than trusted from the body. Staff callers have no `patientId`.
 * @typedef {Object} Actor
 * @property {number} userId
 * @property {import("../types").Role} role
 * @property {number} [patientId]
 */

/**
 * One bookable clinic slot. `start` is an ISO datetime.
 * @typedef {Object} TimeSlot
 * @property {string} start
 * @property {boolean} available
 */

// Clinic hours in local time. Slots run from OPEN up to, but not including, CLOSE.
const CLINIC_OPEN_HOUR = 9;
const CLINIC_CLOSE_HOUR = 17;
export const SLOT_MINUTES = 30;

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const REQUEST_TTL_MS = 48 * HOUR_MS;
const LATE_CANCEL_MS = 24 * HOUR_MS;
const SLOT_TAKEN_MESSAGE = "That time slot is no longer available";
const EXPIRY_REASON = "No response — the request expired";

const nowIso = () => new Date().toISOString();

/**
 * A history entry for `appointment.events`. `actor` is null for a system event
 * (an expired request), which is why byUserId/byRole fall back to null.
 */
function event(type, actor, extra) {
  return {
    type,
    byUserId: actor?.userId ?? null,
    byRole: actor?.role ?? null,
    at: nowIso(),
    ...extra,
  };
}

function endOf(startIso, durationMinutes) {
  return new Date(startIso).getTime() + durationMinutes * MINUTE_MS;
}

/** Two bookings clash when they overlap at all, not only when they start together. */
function overlaps(aStart, aMinutes, bStart, bMinutes) {
  return new Date(aStart).getTime() < endOf(bStart, bMinutes) && new Date(bStart).getTime() < endOf(aStart, aMinutes);
}

/** A REQUESTED appointment that has sat past its expiry with no response. */
function isExpiredRequest(a) {
  return a.status === "REQUESTED" && a.expiresAt != null && a.expiresAt <= nowIso();
}

/**
 * Whether an appointment holds its slot against new bookings: SCHEDULED always,
 * REQUESTED until it expires. DECLINED/CANCELLED/COMPLETED/NO_SHOW and an
 * expired request all free it.
 */
function blocksSlot(a) {
  return a.status === "SCHEDULED" || (a.status === "REQUESTED" && !isExpiredRequest(a));
}

/**
 * The booking that blocks this doctor at this time, if any. `ignoreId` lets an
 * appointment be rescheduled or accepted without clashing with itself.
 */
function conflictingAppointment(doctorId, scheduledAt, durationMinutes, ignoreId) {
  return db.appointments.find(
    (a) =>
      a.doctorId === doctorId &&
      a.id !== ignoreId &&
      blocksSlot(a) &&
      overlaps(a.scheduledAt, a.durationMinutes, scheduledAt, durationMinutes)
  );
}

/**
 * Move any expired REQUESTED appointments to DECLINED with a system event. Runs
 * on every list read -- the mock has no scheduled job, so expiry is settled
 * lazily the next time anyone looks. Returns whether anything changed.
 */
function settleExpiredRequests() {
  let changed = false;
  for (const a of db.appointments) {
    if (isExpiredRequest(a)) {
      a.status = "DECLINED";
      a.events.push(event("DECLINED", null, { reason: EXPIRY_REASON }));
      changed = true;
    }
  }
  return changed;
}

/** Reject with the standard not-found idiom. */
function notFound(what) {
  return delay(undefined, 200).then(() => {
    throw new Error(`${what} not found`);
  });
}

function actsOnOwn(appointment, actor) {
  return actor?.patientId != null && actor.patientId === appointment.patientId;
}

export async function listAppointments() {
  if (settleExpiredRequests()) persist();
  return delay([...db.appointments].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)));
}

/**
 * Bookable slots for one doctor on one day.
 * `date` is a local calendar date, `YYYY-MM-DD`, as produced by a date input.
 */
export async function getAvailability(doctorId, date) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    return delay([], 150);
  }

  const now = Date.now();
  const slots = [];

  for (let hour = CLINIC_OPEN_HOUR; hour < CLINIC_CLOSE_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      const start = new Date(year, month - 1, day, hour, minute, 0, 0);
      const startIso = start.toISOString();
      const taken = Boolean(conflictingAppointment(doctorId, startIso, SLOT_MINUTES));
      // A slot in the past is never bookable, however free the doctor is.
      slots.push({ start: startIso, available: !taken && start.getTime() > now });
    }
  }

  return delay(slots, 200);
}

/**
 * Book an appointment. The status is decided here from the caller's role, never
 * taken from `input`: a PATIENT gets REQUESTED (awaiting the doctor) plus an
 * `expiresAt`; any staff role gets SCHEDULED outright.
 * @param {AppointmentInput} input
 * @param {Actor} actor
 */
export async function createAppointment(input, actor) {
  // Checked here, not just in the UI: two people can pick the same slot from two
  // browsers, and the layer that owns the data is the one that has to refuse.
  if (conflictingAppointment(input.doctorId, input.scheduledAt, input.durationMinutes)) {
    return delay(undefined, 200).then(() => {
      throw new Error(SLOT_TAKEN_MESSAGE);
    });
  }

  const isPatient = actor?.role === "PATIENT";
  const appointment = {
    ...input,
    id: nextId("appointment"),
    status: isPatient ? "REQUESTED" : "SCHEDULED",
    events: [event(isPatient ? "REQUESTED" : "ACCEPTED", actor)],
  };
  if (isPatient) {
    const until = Math.min(Date.now() + REQUEST_TTL_MS, new Date(input.scheduledAt).getTime());
    appointment.expiresAt = new Date(until).toISOString();
  }

  db.appointments.push(appointment);
  persist();
  return delay(appointment);
}

/**
 * A doctor (or admin/reception) accepts a pending request: REQUESTED -> SCHEDULED.
 * The slot is re-checked -- it may have filled while the request sat.
 */
export async function acceptAppointment(id, actor) {
  const appointment = db.appointments.find((a) => a.id === id);
  if (!appointment) return notFound("Appointment");
  if (appointment.status !== "REQUESTED") {
    return delay(undefined, 200).then(() => {
      throw new Error("This request has already been answered.");
    });
  }
  if (
    conflictingAppointment(
      appointment.doctorId,
      appointment.scheduledAt,
      appointment.durationMinutes,
      appointment.id
    )
  ) {
    return delay(undefined, 200).then(() => {
      throw new Error(SLOT_TAKEN_MESSAGE);
    });
  }

  appointment.status = "SCHEDULED";
  appointment.expiresAt = undefined;
  appointment.events.push(event("ACCEPTED", actor));
  persist();
  return delay(appointment);
}

/**
 * Turn a pending request down: REQUESTED -> DECLINED. A reason is required and
 * is kept on the event.
 */
export async function declineAppointment(id, actor, reason) {
  const appointment = db.appointments.find((a) => a.id === id);
  if (!appointment) return notFound("Appointment");
  if (appointment.status !== "REQUESTED") {
    return delay(undefined, 200).then(() => {
      throw new Error("This request has already been answered.");
    });
  }
  if (!reason || !reason.trim()) {
    return delay(undefined, 200).then(() => {
      throw new Error("A reason is required to decline a request.");
    });
  }

  appointment.status = "DECLINED";
  appointment.expiresAt = undefined;
  appointment.events.push(event("DECLINED", actor, { reason: reason.trim() }));
  persist();
  return delay(appointment);
}

/**
 * Reschedule: move the time and/or doctor. The status is untouched, and only a
 * REQUESTED or SCHEDULED appointment may move. A reason is required when the
 * caller is moving an appointment that is not their own.
 * @param {number} id
 * @param {Partial<AppointmentInput> & { reason?: string }} input
 * @param {Actor} actor
 */
export async function updateAppointment(id, input, actor) {
  const appointment = db.appointments.find((a) => a.id === id);
  if (!appointment) return notFound("Appointment");
  if (appointment.status !== "REQUESTED" && appointment.status !== "SCHEDULED") {
    return delay(undefined, 200).then(() => {
      throw new Error("Only an active appointment can be rescheduled.");
    });
  }

  const { reason, ...changes } = input;
  const doctorId = changes.doctorId ?? appointment.doctorId;
  const scheduledAt = changes.scheduledAt ?? appointment.scheduledAt;
  const durationMinutes = changes.durationMinutes ?? appointment.durationMinutes;

  if (!actsOnOwn(appointment, actor) && (!reason || !reason.trim())) {
    return delay(undefined, 200).then(() => {
      throw new Error("A reason is required when rescheduling another person's appointment.");
    });
  }
  if (conflictingAppointment(doctorId, scheduledAt, durationMinutes, appointment.id)) {
    return delay(undefined, 200).then(() => {
      throw new Error(SLOT_TAKEN_MESSAGE);
    });
  }

  const from = appointment.scheduledAt;
  Object.assign(appointment, changes);
  appointment.events.push(
    event("RESCHEDULED", actor, {
      fromScheduledAt: from,
      toScheduledAt: appointment.scheduledAt,
      ...(reason && reason.trim() ? { reason: reason.trim() } : {}),
    })
  );
  persist();
  return delay(appointment);
}

/**
 * The staff-only terminal transitions from SCHEDULED: COMPLETED or NO_SHOW, and
 * only once the slot is in the past. Cancellation is a separate call
 * (`cancelAppointment`) because a PATIENT may do that and the reason rules differ.
 */
export async function updateAppointmentStatus(id, status, actor) {
  const appointment = db.appointments.find((a) => a.id === id);
  if (!appointment) return notFound("Appointment");
  if (status !== "COMPLETED" && status !== "NO_SHOW") {
    return delay(undefined, 200).then(() => {
      throw new Error("Use accept, decline or cancel for that change.");
    });
  }
  if (appointment.status !== "SCHEDULED") {
    return delay(undefined, 200).then(() => {
      throw new Error("Only a scheduled appointment can be closed off.");
    });
  }
  if (new Date(appointment.scheduledAt).getTime() > Date.now()) {
    return delay(undefined, 200).then(() => {
      throw new Error("This appointment hasn't happened yet.");
    });
  }

  appointment.status = status;
  appointment.events.push(event(status, actor));
  persist();
  return delay(appointment);
}

/**
 * Cancel a REQUESTED or SCHEDULED appointment. A PATIENT may cancel their own
 * with no reason; anyone cancelling someone else's must give one. The event is
 * flagged `lateNotice` when it lands under 24h before the slot.
 */
export async function cancelAppointment(id, actor, reason) {
  const appointment = db.appointments.find((a) => a.id === id);
  if (!appointment) return notFound("Appointment");
  if (appointment.status !== "REQUESTED" && appointment.status !== "SCHEDULED") {
    return delay(undefined, 200).then(() => {
      throw new Error("This appointment can no longer be cancelled.");
    });
  }
  if (!actsOnOwn(appointment, actor) && (!reason || !reason.trim())) {
    return delay(undefined, 200).then(() => {
      throw new Error("A reason is required when cancelling another person's appointment.");
    });
  }

  const msUntil = new Date(appointment.scheduledAt).getTime() - Date.now();
  appointment.status = "CANCELLED";
  appointment.expiresAt = undefined;
  appointment.events.push(
    event("CANCELLED", actor, {
      ...(reason && reason.trim() ? { reason: reason.trim() } : {}),
      ...(msUntil > 0 && msUntil < LATE_CANCEL_MS ? { lateNotice: true } : {}),
    })
  );
  persist();
  return delay(appointment);
}
