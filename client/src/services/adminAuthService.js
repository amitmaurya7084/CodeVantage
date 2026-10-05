import api from "./api";

export async function loginAdmin(payload) {
  const { data } = await api.post("/admin/auth/login", payload);
  return data;
}

export async function logoutAdmin() {
  const { data } = await api.post("/admin/auth/logout");
  return data;
}

export async function fetchCurrentAdmin() {
  const { data } = await api.get("/admin/auth/me");
  return data;
}
