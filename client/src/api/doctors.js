import { api } from "./http";

export async function listDoctorProfiles() {
  return api.get("/doctors");
}

export async function getDoctorProfile(id) {
  return api.get(`/doctors/${id}`);
}
