import { db, delay, nextId, persist } from "../mocks/db";

/**
 * Every role except PATIENT. Patient accounts are created only via auth.signup().
 * @typedef {Exclude<import("../types").Role, "PATIENT">} StaffRole
 */

/**
 * @typedef {Object} StaffUserInput
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {StaffRole} role
 */

function toUser(m) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    patientId: m.patientId,
    status: m.status,
    avatarUrl: m.avatarUrl,
    phone: m.phone,
    department: m.department,
    notifyAppointmentReminders: m.notifyAppointmentReminders,
    lastLoginAt: m.lastLoginAt,
    notificationsReadAt: m.notificationsReadAt,
  };
}

export async function listUsers(role) {
  const users = db.users.filter((u) => !role || u.role === role).map(toUser);
  return delay(users);
}

export async function listDoctors() {
  return listUsers("DOCTOR");
}

/**
 * Creates a staff login (ADMIN, DOCTOR, NURSE or RECEPTIONIST). Never PATIENT
 * -- patient accounts are created only via auth.signup().
 */
export async function createStaffUser(input) {
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    return delay(undefined, 250).then(() => {
      throw new Error("An account with this email already exists.");
    });
  }

  const user = {
    id: nextId("user"),
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    status: "ACTIVE",
    notifyAppointmentReminders: true,
  };
  db.users.push(user);
  persist();
  return delay(toUser(user));
}

/**
 * ADMIN deactivates or reactivates a staff login. This flips `status` only --
 * it never touches the record itself or anything that references it (a
 * doctor's assigned patients, past and future appointments), which is the
 * whole point of a status flip instead of a delete. A deactivated account
 * cannot sign in (see auth.login()) and drops out of the doctor pickers used
 * for *new* assignments/bookings (see the note at SlotPicker) -- existing ones
 * are unaffected.
 */
export async function updateUserStatus(id, status) {
  const user = db.users.find((u) => u.id === id);
  if (!user) {
    return delay(undefined, 200).then(() => {
      throw new Error("User not found");
    });
  }
  user.status = status;
  persist();
  return delay(toUser(user));
}
