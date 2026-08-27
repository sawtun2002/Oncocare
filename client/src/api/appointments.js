import { api } from "./http";

export const SLOT_MINUTES = 30;

export async function listAppointments() {
  return api.get("/appointments");
}

export async function getAvailability(doctorId, date) {
  return api.get("/appointments/availability", { params: { doctorId, date } });
}

export async function createAppointment(input) {
  return api.post("/appointments", input);
}

export async function updateAppointment(id, input) {
  return api.patch(`/appointments/${id}`, input);
}

export async function updateAppointmentStatus(id, status) {
  return api.patch(`/appointments/${id}/status`, { status });
}
