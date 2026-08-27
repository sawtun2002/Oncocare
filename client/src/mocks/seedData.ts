import type { Appointment, Invoice, Patient, Role } from "../types";

export interface MockUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  /** PATIENT accounts only: the seedPatients record this login belongs to. */
  patientId?: number;
}

export const seedUsers: MockUser[] = [
  { id: 1, name: "Alex Admin", email: "admin@cancerhms.local", password: "admin123", role: "ADMIN" },
  { id: 2, name: "Dr. Sarah Chen", email: "doctor@cancerhms.local", password: "doctor123", role: "DOCTOR" },
  { id: 3, name: "Dr. Raj Patel", email: "doctor2@cancerhms.local", password: "doctor123", role: "DOCTOR" },
  { id: 4, name: "Nina Nurse", email: "nurse@cancerhms.local", password: "nurse123", role: "NURSE" },
  { id: 5, name: "Rita Receptionist", email: "reception@cancerhms.local", password: "reception123", role: "RECEPTIONIST" },
  { id: 6, name: "John Doe", email: "patient@cancerhms.local", password: "patient123", role: "PATIENT", patientId: 1 },
  { id: 7, name: "Maria Garcia", email: "patient2@cancerhms.local", password: "patient123", role: "PATIENT", patientId: 2 },
];

export const seedPatients: Patient[] = [
  {
    id: 1,
    name: "John Doe",
    dob: "1965-03-12",
    sex: "Male",
    phone: "555-0100",
    address: "123 Main St, Springfield",
    diagnosisType: "Non-Hodgkin Lymphoma",
    diagnosisStage: "Stage II",
    notes: "Sample seeded patient record.",
    assignedDoctorId: 2,
    registeredAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: 2,
    name: "Maria Garcia",
    dob: "1978-11-22",
    sex: "Female",
    phone: "555-0142",
    address: "45 Oak Ave, Springfield",
    diagnosisType: "Breast Cancer",
    diagnosisStage: "Stage I",
    notes: "Responding well to treatment.",
    assignedDoctorId: 3,
    registeredAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: 3,
    name: "David Kim",
    dob: "1952-05-30",
    sex: "Male",
    phone: "555-0187",
    diagnosisType: "Prostate Cancer",
    diagnosisStage: "Stage III",
    assignedDoctorId: 2,
    registeredAt: "2026-08-01T09:00:00.000Z",
  },
];

export const seedAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 2,
    scheduledAt: "2026-08-28T10:00:00.000Z",
    durationMinutes: 30,
    status: "SCHEDULED",
    reason: "Follow-up consultation",
  },
  {
    id: 2,
    patientId: 2,
    doctorId: 3,
    scheduledAt: "2026-08-27T14:00:00.000Z",
    durationMinutes: 45,
    status: "SCHEDULED",
    reason: "Chemotherapy cycle review",
  },
  {
    id: 3,
    patientId: 3,
    doctorId: 2,
    scheduledAt: "2026-08-20T09:30:00.000Z",
    durationMinutes: 30,
    status: "COMPLETED",
    reason: "Initial consultation",
  },
];

export const seedInvoices: Invoice[] = [
  {
    id: 1,
    patientId: 1,
    issuedAt: "2026-08-01T00:00:00.000Z",
    status: "UNPAID",
    items: [
      { id: 1, description: "Consultation fee", quantity: 1, unitPrice: 150 },
      { id: 2, description: "Blood panel", quantity: 1, unitPrice: 85 },
    ],
  },
  {
    id: 2,
    patientId: 2,
    issuedAt: "2026-07-15T00:00:00.000Z",
    status: "PAID",
    items: [
      { id: 3, description: "Chemotherapy session", quantity: 1, unitPrice: 620 },
      { id: 4, description: "Anti-nausea medication", quantity: 2, unitPrice: 18 },
    ],
  },
];
