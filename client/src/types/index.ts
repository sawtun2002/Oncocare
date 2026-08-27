export type Role = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "PATIENT";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  /** Set only on PATIENT accounts: the Patient record this login belongs to. */
  patientId?: number;
}

/** One line of a doctor's training history. */
export interface DoctorEducation {
  degree: string;
  institution: string;
  /** Graduation / completion year. */
  year: number;
}

/**
 * The public-facing profile of a DOCTOR account -- what a patient sees when
 * choosing who to book with. `id` is the doctor's User id.
 *
 * Deliberately separate from `User`: this is CV information served to patients,
 * while `User` is the account record. `name` is duplicated here so the profile
 * endpoint is self-contained and a patient never needs to read the user list.
 */
export interface DoctorProfile {
  id: number;
  name: string;
  specialty: string;
  yearsOfExperience: number;
  /** Newest first. */
  education: DoctorEducation[];
  certifications?: string[];
  languages?: string[];
  bio?: string;
  acceptingNewPatients: boolean;
}

export type Sex = "Male" | "Female" | "Other";

export interface Patient {
  id: number;
  name: string;
  dob: string;
  sex: Sex;
  phone: string;
  address?: string;
  diagnosisType: string;
  diagnosisStage?: string;
  notes?: string;
  assignedDoctorId?: number;
  registeredAt: string;
}

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string;
}

export type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID";

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: number;
  patientId: number;
  issuedAt: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
}
