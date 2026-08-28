import {
  seedAppointments,
  seedDoctorProfiles,
  seedInvoices,
  seedLeaveRequests,
  seedPatients,
  seedUsers,
} from "./seedData";

// Bump this whenever the seeded shape changes, or returning users load a stale
// DB from localStorage. v2 added PATIENT accounts with a `patientId` link.
// v3 added a "user" nextId kind for account creation (signup / staff accounts).
// v4 added doctorProfiles (the patient-facing doctor directory).
// v5 added status/avatarUrl/phone/department/notifyAppointmentReminders/
// lastLoginAt to users. Same pattern as every bump before it: a returning
// visitor's v4 localStorage is simply abandoned in favour of the v5 seed, not
// migrated -- so toUser() in api/auth.js and api/users.js can trust every
// field is present without a defensive default.
// v6 added emergencyContactName/emergencyContactPhone/bloodType/allergies/
// medicalHistory to patients -- all optional, so no defaulting is needed
// anywhere that reads them, but the bump still applies for the same reason
// as v5: a returning visitor's v5 localStorage lacks the new seed content
// (John Doe's allergy, Maria's blood type, etc.) that demos the feature.
// v7 turned appointments into a state machine: added REQUESTED/DECLINED
// statuses, a required `events[]` history on every appointment, and an
// `expiresAt` on requests. A v6 appointment has no `events` array, which the
// timeline and the accept/decline flow both assume is present -- so, same as
// every bump before, the v6 store is abandoned for the v7 seed rather than
// migrated.
// v8 added the leaveRequests array (staff time-off) and its nextId kind. A v7
// store has no leaveRequests key, which listLeaveRequests would spread as
// undefined -- so the v7 store is dropped for the v8 seed like every bump before.
// v9 added address/nrc to staff users and nrc to patients -- all optional, so
// nothing needs a defensive default, but the bump still applies so a returning
// visitor picks up the seeded values the staff detail dialog and patient record
// now display.
// v10 gave invoices a required `events[]` history (who marked it paid/unpaid, and
// when). A v9 invoice has no `events` array, which the receipt dialog assumes is
// present -- so the v9 store is dropped for the v10 seed like every bump before.
const STORAGE_KEY = "cancer-hms-mock-db-v10";

/**
 * @typedef {Object} MockDb
 * @property {import("./seedData").MockUser[]} users
 * @property {import("../types").DoctorProfile[]} doctorProfiles
 * @property {import("../types").Patient[]} patients
 * @property {import("../types").Appointment[]} appointments
 * @property {import("../types").Invoice[]} invoices
 * @property {import("../types").LeaveRequest[]} leaveRequests
 * @property {{user: number, patient: number, appointment: number, invoice: number, invoiceItem: number, leaveRequest: number}} nextIds
 */

/** @returns {MockDb} */
function loadInitial() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through to seed
    }
  }
  return {
    users: seedUsers,
    doctorProfiles: seedDoctorProfiles,
    patients: seedPatients,
    appointments: seedAppointments,
    invoices: seedInvoices,
    leaveRequests: seedLeaveRequests,
    nextIds: {
      user: seedUsers.length + 1,
      patient: seedPatients.length + 1,
      appointment: seedAppointments.length + 1,
      invoice: seedInvoices.length + 1,
      invoiceItem: seedInvoices.flatMap((i) => i.items).length + 1,
      leaveRequest: seedLeaveRequests.length + 1,
    },
  };
}

export const db = loadInitial();

export function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetMockDb() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(db, loadInitial());
}

export function nextId(kind) {
  const id = db.nextIds[kind];
  db.nextIds[kind] += 1;
  return id;
}

/**
 * Simulates network latency so loading states behave like a real API. Kept
 * low -- enough that a skeleton renders and the layout doesn't jump on first
 * load, without every click feeling like it stalls. The old 350ms default was
 * slow enough to see on purpose, but it's the main reason the app felt laggy
 * once several screens were fetching. A real fast backend lands around here.
 */
export function delay(value, ms = 90) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
