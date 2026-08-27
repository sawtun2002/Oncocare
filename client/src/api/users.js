import { api } from "./http";

export async function listUsers(role) {
  return api.get("/users", { params: role ? { role } : undefined });
}

export async function listDoctors() {
  return api.get("/doctors");
}

export async function createStaffUser(input) {
  return api.post("/users", input);
}
