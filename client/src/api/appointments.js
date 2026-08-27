import { db, delay, nextId, persist } from "../mocks/db";

/** @typedef {Omit<import("../types").Appointment, "id" | "status">} AppointmentInput */

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
const SLOT_TAKEN_MESSAGE = "That time slot is no longer available";

function endOf(startIso, durationMinutes) {
  return new Date(startIso).getTime() + durationMinutes * MINUTE_MS;
}

/** Two bookings clash when they overlap at all, not only when they start together. */
function overlaps(aStart, aMinutes, bStart, bMinutes) {
  return new Date(aStart).getTime() < endOf(bStart, bMinutes) && new Date(bStart).getTime() < endOf(aStart, aMinutes);
}

/**
 * The booking that blocks this doctor at this time, if any. Cancelled bookings
 * free their slot; `ignoreId` lets an appointment be rescheduled without
 * clashing with itself.
 */
function conflictingAppointment(doctorId, scheduledAt, durationMinutes, ignoreId) {
  return db.appointments.find(
    (a) =>
      a.doctorId === doctorId &&
      a.id !== ignoreId &&
      a.status !== "CANCELLED" &&
      overlaps(a.scheduledAt, a.durationMinutes, scheduledAt, durationMinutes)
  );
}

export async function listAppointments() {
  return delay(
    [...db.appointments].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  );
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

export async function createAppointment(input) {
  // Checked here, not just in the UI: two people can pick the same slot from two
  // browsers, and the layer that owns the data is the one that has to refuse.
  if (conflictingAppointment(input.doctorId, input.scheduledAt, input.durationMinutes)) {
    return delay(undefined, 200).then(() => {
      throw new Error(SLOT_TAKEN_MESSAGE);
    });
  }

  const appointment = {
    ...input,
    id: nextId("appointment"),
    status: "SCHEDULED",
  };
  db.appointments.push(appointment);
  persist();
  return delay(appointment);
}

export async function updateAppointment(id, input) {
  const appointment = db.appointments.find((a) => a.id === id);
  if (!appointment) {
    return delay(undefined, 200).then(() => {
      throw new Error("Appointment not found");
    });
  }

  const movesBooking =
    input.scheduledAt !== undefined || input.durationMinutes !== undefined || input.doctorId !== undefined;
  if (movesBooking) {
    const doctorId = input.doctorId ?? appointment.doctorId;
    const scheduledAt = input.scheduledAt ?? appointment.scheduledAt;
    const durationMinutes = input.durationMinutes ?? appointment.durationMinutes;
    if (conflictingAppointment(doctorId, scheduledAt, durationMinutes, appointment.id)) {
      return delay(undefined, 200).then(() => {
        throw new Error(SLOT_TAKEN_MESSAGE);
      });
    }
  }

  Object.assign(appointment, input);
  persist();
  return delay(appointment);
}

export async function updateAppointmentStatus(id, status) {
  const appointment = db.appointments.find((a) => a.id === id);
  if (!appointment) {
    return delay(undefined, 200).then(() => {
      throw new Error("Appointment not found");
    });
  }

  // Reviving a cancelled booking has to re-check the slot: it was released when
  // it was cancelled, and someone else may have taken it since.
  if (appointment.status === "CANCELLED" && status !== "CANCELLED") {
    const clash = conflictingAppointment(
      appointment.doctorId,
      appointment.scheduledAt,
      appointment.durationMinutes,
      appointment.id
    );
    if (clash) {
      return delay(undefined, 200).then(() => {
        throw new Error(SLOT_TAKEN_MESSAGE);
      });
    }
  }

  appointment.status = status;
  persist();
  return delay(appointment);
}
