// Use Vite's import.meta.env for environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * @typedef {Object} LoginResponse
 * @property {string} token
 * @property {import("../types").User} user
 */

/**
 * @typedef {Object} ProfileInput
 * @property {string} name
 * @property {string} email
 * @property {string} [phone] Staff accounts only -- omit for a PATIENT.
 * @property {string} [department] Staff accounts only -- omit for a PATIENT.
 */

/**
 * @typedef {Object} PasswordChangeInput
 * @property {string} currentPassword
 * @property {string} newPassword
 */

/**
 * @typedef {Object} AvatarInput
 * @property {string} [avatarUrl] Omit (or send undefined) to remove the photo.
 */

/**
 * @typedef {Object} NotificationPreferencesInput
 * @property {boolean} notifyAppointmentReminders
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
  // Checked only after the credentials already match -- a wrong password gets
  // the same generic "Invalid email or password" either way, so failing here
  // never tells a guesser that this email belongs to a real, deactivated
  // account.
  if (match.status === "INACTIVE") {
    return delay(undefined, 300).then(() => {
      throw new Error("This account has been deactivated. Contact an administrator.");
    });
  }
  match.lastLoginAt = new Date().toISOString();
  persist();
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
    status: "ACTIVE",
    notifyAppointmentReminders: true,
    // Signup logs the account in immediately (see AuthContext.signup()), so
    // this is genuinely their first sign-in, not a placeholder.
    lastLoginAt: new Date().toISOString(),
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
 * Update the signed-in account's own details: name, email, and -- for staff --
 * phone and department. A patient's phone and address belong to their Patient
 * record, not to their login, and are edited from the patient register instead;
 * the frontend simply never sends phone/department for a PATIENT, and this
 * function stores whatever it's given without re-deriving the role itself.
 *
 * Photo (updateAvatar) and the reminders toggle (updateNotificationPreferences)
 * are deliberately separate functions/endpoints, not extra fields here: each is
 * meant to save the instant it changes, rather than waiting on this form's Save
 * button.
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
  match.phone = input.phone;
  match.department = input.department;
  persist();
  return delay(toUser(match));
}

/**
 * Replace the signed-in account's photo. `avatarUrl` is a `data:` URI in the
 * mock -- see the note on User.avatarUrl for how a real backend would differ.
 * Passing undefined removes the photo.
 */
export async function updateAvatar(token, avatarUrl) {
  const match = userForToken(token);
  if (!match) {
    return delay(undefined, 200).then(() => {
      throw new Error("Session expired");
    });
  }
  match.avatarUrl = avatarUrl;
  persist();
  return delay(toUser(match));
}

/**
 * The signed-in account's own notification preferences. One field today
 * (appointment reminders); mock-only, since there is no real email backend yet
 * to act on it.
 */
export async function updateNotificationPreferences(token, input) {
  const match = userForToken(token);
  if (!match) {
    return delay(undefined, 200).then(() => {
      throw new Error("Session expired");
    });
  }
  match.notifyAppointmentReminders = input.notifyAppointmentReminders;
  persist();
  return delay(toUser(match));
}

/**
 * Stamp the signed-in account's notice bell as read, up to now. The bell's
 * unread count is "appointment events after this timestamp" -- there is no
 * per-notice read state, by design (see the Notices note in API_CONTRACT.md).
 */
export async function markNotificationsRead(token) {
  const match = userForToken(token);
  if (!match) {
    return delay(undefined, 200).then(() => {
      throw new Error("Session expired");
    });
  }
  match.notificationsReadAt = new Date().toISOString();
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
