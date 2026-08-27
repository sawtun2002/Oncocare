export type Role = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "PATIENT";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  /** Set only on PATIENT accounts: the Patient record this login belongs to. */
  patientId?: number;
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
