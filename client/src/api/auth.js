import { api, bearer } from "./http";

export async function login(email, password) {
  return api.post("/auth/login", { email, password });
}

export async function signup(input) {
  return api.post("/auth/signup", input);
}

export async function fetchCurrentUser(token) {
  return api.get("/auth/me", { headers: bearer(token) });
}

export async function updateProfile(token, input) {
  return api.patch("/auth/me", input, { headers: bearer(token) });
}

export async function changePassword(token, input) {
  return api.post("/auth/me/password", input, { headers: bearer(token) });
}
