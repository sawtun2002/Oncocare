import { api } from "./http";

export async function listPatients() {
  return api.get("/patients");
}

export async function getPatient(id) {
  return api.get(`/patients/${id}`);
}

export async function createPatient(input) {
  return api.post("/patients", input);
}

export async function updatePatient(id, input) {
  return api.patch(`/patients/${id}`, input);
}
