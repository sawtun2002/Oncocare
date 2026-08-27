import { db, delay, nextId, persist } from "../mocks/db";
import type { MockUser } from "../mocks/seedData";
import type { Role, User } from "../types";

/** Every role except PATIENT. Patient accounts are created only via auth.signup(). */
export type StaffRole = Exclude<Role, "PATIENT">;

export interface StaffUserInput {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}

function toUser(m: MockUser): User {
  return { id: m.id, name: m.name, email: m.email, role: m.role, patientId: m.patientId };
}

export async function listUsers(role?: Role): Promise<User[]> {
  const users = db.users.filter((u) => !role || u.role === role).map(toUser);
  return delay(users);
}

export async function listDoctors(): Promise<User[]> {
  return listUsers("DOCTOR");
}

/**
 * Creates a staff login (ADMIN, DOCTOR, NURSE or RECEPTIONIST). Never PATIENT
 * -- StaffRole excludes it at the type level, and this is also the server-side
 * rule: patient accounts are created only via auth.signup().
 */
export async function createStaffUser(input: StaffUserInput): Promise<User> {
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    return delay(undefined, 250).then(() => {
      throw new Error("An account with this email already exists.");
    });
  }

  const user: MockUser = {
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
