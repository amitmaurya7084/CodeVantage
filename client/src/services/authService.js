import api from "./api";

export async function registerStudent(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function loginStudent(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function logoutStudent() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function fetchCurrentStudent() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function updateStudentProfile(payload) {
  const { data } = await api.put("/auth/profile", payload);
  return data;
}

export async function uploadStudentProfilePicture(file) {
  const formData = new FormData();
  formData.append("picture", file);
  const { data } = await api.post("/auth/profile/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token, password) {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
}
