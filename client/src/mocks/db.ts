import type { Appointment, Invoice, Patient } from "../types";
import { type MockUser, seedAppointments, seedInvoices, seedPatients, seedUsers } from "./seedData";

// Bump this whenever the seeded shape changes, or returning users load a stale
// DB from localStorage. v2 added PATIENT accounts with a `patientId` link.
// v3 added a "user" nextId kind for account creation (signup / staff accounts).
const STORAGE_KEY = "cancer-hms-mock-db-v3";

interface MockDb {
  users: MockUser[];
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  nextIds: Record<"user" | "patient" | "appointment" | "invoice" | "invoiceItem", number>;
}

function loadInitial(): MockDb {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as MockDb;
    } catch {
      // fall through to seed
    }
  }
  return {
    users: seedUsers,
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

export const db: MockDb = loadInitial();

export function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetMockDb() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(db, loadInitial());
}

export function nextId(kind: keyof MockDb["nextIds"]): number {
  const id = db.nextIds[kind];
  db.nextIds[kind] += 1;
  return id;
}

/** Simulates network latency so loading states behave like a real API. */
export function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
