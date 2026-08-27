import { db, delay, nextId, persist } from "../mocks/db";
import type { MockUser } from "../mocks/seedData";
import type { Patient, Sex, User } from "../types";

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  dob: string;
  sex: Sex;
  phone: string;
}

function toUser(m: (typeof db.users)[number]): User {
  // patientId must survive: it is how a PATIENT session knows which record is
  // theirs. Password is the only field deliberately dropped.
  return { id: m.id, name: m.name, email: m.email, role: m.role, patientId: m.patientId };
}

function findByEmail(email: string): MockUser | undefined {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const match = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!match) {
    return delay(undefined, 300).then(() => {
      throw new Error("Invalid email or password");
    });
  }
  return delay({ token: `mock-token-${match.id}`, user: toUser(match) });
}

/**
 * Public account creation for patients. Always produces a PATIENT account --
 * there is no role on the input. Staff accounts are created separately via
 * createStaffUser(), which only an ADMIN may call.
 *
 * Creates a matching Patient record in the same call so the new account can
 * book immediately: clinical fields start as placeholders and are filled in
 * by staff at the first real visit.
 */
export async function signup(input: SignupInput): Promise<LoginResponse> {
  if (findByEmail(input.email)) {
    return delay(undefined, 250).then(() => {
      throw new Error("An account with this email already exists.");
    });
  }

  const patient: Patient = {
    id: nextId("patient"),
    name: input.name,
    dob: input.dob,
    sex: input.sex,
    phone: input.phone,
    diagnosisType: "Not yet assessed",
    registeredAt: new Date().toISOString(),
  };
  db.patients.push(patient);

  const user: MockUser = {
    id: nextId("user"),
    name: input.name,
    email: input.email,
    password: input.password,
    role: "PATIENT",
    patientId: patient.id,
  };
  db.users.push(user);

  persist();
  return delay({ token: `mock-token-${user.id}`, user: toUser(user) });
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const id = Number(token.replace("mock-token-", ""));
  const match = db.users.find((u) => u.id === id);
  if (!match) {
    return delay(undefined, 200).then(() => {
      throw new Error("Session expired");
    });
  }
  return delay(toUser(match));
}
