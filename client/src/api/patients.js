import { db, delay, nextId, persist } from "../mocks/db";

/** @typedef {Omit<import("../types").Patient, "id" | "registeredAt">} PatientInput */

export async function listPatients() {
  return delay([...db.patients].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)));
}

export async function getPatient(id) {
  return delay(db.patients.find((p) => p.id === id));
}

export async function createPatient(input) {
  const patient = {
    ...input,
    id: nextId("patient"),
    registeredAt: new Date().toISOString(),
  };
  db.patients.push(patient);
  persist();
  return delay(patient);
}

export async function updatePatient(id, input) {
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
