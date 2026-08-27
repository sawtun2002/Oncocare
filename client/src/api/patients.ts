import { db, delay, nextId, persist } from "../mocks/db";
import type { Patient } from "../types";

export type PatientInput = Omit<Patient, "id" | "registeredAt">;

export async function listPatients(): Promise<Patient[]> {
  return delay([...db.patients].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)));
}

export async function getPatient(id: number): Promise<Patient | undefined> {
  return delay(db.patients.find((p) => p.id === id));
}

export async function createPatient(input: PatientInput): Promise<Patient> {
  const patient: Patient = {
    ...input,
    id: nextId("patient"),
    registeredAt: new Date().toISOString(),
  };
  db.patients.push(patient);
  persist();
  return delay(patient);
}

export async function updatePatient(id: number, input: Partial<PatientInput>): Promise<Patient> {
  const patient = db.patients.find((p) => p.id === id);
  if (!patient) {
    return delay(undefined, 200).then(() => {
      throw new Error("Patient not found");
    });
  }
  Object.assign(patient, input);
  persist();
  return delay(patient);
}
