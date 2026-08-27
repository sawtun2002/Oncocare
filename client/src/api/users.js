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
  return { id: m.id, name: m.name, email: m.email, role: m.role, patientId: m.patientId };
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
  };
  db.users.push(user);
  persist();
  return delay(toUser(user));
}
