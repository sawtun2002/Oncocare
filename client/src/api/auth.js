import { db, delay, nextId, persist } from "../mocks/db";

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {import("../types").User} user
 */

/**
 * @typedef {Object} ProfileInput
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {Object} PasswordChangeInput
 * @property {string} currentPassword
 * @property {string} newPassword
 */

/**
 * @typedef {Object} SignupInput
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} dob
 * @property {import("../types").Sex} sex
 * @property {string} phone
 */

function toUser(m) {
  // patientId must survive: it is how a PATIENT session knows which record is
  // theirs. Password is the only field deliberately dropped.
  return { id: m.id, name: m.name, email: m.email, role: m.role, patientId: m.patientId };
}

function findByEmail(email) {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * The account a session token belongs to. The token is the only thing that says
 * whose account this is -- no function here takes a user id, which is what
 * stops a caller editing someone else's login by passing a different one.
 */
function userForToken(token) {
  const id = Number(String(token).replace("mock-token-", ""));
  return db.users.find((u) => u.id === id);
}

export async function login(email, password) {
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
export async function signup(input) {
  if (findByEmail(input.email)) {
    return delay(undefined, 250).then(() => {
      throw new Error("An account with this email already exists.");
    });
  }

  const patient = {
    id: nextId("patient"),
    name: input.name,
    dob: input.dob,
    sex: input.sex,
    phone: input.phone,
    diagnosisType: "Not yet assessed",
    registeredAt: new Date().toISOString(),
  };
  db.patients.push(patient);

  const user = {
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

export async function fetchCurrentUser(token) {
  const match = userForToken(token);
  if (!match) {
    return delay(undefined, 200).then(() => {
      throw new Error("Session expired");
    });
  }
  return delay(toUser(match));
}

/**
 * Update the signed-in account's own details. Name and email only: a patient's
 * phone and address belong to their Patient record, not to their login, and are
 * edited from the patient register.
 */
export async function updateProfile(token, input) {
  const match = userForToken(token);
  if (!match) {
    return delay(undefined, 200).then(() => {
      throw new Error("Session expired");
    });
  }

  const existing = findByEmail(input.email);
  if (existing && existing.id !== match.id) {
    return delay(undefined, 250).then(() => {
      throw new Error("An account with this email already exists.");
    });
  }

  match.name = input.name;
  match.email = input.email;
  persist();
  return delay(toUser(match));
}

/**
 * Change the signed-in account's own password. The current password is required
 * even though the session already proves who this is -- it is what makes an
 * unattended, still-signed-in screen not enough to take the account over.
 */
export async function changePassword(token, input) {
  const match = userForToken(token);
  if (!match) {
    return delay(undefined, 200).then(() => {
      throw new Error("Session expired");
    });
  }

  if (match.password !== input.currentPassword) {
    return delay(undefined, 250).then(() => {
      throw new Error("Your current password is not correct.");
    });
  }

  match.password = input.newPassword;
  persist();
  return delay(undefined);
}
