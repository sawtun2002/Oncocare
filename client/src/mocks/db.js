import {
  seedAppointments,
  seedDoctorProfiles,
  seedInvoices,
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
const STORAGE_KEY = "cancer-hms-mock-db-v6";

/**
 * @typedef {Object} MockDb
 * @property {import("./seedData").MockUser[]} users
 * @property {import("../types").DoctorProfile[]} doctorProfiles
 * @property {import("../types").Patient[]} patients
 * @property {import("../types").Appointment[]} appointments
 * @property {import("../types").Invoice[]} invoices
 * @property {{user: number, patient: number, appointment: number, invoice: number, invoiceItem: number}} nextIds
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
    nextIds: {
      user: seedUsers.length + 1,
      patient: seedPatients.length + 1,
      appointment: seedAppointments.length + 1,
      invoice: seedInvoices.length + 1,
      invoiceItem: seedInvoices.flatMap((i) => i.items).length + 1,
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

/** Simulates network latency so loading states behave like a real API. */
export function delay(value, ms = 350) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
